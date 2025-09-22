import { prisma, Place } from '@shared/database';
import { cacheManager } from '../utils/cache';
import { PlaceCreateRequest, PlaceUpdateRequest } from '../types';

export class PlaceService {
  async getAll(storeId: string): Promise<Place[]> {
    // 캐시 확인
    const cached = await cacheManager.get<Place[]>(storeId, 'places');
    if (cached) return cached;

    const places = await prisma.place.findMany({
      where: { storeId },
      include: {
        _count: {
          select: { tables: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // 캐시 저장
    await cacheManager.set(storeId, 'places', places);

    return places;
  }

  async getById(storeId: string, placeId: string): Promise<Place | null> {
    return prisma.place.findFirst({
      where: {
        id: placeId,
        storeId
      },
      include: {
        tables: true
      }
    });
  }

  async create(storeId: string, data: PlaceCreateRequest): Promise<Place> {
    const place = await prisma.place.create({
      data: {
        storeId,
        ...data
      }
    });

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'places');

    return place;
  }

  async update(
    storeId: string,
    placeId: string,
    data: PlaceUpdateRequest
  ): Promise<Place> {
    const place = await prisma.place.update({
      where: {
        id: placeId,
        storeId
      },
      data
    });

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'places');

    return place;
  }

  async delete(storeId: string, placeId: string): Promise<void> {
    // 테이블 확인
    const tableCount = await prisma.table.count({
      where: {
        placeId,
        storeId
      }
    });

    if (tableCount > 0) {
      throw new Error('테이블이 있는 장소는 삭제할 수 없습니다');
    }

    await prisma.place.delete({
      where: {
        id: placeId,
        storeId
      }
    });

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'places');
  }
}

export const placeService = new PlaceService();