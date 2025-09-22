import { prisma, Table, Prisma } from '@shared/database';
import { cacheManager } from '../utils/cache';
import { qrCodeUtils } from '../utils/qrcode';
import { TableCreateRequest, TableUpdateRequest, ITableFilters } from '../types';

export class TableService {
  async getAll(storeId: string, filters?: ITableFilters): Promise<Table[]> {
    // 캐시 키
    const cacheKey = filters ? `tables:${JSON.stringify(filters)}` : 'tables';

    // 캐시 확인
    const cached = await cacheManager.get<Table[]>(storeId, cacheKey);
    if (cached) return cached;

    // 필터 조건
    const where: Prisma.TableWhereInput = {
      storeId,
      ...(filters?.placeId && { placeId: filters.placeId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.minCapacity && { capacity: { gte: filters.minCapacity } })
    };

    const tables = await prisma.table.findMany({
      where,
      include: {
        place: true
      },
      orderBy: [
        { place: { createdAt: 'asc' } },
        { name: 'asc' }
      ]
    });

    // 캐시 저장
    await cacheManager.set(storeId, cacheKey, tables);

    return tables;
  }

  async getByPlace(storeId: string, placeId: string): Promise<Table[]> {
    // 캐시 확인
    const cacheKey = `place_${placeId}`;
    const cached = await cacheManager.get<Table[]>(storeId, 'table', cacheKey);
    if (cached) return cached;

    const tables = await prisma.table.findMany({
      where: {
        storeId,
        placeId
      },
      include: {
        place: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // 캐시 저장 (30초)
    await cacheManager.set(storeId, 'table', tables, cacheKey, 30);

    return tables;
  }

  async getById(storeId: string, tableId: string): Promise<Table | null> {
    return prisma.table.findFirst({
      where: {
        id: tableId,
        storeId
      },
      include: {
        place: true
      }
    });
  }

  async create(storeId: string, data: TableCreateRequest): Promise<{
    table: Table;
    qrCode: string;
  }> {
    // 매장 정보 조회
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      throw new Error('매장 정보를 찾을 수 없습니다');
    }

    // 테이블 번호 추출 (예: "Table 5" -> 5)
    const tableNumber = parseInt(data.name.replace(/[^0-9]/g, '')) || 1;

    // QR 코드 생성
    const qrString = qrCodeUtils.generateQRString(store.storeCode, tableNumber);

    // 테이블 생성
    const table = await prisma.table.create({
      data: {
        storeId,
        placeId: data.placeId,
        name: data.name,
        capacity: data.diningCapacity,
        qrCode: qrString,
        status: 'empty'
      },
      include: {
        place: true
      }
    });

    // QR 코드 이미지 생성
    const qrCodeImage = await qrCodeUtils.generateQRCode(table.id, qrString);

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'tables');

    return {
      table,
      qrCode: qrCodeImage
    };
  }

  async update(
    storeId: string,
    tableId: string,
    data: TableUpdateRequest
  ): Promise<Table> {
    const table = await prisma.table.update({
      where: {
        id: tableId,
        storeId
      },
      data,
      include: {
        place: true
      }
    });

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'tables');

    return table;
  }

  async updateStatus(
    storeId: string,
    tableId: string,
    status: 'empty' | 'seated' | 'ordered'
  ): Promise<Table> {
    const table = await prisma.table.update({
      where: {
        id: tableId,
        storeId
      },
      data: { status }
    });

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'tables');

    // 실시간 알림 (Redis Pub/Sub 비활성화됨)
    console.log(`Table ${tableId} status changed to ${status} for store ${storeId}`);

    return table;
  }

  async regenerateQR(storeId: string, tableId: string): Promise<string> {
    const table = await this.getById(storeId, tableId);
    if (!table) {
      throw new Error('테이블을 찾을 수 없습니다');
    }

    // 매장 정보 조회
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      throw new Error('매장 정보를 찾을 수 없습니다');
    }

    // 새 QR 코드 생성
    const tableNumber = parseInt(table.name.replace(/[^0-9]/g, '')) || 1;
    const qrString = qrCodeUtils.generateQRString(store.storeCode, tableNumber);

    // DB 업데이트
    await prisma.table.update({
      where: { id: tableId },
      data: { qrCode: qrString }
    });

    // QR 이미지 생성
    const qrCodeImage = await qrCodeUtils.generateQRCode(tableId, qrString);

    return qrCodeImage;
  }

  async delete(storeId: string, tableId: string): Promise<void> {
    // 주문 확인
    const orderCount = await prisma.order.count({
      where: { tableId }
    });

    if (orderCount > 0) {
      throw new Error('주문 이력이 있는 테이블은 삭제할 수 없습니다');
    }

    await prisma.table.delete({
      where: {
        id: tableId,
        storeId
      }
    });

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'tables');
  }

  async bulkCreate(
    storeId: string,
    placeId: string,
    startNumber: number,
    count: number,
    capacity: number = 4
  ): Promise<Table[]> {
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      throw new Error('매장 정보를 찾을 수 없습니다');
    }

    const tables = [];

    for (let i = 0; i < count; i++) {
      const tableNumber = startNumber + i;
      const qrString = qrCodeUtils.generateQRString(store.storeCode, tableNumber);

      const table = await prisma.table.create({
        data: {
          storeId,
          placeId,
          name: `Table ${tableNumber}`,
          capacity,
          qrCode: qrString,
          status: 'empty'
        }
      });

      tables.push(table);
    }

    // 캐시 무효화
    await cacheManager.invalidate(storeId, 'tables');

    return tables;
  }
}

export const tableService = new TableService();