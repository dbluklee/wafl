import { PrismaClient } from '../../../../../node_modules/@prisma/client';
import axios from 'axios';
import config from '../config';

const prisma = new PrismaClient();

interface CustomerFilters {
  page: number;
  limit: number;
  search?: string;
}

interface CreateCustomerData {
  sessionId: string;
  language?: string;
}

interface UpdateCustomerData {
  language?: string;
}

export class CustomerService {
  static async getCustomers(filters: CustomerFilters) {
    const { page, limit, search } = filters;
    const offset = (page - 1) * limit;

    // 검색 조건 구성 (현재 스키마에 맞게 단순화)
    const where: any = {};

    if (search) {
      where.sessionId = { contains: search };
    }

    // 고객 목록 조회
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          sessionId: true,
          language: true,
          createdAt: true,
          orders: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getCustomerById(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        aiConversations: {
          select: {
            id: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!customer) return null;

    return customer;
  }

  static async createCustomer(data: CreateCustomerData) {
    const customerData = {
      sessionId: data.sessionId,
      language: data.language || 'ko'
    };

    // 세션 ID 중복 체크
    const existingCustomer = await prisma.customer.findUnique({
      where: { sessionId: data.sessionId }
    });

    if (existingCustomer) {
      throw new Error('이미 등록된 세션 ID입니다.');
    }

    return await prisma.customer.create({
      data: customerData,
      select: {
        id: true,
        sessionId: true,
        language: true,
        createdAt: true
      }
    });
  }

  static async updateCustomer(customerId: string, data: UpdateCustomerData) {
    // 존재 여부 확인
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!existingCustomer) return null;

    return await prisma.customer.update({
      where: { id: customerId },
      data,
      select: {
        id: true,
        sessionId: true,
        language: true,
        createdAt: true
      }
    });
  }

  static async deleteCustomer(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) return false;

    await prisma.customer.delete({
      where: { id: customerId }
    });

    return true;
  }

  static async getCustomerOrders(customerId: string, page: number, limit: number) {
    try {
      const offset = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { customerId },
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            orderItems: {
              select: {
                quantity: true,
                unitPrice: true,
                menu: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }),
        prisma.order.count({ where: { customerId } })
      ]);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('고객 주문 이력 조회 실패:', error);
      return {
        orders: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      };
    }
  }

  static async getCustomerAnalytics(customerId: string) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          orders: {
            select: {
              totalAmount: true,
              status: true,
              createdAt: true
            }
          }
        }
      });

      if (!customer) return null;

      const orders = customer.orders;
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      return {
        customer: {
          id: customer.id,
          sessionId: customer.sessionId,
          language: customer.language,
          createdAt: customer.createdAt
        },
        stats: {
          totalOrders,
          totalSpent,
          averageOrderValue,
          firstOrder: orders.length > 0 ? orders[orders.length - 1].createdAt : null,
          lastOrder: orders.length > 0 ? orders[0].createdAt : null
        }
      };
    } catch (error) {
      console.error('고객 분석 데이터 조회 실패:', error);
      return null;
    }
  }

  // 포인트 기능은 현재 스키마에 없으므로 더미 구현
  static async updateCustomerTags() {
    throw new Error('태그 기능은 현재 스키마에서 지원되지 않습니다.');
  }

  static async getVipCustomers(limit: number) {
    // VIP 기능은 주문 금액 기준으로 임시 구현
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          select: {
            totalAmount: true
          }
        }
      }
    });

    // 총 주문 금액으로 정렬
    const customersWithTotal = customers.map(customer => ({
      ...customer,
      totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
    })).sort((a, b) => b.totalSpent - a.totalSpent);

    return customersWithTotal.slice(0, limit).map(customer => ({
      id: customer.id,
      sessionId: customer.sessionId,
      language: customer.language,
      totalSpent: customer.totalSpent,
      orderCount: customer.orders.length,
      createdAt: customer.createdAt
    }));
  }

  static async updateCustomerVisit() {
    throw new Error('방문 정보 업데이트는 현재 스키마에서 지원되지 않습니다.');
  }
}