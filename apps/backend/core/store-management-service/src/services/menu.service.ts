import { prisma, Menu, Prisma } from '@shared/database';
import { cacheManager } from '../utils/cache';
import { imageUtils } from '../utils/image';
import {
  MenuCreateRequest,
  MenuUpdateRequest,
  IMenuFilters,
  IPaginationQuery
} from '../types';

export class MenuService {
  async getAll(
    storeId: string,
    filters?: IMenuFilters,
    pagination?: IPaginationQuery
  ): Promise<{
    data: Menu[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    // 필터 조건 생성
    const where: Prisma.MenuWhereInput = {
      storeId,
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.available !== undefined && { isAvailable: filters.available }),
      ...(filters?.tags && { tags: { hasSome: filters.tags } }),
      ...(filters?.minPrice && { price: { gte: filters.minPrice } }),
      ...(filters?.maxPrice && { price: { lte: filters.maxPrice } })
    };

    // 정렬 조건
    const orderBy: Prisma.MenuOrderByWithRelationInput = {};
    if (pagination?.sortBy) {
      orderBy[pagination.sortBy as keyof Prisma.MenuOrderByWithRelationInput] =
        pagination.sortOrder || 'asc';
    } else {
      orderBy.sortOrder = 'asc';
    }

    const [data, total] = await Promise.all([
      prisma.menu.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true
        }
      }),
      prisma.menu.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages
    };
  }

  async getByCategory(storeId: string, categoryId: string): Promise<Menu[]> {
    // 캐시 확인
    const cacheKey = `category_${categoryId}`;
    const cached = await cacheManager.get<Menu[]>(storeId, 'menu', cacheKey);
    if (cached) return cached;

    const menus = await prisma.menu.findMany({
      where: {
        storeId,
        categoryId
      },
      orderBy: {
        sortOrder: 'asc'
      },
      include: {
        category: true
      }
    });

    // 캐시 저장 (30초)
    await cacheManager.set(storeId, 'menu', menus, cacheKey, 30);

    return menus;
  }

  async getById(storeId: string, menuId: string): Promise<Menu | null> {
    // 캐시 확인
    const cached = await cacheManager.get<Menu>(storeId, 'menu', menuId);
    if (cached) return cached;

    const menu = await prisma.menu.findFirst({
      where: {
        id: menuId,
        storeId
      },
      include: {
        category: true
      }
    });

    if (menu) {
      // 캐시 저장
      await cacheManager.set(storeId, 'menu', menu, menuId);
    }

    return menu;
  }

  async create(storeId: string, data: MenuCreateRequest): Promise<Menu> {
    const menu = await prisma.menu.create({
      data: {
        storeId,
        ...data
      },
      include: {
        category: true
      }
    });

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'menus');

    return menu;
  }

  async update(
    storeId: string,
    menuId: string,
    data: MenuUpdateRequest
  ): Promise<Menu> {
    const menu = await prisma.menu.update({
      where: {
        id: menuId,
        storeId
      },
      data,
      include: {
        category: true
      }
    });

    // 캐시 무효화
    await cacheManager.delete(storeId, 'menu', menuId);
    await cacheManager.invalidate(storeId, 'menus');

    return menu;
  }

  async updateAvailability(
    storeId: string,
    menuId: string,
    data: { isAvailable: boolean }
  ): Promise<Menu> {
    const menu = await prisma.menu.update({
      where: {
        id: menuId,
        storeId
      },
      data: {
        isAvailable: data.isAvailable,
        ...(data.isAvailable === false && { stockQuantity: 0 })
      }
    });

    // 캐시 무효화
    await cacheManager.delete(storeId, 'menu', menuId);

    return menu;
  }

  async uploadImage(
    storeId: string,
    menuId: string,
    file: Express.Multer.File
  ): Promise<string> {
    // 기존 이미지 확인
    const menu = await this.getById(storeId, menuId);
    if (!menu) {
      throw new Error('메뉴를 찾을 수 없습니다');
    }

    // 이미지 처리
    const imageUrl = await imageUtils.processMenuImage(file);

    // DB 업데이트
    await prisma.menu.update({
      where: { id: menuId },
      data: { imageUrl }
    });

    // 기존 이미지 삭제
    if (menu.imageUrl) {
      await imageUtils.deleteImage(menu.imageUrl);
    }

    // 캐시 무효화
    await cacheManager.delete(storeId, 'menu', menuId);

    return imageUrl;
  }

  async delete(storeId: string, menuId: string): Promise<void> {
    const menu = await this.getById(storeId, menuId);
    if (!menu) {
      throw new Error('메뉴를 찾을 수 없습니다');
    }

    // 주문 내역 확인
    const orderCount = await prisma.orderItem.count({
      where: { menuId }
    });

    if (orderCount > 0) {
      // Soft delete (비활성화)
      await prisma.menu.update({
        where: { id: menuId },
        data: { isAvailable: false }
      });
    } else {
      // Hard delete
      await prisma.menu.delete({
        where: { id: menuId }
      });

      // 이미지 삭제
      if (menu.imageUrl) {
        await imageUtils.deleteImage(menu.imageUrl);
      }
    }

    // 캐시 무효화
    await cacheManager.delete(storeId, 'menu', menuId);
    await cacheManager.invalidate(storeId, 'menus');
  }

  async bulkUpdateStock(
    storeId: string,
    updates: { menuId: string; stockQuantity: number }[]
  ): Promise<void> {
    await prisma.$transaction(
      updates.map(({ menuId, stockQuantity }) =>
        prisma.menu.update({
          where: { id: menuId, storeId },
          data: {
            stockQuantity,
            isAvailable: stockQuantity > 0
          }
        })
      )
    );

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'menus');
  }
}

export const menuService = new MenuService();