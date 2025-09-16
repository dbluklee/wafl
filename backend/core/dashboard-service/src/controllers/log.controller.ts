import { Response } from 'express';
import { validationResult } from 'express-validator';
import { IAuthenticatedRequest, ELogAction } from '../types';
import { LogService } from '../services/log.service';
import { asyncHandler, ValidationApiError } from '../middlewares/error';

export class LogController {
  private logService = new LogService();

  // GET /api/v1/dashboard/logs
  getLogs = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationApiError('Validation failed', errors.array());
    }

    const storeId = req.user!.storeId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const action = req.query.action as ELogAction | undefined;

    const result = await this.logService.getLogs(storeId, limit, offset, action);

    res.json({
      success: true,
      data: result,
      pagination: {
        limit,
        offset,
        total: result.total,
        hasMore: result.hasMore
      },
      timestamp: new Date().toISOString()
    });
  });

  // POST /api/v1/dashboard/logs/undo
  undoAction = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationApiError('Validation failed', errors.array());
    }

    const { logId } = req.body;
    const userId = req.user!.id;
    const userName = req.user!.name;

    const result = await this.logService.undoAction(logId, userId, userName);

    res.json({
      success: true,
      data: result.data,
      message: result.message,
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/v1/dashboard/logs/undoable
  getUndoableActions = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const storeId = req.user!.storeId;
    const limit = parseInt(req.query.limit as string) || 10;

    const undoableActions = await this.logService.getUndoableActions(storeId, limit);

    res.json({
      success: true,
      data: undoableActions,
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/v1/dashboard/logs/actions/:action
  getLogsByAction = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationApiError('Validation failed', errors.array());
    }

    const storeId = req.user!.storeId;
    const { action } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    // Validate action
    if (!Object.values(ELogAction).includes(action as ELogAction)) {
      res.status(400).json({
        success: false,
        error: 'Invalid action type',
        code: 'INVALID_ACTION_TYPE',
        validActions: Object.values(ELogAction)
      });
      return;
    }

    const logs = await this.logService.getLogsByAction(
      storeId,
      action as ELogAction,
      limit
    );

    res.json({
      success: true,
      data: logs,
      meta: {
        action,
        count: logs.length,
        limit
      },
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/v1/dashboard/logs/recent
  getRecentLogs = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const storeId = req.user!.storeId;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.logService.getLogs(storeId, limit, 0);

    res.json({
      success: true,
      data: result.logs,
      meta: {
        count: result.logs.length,
        total: result.total,
        hasMore: result.hasMore
      },
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/v1/dashboard/logs/table/:tableId
  getTableLogs = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationApiError('Validation failed', errors.array());
    }

    const storeId = req.user!.storeId;
    const { tableId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    // Get all logs and filter by table
    const result = await this.logService.getLogs(storeId, 100, 0); // Get more to filter
    const tableLogs = result.logs
      .filter(log => log.tableId === tableId)
      .slice(0, limit);

    res.json({
      success: true,
      data: tableLogs,
      meta: {
        tableId,
        count: tableLogs.length,
        limit
      },
      timestamp: new Date().toISOString()
    });
  });

  // POST /api/v1/dashboard/logs/create
  createLog = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationApiError('Validation failed', errors.array());
    }

    const {
      action,
      tableId,
      tableName,
      orderId,
      orderNumber,
      amount,
      details,
      oldData,
      newData,
      isUndoable
    } = req.body;

    const userId = req.user!.id;
    const userName = req.user!.name;
    const storeId = req.user!.storeId;

    const log = await this.logService.createLog({
      action,
      userId,
      userName,
      storeId,
      tableId,
      tableName,
      orderId,
      orderNumber,
      amount,
      details,
      oldData,
      newData,
      isUndoable
    });

    res.status(201).json({
      success: true,
      data: log,
      message: 'Log entry created successfully',
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/v1/dashboard/logs/stats
  getLogStats = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const storeId = req.user!.storeId;

    // Get logs by action type
    const actionCounts: { [key: string]: number } = {};

    for (const action of Object.values(ELogAction)) {
      const logs = await this.logService.getLogsByAction(storeId, action, 1000);
      actionCounts[action] = logs.length;
    }

    // Get undoable actions count
    const undoableActions = await this.logService.getUndoableActions(storeId, 100);

    // Get recent activity (last 24 hours)
    const recent = await this.logService.getLogs(storeId, 1000, 0);
    const last24Hours = recent.logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
      return logTime >= twentyFourHoursAgo;
    });

    res.json({
      success: true,
      data: {
        actionCounts,
        undoableCount: undoableActions.length,
        totalLogs: recent.total,
        recentActivityCount: last24Hours.length,
        mostFrequentAction: Object.entries(actionCounts).reduce(
          (max, [action, count]) => count > max.count ? { action, count } : max,
          { action: '', count: 0 }
        )
      },
      timestamp: new Date().toISOString()
    });
  });

  // DELETE /api/v1/dashboard/logs/cleanup
  cleanupOldLogs = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    // This would be an owner-only operation to clean up old logs
    // Implementation depends on business requirements

    res.json({
      success: true,
      message: 'Log cleanup functionality would be implemented here',
      timestamp: new Date().toISOString()
    });
  });
}