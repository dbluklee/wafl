import { prisma, Category } from '@shared/database';
import { cacheManager } from '../utils/cache';
import { ICategoryCreateRequest, ICategoryUpdateRequest } from '../types';

export class CategoryService {
  async getAll(storeId: string): Promise<Category[]> {
    // 캐시 확인
    const cached = await cacheManager.get<Category[]>(storeId, 'categories');
    if (cached) return cached;

    const categories = await prisma.category.findMany({
      where: {
        storeId,
        isActive: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        _count: {
          select: { menus: true }
        }
      }
    });

    // 캐시 저장
    await cacheManager.set(storeId, 'categories', categories);

    return categories;
  }

  async getById(storeId: string, categoryId: string): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        id: categoryId,
        storeId
      }
    });
  }

  async create(storeId: string, data: ICategoryCreateRequest): Promise<Category> {
    const category = await prisma.category.create({
      data: {
        storeId,
        ...data
      }
    });

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'categories');

    return category;
  }

  async update(
    storeId: string,
    categoryId: string,
    data: ICategoryUpdateRequest
  ): Promise<Category> {
    const category = await prisma.category.update({
      where: {
        id: categoryId,
        storeId
      },
      data
    });

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'categories');

    return category;
  }

  async delete(storeId: string, categoryId: string): Promise<void> {
    // 카테고리에 속한 메뉴 확인
    const menuCount = await prisma.menu.count({
      where: {
        categoryId,
        storeId
      }
    });

    if (menuCount > 0) {
      throw new Error('메뉴가 있는 카테고리는 삭제할 수 없습니다');
    }

    await prisma.category.delete({
      where: {
        id: categoryId,
        storeId
      }
    });

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'categories');
  }

  async reorder(storeId: string, orders: { id: string; sortOrder: number }[]): Promise<void> {
    await prisma.$transaction(
      orders.map(({ id, sortOrder }) =>
        prisma.category.update({
          where: { id, storeId },
          data: { sortOrder }
        })
      )
    );

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'categories');
  }
}

export const categoryService = new CategoryService();