import { prisma } from '@shared/database';
import {
  ICreateOrderRequest,
  IOrderWithItems,
  IOrderFilters,
  IOrderStatistics,
  IUpdateOrderStatusRequest
} from '../types';
import { orderNumberGenerator } from '../utils/orderNumber';
import { cache } from '../utils/cache';
import { emitToStore, emitToTable, emitToKitchen } from '../config/socket';
import { AppError } from '../middlewares/error';
import { config } from '../config';

export class OrderService {
  async create(
    storeId: string,
    data: ICreateOrderRequest
  ): Promise<IOrderWithItems> {
    // 트랜잭션으로 주문 생성
    const order = await prisma.$transaction(async (tx) => {
      // 1. 테이블 상태 확인
      const table = await tx.table.findFirst({
        where: {
          id: data.tableId,
          storeId
        }
      });

      if (!table) {
        throw new AppError('테이블을 찾을 수 없습니다', 404, 'TABLE_NOT_FOUND');
      }

      // 2. 주문 번호 생성
      const orderNumber = await orderNumberGenerator.generate(storeId);

      // 3. 주문 생성
      const order = await tx.order.create({
        data: {
          storeId,
          tableId: data.tableId,
          customerId: data.customerId,
          orderNumber,
          status: 'pending',
          specialRequests: data.specialRequests,
          customerLanguage: data.customerLanguage || 'ko',
          aiInteraction: data.aiInteraction || false,
          totalAmount: 0 // 아이템 추가 후 계산
        }
      });

      // 4. 주문 아이템 생성 및 재고 확인
      let totalAmount = 0;
      const orderItems = [];

      for (const item of data.items) {
        // 메뉴 정보 조회
        const menu = await tx.menu.findFirst({
          where: {
            id: item.menuId,
            storeId
          }
        });

        if (!menu) {
          throw new AppError(`메뉴를 찾을 수 없습니다: ${item.menuId}`, 404, 'MENU_NOT_FOUND');
        }

        if (!menu.isAvailable) {
          throw new AppError(`${menu.name}은(는) 현재 주문할 수 없습니다`, 400, 'MENU_UNAVAILABLE');
        }

        // 재고 확인 및 감소
        if (menu.stockQuantity !== null) {
          if (menu.stockQuantity < item.quantity) {
            throw new AppError(`${menu.name}의 재고가 부족합니다`, 400, 'INSUFFICIENT_STOCK');
          }

          await tx.menu.update({
            where: { id: menu.id },
            data: {
              stockQuantity: menu.stockQuantity - item.quantity
            }
          });
        }

        // 주문 아이템 생성
        const subtotal = menu.price.toNumber() * item.quantity;
        totalAmount += subtotal;

        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuId: menu.id,
            quantity: item.quantity,
            unitPrice: menu.price,
            subtotal,
            options: item.options,
            notes: item.notes
          },
          include: {
            menu: true
          }
        });

        orderItems.push(orderItem);
      }

      // 5. 총 금액 업데이트
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { totalAmount },
        include: {
          orderItems: {
            include: {
              menu: true
            }
          },
          table: true,
          customer: true
        }
      });

      // 6. 테이블 상태 업데이트
      if (table.status === 'empty' || table.status === 'seated') {
        await tx.table.update({
          where: { id: table.id },
          data: { status: 'ordered' }
        });
      }

      return updatedOrder;
    });

    // 7. 주방 큐에 추가
    this.addToKitchenQueue(storeId, order);

    // 8. WebSocket 알림
    emitToStore(storeId, 'order:created', order);
    emitToTable(order.tableId, 'order:created', order);
    emitToKitchen(storeId, 'order:new', this.formatKitchenOrder(order));

    return order;
  }

  async getById(
    storeId: string,
    orderId: string
  ): Promise<IOrderWithItems | null> {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId
      },
      include: {
        orderItems: {
          include: {
            menu: true
          }
        },
        table: true,
        customer: true
      }
    });

    return order as IOrderWithItems;
  }

  async getAll(
    storeId: string,
    filters?: IOrderFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: IOrderWithItems[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const where: any = {
      storeId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.tableId && { tableId: filters.tableId }),
      ...(filters?.orderNumber && {
        orderNumber: { contains: filters.orderNumber }
      }),
      ...(filters?.startDate && filters?.endDate && {
        createdAt: {
          gte: filters.startDate,
          lte: filters.endDate
        }
      })
    };

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          orderItems: {
            include: {
              menu: true
            }
          },
          table: true,
          customer: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as IOrderWithItems[],
      total,
      page,
      totalPages
    };
  }

  async updateStatus(
    storeId: string,
    orderId: string,
    data: IUpdateOrderStatusRequest
  ): Promise<IOrderWithItems> {
    // 주문 확인
    const existingOrder = await this.getById(storeId, orderId);
    if (!existingOrder) {
      throw new AppError('주문을 찾을 수 없습니다', 404, 'ORDER_NOT_FOUND');
    }

    // 상태 전환 검증
    this.validateStatusTransition(existingOrder.status, data.status);

    // 주문 업데이트
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: data.status,
        ...(data.status === 'served' && { completedAt: new Date() })
      },
      include: {
        orderItems: {
          include: {
            menu: true
          }
        },
        table: true,
        customer: true
      }
    });

    // 큐 업데이트
    if (data.status === 'served' || data.status === 'cancelled') {
      this.removeFromKitchenQueue(storeId, orderId);
    } else if (data.status === 'cooking') {
      this.moveToKitchenCooking(storeId, orderId);
    }

    // 테이블 상태 업데이트
    if (data.status === 'served' || data.status === 'cancelled') {
      // 해당 테이블의 다른 활성 주문 확인
      const activeOrders = await prisma.order.count({
        where: {
          tableId: order.tableId,
          id: { not: orderId },
          status: {
            notIn: ['served', 'cancelled']
          }
        }
      });

      if (activeOrders === 0) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'empty' }
        });
      }
    }

    // 재고 복원 (취소 시)
    if (data.status === 'cancelled') {
      for (const item of order.orderItems) {
        if (item.menu.stockQuantity !== null) {
          await prisma.menu.update({
            where: { id: item.menu.id },
            data: {
              stockQuantity: {
                increment: item.quantity
              }
            }
          });
        }
      }
    }

    // WebSocket 알림
    emitToStore(storeId, 'order:status:changed', {
      orderId: order.id,
      oldStatus: existingOrder.status,
      newStatus: data.status
    });
    emitToTable(order.tableId, 'order:status:changed', {
      orderId: order.id,
      status: data.status
    });
    emitToKitchen(storeId, 'order:status:changed', {
      orderId: order.id,
      status: data.status
    });

    return order as IOrderWithItems;
  }

  async cancel(
    storeId: string,
    orderId: string,
    reason?: string
  ): Promise<IOrderWithItems> {
    return this.updateStatus(storeId, orderId, {
      status: 'cancelled',
      reason
    });
  }

  async getTableOrders(
    storeId: string,
    tableId: string
  ): Promise<IOrderWithItems[]> {
    const orders = await prisma.order.findMany({
      where: {
        storeId,
        tableId,
        status: {
          notIn: ['served', 'cancelled']
        }
      },
      include: {
        orderItems: {
          include: {
            menu: true
          }
        },
        table: true,
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return orders as IOrderWithItems[];
  }

  async getStatistics(storeId: string): Promise<IOrderStatistics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      cookingOrders,
      readyOrders,
      completedOrders,
      totalRevenue
    ] = await Promise.all([
      prisma.order.count({
        where: {
          storeId,
          createdAt: { gte: today }
        }
      }),
      prisma.order.count({
        where: {
          storeId,
          status: 'pending'
        }
      }),
      prisma.order.count({
        where: {
          storeId,
          status: 'cooking'
        }
      }),
      prisma.order.count({
        where: {
          storeId,
          status: 'ready'
        }
      }),
      prisma.order.findMany({
        where: {
          storeId,
          status: 'served',
          createdAt: { gte: today }
        },
        select: {
          createdAt: true,
          completedAt: true
        }
      }),
      prisma.order.aggregate({
        where: {
          storeId,
          status: 'served',
          createdAt: { gte: today }
        },
        _sum: {
          totalAmount: true
        }
      })
    ]);

    // 평균 준비 시간 계산
    const prepTimes = completedOrders
      .filter(o => o.completedAt)
      .map(o => {
        const prepTime = o.completedAt!.getTime() - o.createdAt.getTime();
        return prepTime / (1000 * 60); // 분 단위로 변환
      });

    const averagePrepTime = prepTimes.length > 0
      ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length
      : 0;

    return {
      totalOrders,
      pendingOrders,
      cookingOrders,
      readyOrders,
      averagePrepTime: Math.round(averagePrepTime),
      totalRevenue: totalRevenue._sum.totalAmount?.toNumber() || 0
    };
  }

  private validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): void {
    const validTransitions: Record<string, string[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['cooking', 'cancelled'],
      'cooking': ['ready', 'cancelled'],
      'ready': ['served', 'cancelled'],
      'served': [],
      'cancelled': []
    };

    const allowedStatuses = validTransitions[currentStatus] || [];

    if (!allowedStatuses.includes(newStatus)) {
      throw new AppError(
        `잘못된 상태 변경입니다: ${currentStatus} → ${newStatus}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }
  }

  private addToKitchenQueue(storeId: string, order: IOrderWithItems): void {
    const key = `kitchen:${storeId}:pending`;
    const kitchenOrder = this.formatKitchenOrder(order);

    const pendingOrders = cache.get<any[]>(key) || [];
    pendingOrders.push(kitchenOrder);
    cache.set(key, pendingOrders, 24 * 60 * 60); // 24시간
  }

  private removeFromKitchenQueue(storeId: string, orderId: string): void {
    ['pending', 'cooking'].forEach(status => {
      const key = `kitchen:${storeId}:${status}`;
      const orders = cache.get<any[]>(key) || [];
      const filtered = orders.filter(o => o.id !== orderId);
      cache.set(key, filtered, 24 * 60 * 60);
    });
  }

  private moveToKitchenCooking(storeId: string, orderId: string): void {
    // Pending에서 제거
    const pendingKey = `kitchen:${storeId}:pending`;
    const pendingOrders = cache.get<any[]>(pendingKey) || [];
    const order = pendingOrders.find(o => o.id === orderId);

    if (order) {
      const filteredPending = pendingOrders.filter(o => o.id !== orderId);
      cache.set(pendingKey, filteredPending, 24 * 60 * 60);

      // Cooking에 추가
      const cookingKey = `kitchen:${storeId}:cooking`;
      const cookingOrders = cache.get<any[]>(cookingKey) || [];
      cookingOrders.push({
        ...order,
        status: 'cooking',
        startedAt: new Date()
      });
      cache.set(cookingKey, cookingOrders, 24 * 60 * 60);
    }
  }

  private formatKitchenOrder(order: IOrderWithItems): any {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      tableName: order.table?.name,
      items: order.orderItems.map(item => ({
        id: item.id,
        menuName: item.menu.name,
        quantity: item.quantity,
        options: item.options,
        notes: item.notes,
        prepTime: item.menu.prepTime || config.order.defaultPrepTime
      })),
      specialRequests: order.specialRequests,
      status: order.status,
      createdAt: order.createdAt,
      estimatedTime: order.orderItems.reduce((total, item) => {
        return Math.max(total, item.menu.prepTime || config.order.defaultPrepTime);
      }, 0)
    };
  }
}

export const orderService = new OrderService();