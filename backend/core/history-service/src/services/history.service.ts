import { PrismaClient } from '@prisma/client';
import {
  IHistoryEntry,
  IHistoryCreateRequest,
  IHistoryQueryParams,
  IPaginatedResponse,
  EHistoryErrorCode
} from '../types';
import { HistoryLogger } from '../utils/simple-logger';
import { historyCache, CACHE_KEYS, InMemoryCache } from '../utils/cache';
import config from '../config';

const prisma = new PrismaClient();

export class HistoryService {
  /**
   * 히스토리 엔트리 생성
   */
  static async createHistoryEntry(
    userId: string,
    storeId: string,
    request: IHistoryCreateRequest
  ): Promise<IHistoryEntry> {
    try {
      // Undo 마감시간 계산
      const undoDeadline = request.undoDeadlineMinutes
        ? new Date(Date.now() + request.undoDeadlineMinutes * 60 * 1000)
        : new Date(Date.now() + config.UNDO_DEADLINE_MINUTES * 60 * 1000);

      // 메타데이터 기본값 설정
      const metadata = {
        changedFields: request.oldData && request.newData
          ? this.getChangedFields(request.oldData, request.newData)
          : [],
        ...request.metadata
      };

      // 히스토리 엔트리 생성
      const historyEntry = await prisma.historyLog.create({
        data: {
          userId,
          storeId,
          action: request.action,
          entityType: request.entityType,
          entityId: request.entityId,
          entityName: request.entityName,
          oldData: request.oldData,
          newData: request.newData,
          metadata,
          isUndoable: request.isUndoable ?? true,
          undoDeadline: request.isUndoable !== false ? undoDeadline : null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        }
      });

      // 캐시 무효화
      this.invalidateHistoryCache(storeId, request.entityType, request.entityId);

      // 로깅
      HistoryLogger.logHistoryCreated(
        request.action,
        request.entityType,
        request.entityId,
        userId
      );

      return this.mapPrismaToHistoryEntry(historyEntry);
    } catch (error) {
      HistoryLogger.logError(error as Error, { userId, storeId, request });
      throw new Error(`히스토리 생성 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 히스토리 목록 조회 (페이지네이션)
   */
  static async getHistoryList(
    storeId: string,
    params: IHistoryQueryParams
  ): Promise<IPaginatedResponse<IHistoryEntry>> {
    try {
      const {
        limit = config.MAX_HISTORY_ENTRIES_PER_PAGE,
        offset = 0,
        entityType,
        entityId,
        action,
        userId,
        startDate,
        endDate
      } = params;

      // 캐시 키 생성
      const cacheKey = CACHE_KEYS.HISTORY_LIST(
        storeId,
        Math.floor(offset / limit) + 1
      ) + `:${JSON.stringify(params)}`;

      // 캐시에서 확인
      const cached = historyCache.get<IPaginatedResponse<IHistoryEntry>>(cacheKey);
      if (cached) {
        return cached;
      }

      // 필터 조건 구성
      const where: any = { storeId };

      if (entityType) where.entityType = entityType;
      if (entityId) where.entityId = entityId;
      if (action) where.action = action;
      if (userId) where.userId = userId;

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      // 전체 개수 조회
      const total = await prisma.historyLog.count({ where });

      // 히스토리 목록 조회
      const historyLogs = await prisma.historyLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      });

      const items = historyLogs.map((log: any) => this.mapPrismaToHistoryEntry(log));
      const currentPage = Math.floor(offset / limit) + 1;

      const result: IPaginatedResponse<IHistoryEntry> = {
        items,
        meta: {
          total,
          page: currentPage,
          limit,
          hasMore: offset + limit < total
        }
      };

      // 캐시에 저장 (짧은 시간)
      historyCache.set(cacheKey, result, InMemoryCache.TTL.SHORT);

      return result;
    } catch (error) {
      HistoryLogger.logError(error as Error, { storeId, params });
      throw new Error(`히스토리 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 특정 히스토리 엔트리 조회
   */
  static async getHistoryEntry(historyId: string, storeId: string): Promise<IHistoryEntry> {
    try {
      const cacheKey = CACHE_KEYS.HISTORY_ENTRY(historyId);
      const cached = historyCache.get<IHistoryEntry>(cacheKey);
      if (cached) {
        return cached;
      }

      const historyLog = await prisma.historyLog.findFirst({
        where: {
          id: historyId,
          storeId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        }
      });

      if (!historyLog) {
        throw new Error('히스토리를 찾을 수 없습니다.');
      }

      const result = this.mapPrismaToHistoryEntry(historyLog);
      historyCache.set(cacheKey, result, InMemoryCache.TTL.MEDIUM);

      return result;
    } catch (error) {
      HistoryLogger.logError(error as Error, { historyId, storeId });
      throw error;
    }
  }

  /**
   * 특정 엔티티의 히스토리 조회
   */
  static async getEntityHistory(
    storeId: string,
    entityType: string,
    entityId: string,
    limit: number = 10
  ): Promise<IHistoryEntry[]> {
    try {
      const cacheKey = CACHE_KEYS.HISTORY_ENTITY(entityType, entityId);
      const cached = historyCache.get<IHistoryEntry[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const historyLogs = await prisma.historyLog.findMany({
        where: {
          storeId,
          entityType,
          entityId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      const result = historyLogs.map((log: any) => this.mapPrismaToHistoryEntry(log));
      historyCache.set(cacheKey, result, InMemoryCache.TTL.MEDIUM);

      return result;
    } catch (error) {
      HistoryLogger.logError(error as Error, { storeId, entityType, entityId });
      throw new Error(`엔티티 히스토리 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 히스토리 엔트리 삭제 (소프트 삭제)
   */
  static async deleteHistoryEntry(historyId: string, storeId: string): Promise<void> {
    try {
      const historyLog = await prisma.historyLog.findFirst({
        where: {
          id: historyId,
          storeId
        }
      });

      if (!historyLog) {
        throw new Error('히스토리를 찾을 수 없습니다.');
      }

      // Undo 불가능으로 설정
      await prisma.historyLog.update({
        where: { id: historyId },
        data: { isUndoable: false }
      });

      // 캐시 무효화
      this.invalidateHistoryCache(storeId, historyLog.entityType, historyLog.entityId);
    } catch (error) {
      HistoryLogger.logError(error as Error, { historyId, storeId });
      throw new Error(`히스토리 삭제 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 오래된 히스토리 정리
   */
  static async cleanupOldHistory(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.HISTORY_RETENTION_DAYS);

      const result = await prisma.historyLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      HistoryLogger.logHistoryCreated(
        'cleanup',
        'system',
        'history',
        'system'
      );

      return result.count;
    } catch (error) {
      HistoryLogger.logError(error as Error);
      throw new Error(`히스토리 정리 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 변경된 필드 추출
   */
  private static getChangedFields(oldData: Record<string, any>, newData: Record<string, any>): string[] {
    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changedFields.push(key);
      }
    }

    return changedFields;
  }

  /**
   * Prisma 모델을 IHistoryEntry로 변환
   */
  private static mapPrismaToHistoryEntry(prismaEntry: any): IHistoryEntry {
    return {
      id: prismaEntry.id,
      userId: prismaEntry.userId,
      storeId: prismaEntry.storeId,
      action: prismaEntry.action,
      entityType: prismaEntry.entityType,
      entityId: prismaEntry.entityId,
      entityName: prismaEntry.entityName,
      oldData: prismaEntry.oldData,
      newData: prismaEntry.newData,
      metadata: prismaEntry.metadata,
      isUndoable: prismaEntry.isUndoable,
      undoDeadline: prismaEntry.undoDeadline,
      undoneAt: prismaEntry.undoneAt,
      createdAt: prismaEntry.createdAt,
      user: prismaEntry.user ? {
        id: prismaEntry.user.id,
        name: prismaEntry.user.name,
        role: prismaEntry.user.role
      } : undefined
    };
  }

  /**
   * 캐시 무효화
   */
  private static invalidateHistoryCache(storeId: string, entityType?: string, entityId?: string): void {
    // 매장별 히스토리 캐시 무효화
    historyCache.deleteByPattern(CACHE_KEYS.PATTERNS.HISTORY_BY_STORE(storeId));

    // 특정 엔티티 캐시 무효화
    if (entityType && entityId) {
      historyCache.delete(CACHE_KEYS.HISTORY_ENTITY(entityType, entityId));
    }
  }
}