import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { HistoryService } from '../services/history.service';
import { UndoService } from '../services/undo.service';
import { IHistoryCreateRequest, IHistoryQueryParams, IUndoRequest, IRedoRequest } from '../types';
import { HistoryLogger } from '../utils/logger';

export class HistoryController {
  /**
   * 히스토리 목록 조회
   */
  static async getHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.user!;
      const queryParams: IHistoryQueryParams = {
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0,
        entityType: req.query.entityType as string,
        entityId: req.query.entityId as string,
        action: req.query.action as string,
        userId: req.query.userId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };

      const result = await HistoryService.getHistoryList(storeId, queryParams);

      res.json({
        success: true,
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      HistoryLogger.logError(error as Error, { userId: req.user?.id, query: req.query });
      res.status(500).json({
        success: false,
        error: {
          code: 'HISTORY_001',
          message: '히스토리 조회에 실패했습니다.'
        }
      });
    }
  }

  /**
   * 히스토리 생성 (다른 서비스에서 호출)
   */
  static async createHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id: userId, storeId } = req.user!;
      const request: IHistoryCreateRequest = req.body;

      const historyEntry = await HistoryService.createHistoryEntry(userId, storeId, request);

      res.status(201).json({
        success: true,
        data: historyEntry
      });
    } catch (error) {
      HistoryLogger.logError(error as Error, { userId: req.user?.id, body: req.body });
      res.status(500).json({
        success: false,
        error: {
          code: 'HISTORY_001',
          message: '히스토리 생성에 실패했습니다.'
        }
      });
    }
  }

  /**
   * Undo 실행
   */
  static async executeUndo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id: userId, storeId } = req.user!;
      const request: IUndoRequest = req.body;

      const result = await UndoService.executeUndo(userId, storeId, request);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      HistoryLogger.logError(error as Error, { userId: req.user?.id, body: req.body });
      res.status(400).json({
        success: false,
        error: {
          code: 'HISTORY_002',
          message: (error as Error).message || 'Undo 실행에 실패했습니다.'
        }
      });
    }
  }

  /**
   * Redo 실행
   */
  static async executeRedo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id: userId, storeId } = req.user!;
      const request: IRedoRequest = req.body;

      const result = await UndoService.executeRedo(userId, storeId, request);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      HistoryLogger.logError(error as Error, { userId: req.user?.id, body: req.body });
      res.status(400).json({
        success: false,
        error: {
          code: 'HISTORY_002',
          message: (error as Error).message || 'Redo 실행에 실패했습니다.'
        }
      });
    }
  }

  /**
   * 특정 엔티티의 히스토리 조회
   */
  static async getEntityHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.user!;
      const { entityType, entityId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const history = await HistoryService.getEntityHistory(storeId, entityType, entityId, limit);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      HistoryLogger.logError(error as Error, { userId: req.user?.id, params: req.params });
      res.status(500).json({
        success: false,
        error: {
          code: 'HISTORY_001',
          message: '엔티티 히스토리 조회에 실패했습니다.'
        }
      });
    }
  }
}