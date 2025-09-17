import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import {
  IUndoRequest,
  IRedoRequest,
  IUndoResponse,
  IRedoResponse,
  IUndoStack,
  EHistoryErrorCode
} from '../types';
import { HistoryLogger } from '../utils/simple-logger';
import { historyCache, CACHE_KEYS, InMemoryCache } from '../utils/cache';
import config from '../config';

const prisma = new PrismaClient();

export class UndoService {
  /**
   * Undo 실행
   */
  static async executeUndo(
    userId: string,
    storeId: string,
    request: IUndoRequest
  ): Promise<IUndoResponse> {
    try {
      // 히스토리 로그 조회
      const historyLog = await prisma.historyLog.findFirst({
        where: {
          id: request.actionId,
          storeId,
          isUndoable: true,
          undoneAt: null
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
        throw new Error('Undo할 수 있는 액션을 찾을 수 없습니다.');
      }

      // Undo 마감시간 체크
      if (historyLog.undoDeadline && historyLog.undoDeadline < new Date()) {
        throw new Error('Undo 가능한 시간이 만료되었습니다.');
      }

      // 권한 체크 (본인 또는 점주만 Undo 가능)
      const user = await prisma.user.findFirst({
        where: { id: userId, storeId }
      });

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      if (historyLog.userId !== userId && user.role !== 'owner') {
        throw new Error('해당 작업을 되돌릴 권한이 없습니다.');
      }

      // 실제 데이터 복원 실행
      const restoredData = await this.restoreData(historyLog);

      // 히스토리 로그 업데이트 (되돌림 기록)
      await prisma.historyLog.update({
        where: { id: request.actionId },
        data: {
          undoneAt: new Date()
        }
      });

      // Undo 스택에 추가 (Redo를 위해)
      const undoStack = await prisma.undoStack.create({
        data: {
          historyLogId: request.actionId,
          userId
        }
      });

      // 새로운 히스토리 엔트리 생성 (Undo 액션 기록)
      await prisma.historyLog.create({
        data: {
          userId,
          storeId,
          action: 'undo',
          entityType: historyLog.entityType,
          entityId: historyLog.entityId,
          entityName: historyLog.entityName,
          oldData: historyLog.newData,
          newData: historyLog.oldData,
          metadata: {
            originalActionId: request.actionId,
            reason: request.reason,
            undoStackId: undoStack.id
          },
          isUndoable: false // Undo 액션 자체는 되돌릴 수 없음
        }
      });

      // 캐시 무효화
      this.invalidateCache(storeId, historyLog.entityType, historyLog.entityId, userId);

      // 로깅
      HistoryLogger.logUndoExecuted(request.actionId, userId, historyLog.entityType);

      // Redo 마감시간 계산 (30분)
      const redoDeadline = new Date(Date.now() + 30 * 60 * 1000);

      const response: IUndoResponse = {
        message: this.generateUndoMessage(historyLog.entityType, historyLog.entityName, historyLog.action),
        restoredEntity: {
          type: historyLog.entityType,
          id: historyLog.entityId,
          name: historyLog.entityName,
          restoredData
        },
        undoActionId: undoStack.id,
        canRedo: true,
        redoDeadline
      };

      return response;
    } catch (error) {
      HistoryLogger.logError(error as Error, { userId, storeId, request });
      throw error;
    }
  }

  /**
   * Redo 실행
   */
  static async executeRedo(
    userId: string,
    storeId: string,
    request: IRedoRequest
  ): Promise<IRedoResponse> {
    try {
      // Undo 스택 조회
      const undoStack = await prisma.undoStack.findFirst({
        where: {
          id: request.undoActionId,
          userId,
          redoneAt: null
        },
        include: {
          historyLog: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true
                }
              }
            }
          }
        }
      });

      if (!undoStack) {
        throw new Error('Redo할 수 있는 액션을 찾을 수 없습니다.');
      }

      const historyLog = undoStack.historyLog;

      // Redo 마감시간 체크 (Undo 후 30분)
      const redoDeadline = new Date(undoStack.createdAt.getTime() + 30 * 60 * 1000);
      if (redoDeadline < new Date()) {
        throw new Error('Redo 가능한 시간이 만료되었습니다.');
      }

      // 원래 상태로 복원 (newData 적용)
      const reappliedData = await this.restoreData(historyLog, true);

      // Undo 스택 업데이트
      await prisma.undoStack.update({
        where: { id: request.undoActionId },
        data: { redoneAt: new Date() }
      });

      // 히스토리 로그에서 undoneAt 제거 (다시 활성화)
      await prisma.historyLog.update({
        where: { id: historyLog.id },
        data: { undoneAt: null }
      });

      // 새로운 히스토리 엔트리 생성 (Redo 액션 기록)
      await prisma.historyLog.create({
        data: {
          userId,
          storeId,
          action: 'redo',
          entityType: historyLog.entityType,
          entityId: historyLog.entityId,
          entityName: historyLog.entityName,
          oldData: historyLog.oldData,
          newData: historyLog.newData,
          metadata: {
            originalActionId: historyLog.id,
            undoStackId: request.undoActionId
          },
          isUndoable: false // Redo 액션 자체는 되돌릴 수 없음
        }
      });

      // 캐시 무효화
      this.invalidateCache(storeId, historyLog.entityType, historyLog.entityId, userId);

      // 로깅
      HistoryLogger.logRedoExecuted(request.undoActionId, userId, historyLog.entityType);

      const response: IRedoResponse = {
        message: this.generateRedoMessage(historyLog.entityType, historyLog.entityName, historyLog.action),
        reappliedData
      };

      return response;
    } catch (error) {
      HistoryLogger.logError(error as Error, { userId, storeId, request });
      throw error;
    }
  }

  /**
   * 사용자의 Undo 스택 조회
   */
  static async getUserUndoStack(userId: string, storeId: string): Promise<IUndoStack[]> {
    try {
      const cacheKey = CACHE_KEYS.UNDO_STACK(userId);
      const cached = historyCache.get<IUndoStack[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const undoStacks = await prisma.undoStack.findMany({
        where: {
          userId,
          redoneAt: null,
          historyLog: {
            storeId
          }
        },
        include: {
          historyLog: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10 // 최근 10개만
      });

      const result = undoStacks.map((stack: any) => ({
        id: stack.id,
        historyLogId: stack.historyLogId,
        userId: stack.userId,
        redoneAt: stack.redoneAt,
        createdAt: stack.createdAt
      }));

      historyCache.set(cacheKey, result, InMemoryCache.TTL.SHORT);
      return result;
    } catch (error) {
      HistoryLogger.logError(error as Error, { userId, storeId });
      throw new Error(`Undo 스택 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 매장의 Undo 가능한 액션들 조회
   */
  static async getUndoableActions(storeId: string, limit: number = 20) {
    try {
      const cacheKey = CACHE_KEYS.UNDOABLE_ACTIONS(storeId);
      const cached = historyCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const now = new Date();
      const undoableActions = await prisma.historyLog.findMany({
        where: {
          storeId,
          isUndoable: true,
          undoneAt: null,
          undoDeadline: {
            gt: now
          }
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

      historyCache.set(cacheKey, undoableActions, InMemoryCache.TTL.SHORT);
      return undoableActions;
    } catch (error) {
      HistoryLogger.logError(error as Error, { storeId });
      throw new Error(`Undo 가능한 액션 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 실제 데이터 복원 (다른 서비스와 통신)
   */
  private static async restoreData(historyLog: any, isRedo: boolean = false): Promise<Record<string, any>> {
    const dataToRestore = isRedo ? historyLog.newData : historyLog.oldData;

    if (!dataToRestore) {
      throw new Error('복원할 데이터가 없습니다.');
    }

    try {
      // 엔티티 타입에 따라 적절한 서비스 호출
      switch (historyLog.entityType) {
        case 'menu':
          return await this.restoreMenuData(historyLog.entityId, dataToRestore);
        case 'category':
          return await this.restoreCategoryData(historyLog.entityId, dataToRestore);
        case 'table':
          return await this.restoreTableData(historyLog.entityId, dataToRestore);
        case 'order':
          return await this.restoreOrderData(historyLog.entityId, dataToRestore);
        case 'user':
          return await this.restoreUserData(historyLog.entityId, dataToRestore);
        default:
          throw new Error(`지원하지 않는 엔티티 타입: ${historyLog.entityType}`);
      }
    } catch (error) {
      HistoryLogger.logError(error as Error, {
        entityType: historyLog.entityType,
        entityId: historyLog.entityId,
        dataToRestore
      });
      throw new Error(`데이터 복원 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 메뉴 데이터 복원
   */
  private static async restoreMenuData(menuId: string, data: Record<string, any>): Promise<Record<string, any>> {
    const response = await axios.put(
      `${config.STORE_MANAGEMENT_URL}/api/v1/menus/${menuId}`,
      data,
      {
        headers: {
          'X-Internal-Request': 'history-service'
        },
        timeout: 5000
      }
    );

    if (!response.data.success) {
      throw new Error('메뉴 복원 실패');
    }

    return response.data.data;
  }

  /**
   * 카테고리 데이터 복원
   */
  private static async restoreCategoryData(categoryId: string, data: Record<string, any>): Promise<Record<string, any>> {
    const response = await axios.put(
      `${config.STORE_MANAGEMENT_URL}/api/v1/categories/${categoryId}`,
      data,
      {
        headers: {
          'X-Internal-Request': 'history-service'
        },
        timeout: 5000
      }
    );

    if (!response.data.success) {
      throw new Error('카테고리 복원 실패');
    }

    return response.data.data;
  }

  /**
   * 테이블 데이터 복원
   */
  private static async restoreTableData(tableId: string, data: Record<string, any>): Promise<Record<string, any>> {
    const response = await axios.put(
      `${config.STORE_MANAGEMENT_URL}/api/v1/tables/${tableId}`,
      data,
      {
        headers: {
          'X-Internal-Request': 'history-service'
        },
        timeout: 5000
      }
    );

    if (!response.data.success) {
      throw new Error('테이블 복원 실패');
    }

    return response.data.data;
  }

  /**
   * 주문 데이터 복원
   */
  private static async restoreOrderData(orderId: string, data: Record<string, any>): Promise<Record<string, any>> {
    const response = await axios.put(
      `${config.ORDER_SERVICE_URL}/api/v1/orders/${orderId}`,
      data,
      {
        headers: {
          'X-Internal-Request': 'history-service'
        },
        timeout: 5000
      }
    );

    if (!response.data.success) {
      throw new Error('주문 복원 실패');
    }

    return response.data.data;
  }

  /**
   * 사용자 데이터 복원
   */
  private static async restoreUserData(userId: string, data: Record<string, any>): Promise<Record<string, any>> {
    const response = await axios.put(
      `${config.USER_PROFILE_SERVICE_URL}/api/v1/profile/${userId}`,
      data,
      {
        headers: {
          'X-Internal-Request': 'history-service'
        },
        timeout: 5000
      }
    );

    if (!response.data.success) {
      throw new Error('사용자 데이터 복원 실패');
    }

    return response.data.data;
  }

  /**
   * Undo 메시지 생성
   */
  private static generateUndoMessage(entityType: string, entityName?: string, action?: string): string {
    const name = entityName || '항목';

    switch (entityType) {
      case 'menu':
        return action === 'delete'
          ? `메뉴 '${name}'이(가) 복원되었습니다.`
          : `메뉴 '${name}'의 변경사항이 되돌려졌습니다.`;
      case 'category':
        return `카테고리 '${name}'의 변경사항이 되돌려졌습니다.`;
      case 'table':
        return `테이블 '${name}'의 변경사항이 되돌려졌습니다.`;
      case 'order':
        return `주문 '${name}'의 변경사항이 되돌려졌습니다.`;
      default:
        return `'${name}'의 변경사항이 되돌려졌습니다.`;
    }
  }

  /**
   * Redo 메시지 생성
   */
  private static generateRedoMessage(entityType: string, entityName?: string, action?: string): string {
    const name = entityName || '항목';

    switch (entityType) {
      case 'menu':
        return `메뉴 '${name}'의 변경사항이 다시 적용되었습니다.`;
      case 'category':
        return `카테고리 '${name}'의 변경사항이 다시 적용되었습니다.`;
      case 'table':
        return `테이블 '${name}'의 변경사항이 다시 적용되었습니다.`;
      case 'order':
        return `주문 '${name}'의 변경사항이 다시 적용되었습니다.`;
      default:
        return `'${name}'의 변경사항이 다시 적용되었습니다.`;
    }
  }

  /**
   * 캐시 무효화
   */
  private static invalidateCache(storeId: string, entityType: string, entityId: string, userId: string): void {
    // 관련 캐시 무효화
    historyCache.deleteByPattern(CACHE_KEYS.PATTERNS.HISTORY_BY_STORE(storeId));
    historyCache.delete(CACHE_KEYS.HISTORY_ENTITY(entityType, entityId));
    historyCache.delete(CACHE_KEYS.UNDO_STACK(userId));
    historyCache.delete(CACHE_KEYS.UNDOABLE_ACTIONS(storeId));
  }
}