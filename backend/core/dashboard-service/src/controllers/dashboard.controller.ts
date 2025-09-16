import { Response } from 'express';
import { validationResult } from 'express-validator';
import { IAuthenticatedRequest, ETableStatus } from '../types';
import { DashboardService } from '../services/dashboard.service';
import { LogService } from '../services/log.service';
import { asyncHandler, ValidationApiError } from '../middlewares/error';

export class DashboardController {
  private dashboardService = new DashboardService();
  private logService = new LogService();

  // GET /api/v1/dashboard/overview
  getOverview = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationApiError('Validation failed', errors.array());
    }

    const storeId = req.user!.storeId;
    const result = await this.dashboardService.getOverview(storeId);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  });

  // PATCH /api/v1/dashboard/tables/:tableId/status
  updateTableStatus = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationApiError('Validation failed', errors.array());
    }

    const { tableId } = req.params;
    const { status, numberOfPeople } = req.body;
    const userId = req.user!.id;
    const userName = req.user!.name;

    const updatedTable = await this.dashboardService.updateTableStatus(
      tableId,
      status as ETableStatus,
      userId,
      userName,
      numberOfPeople
    );

    res.json({
      success: true,
      data: updatedTable,
      message: `테이블 상태가 ${status}로 변경되었습니다.`,
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/v1/dashboard/stats/today
  getTodayStats = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const storeId = req.user!.storeId;
    const stats = await this.dashboardService.getTodayStats(storeId);

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/v1/dashboard/places/:placeId/tables
  getPlaceTables = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationApiError('Validation failed', errors.array());
    }

    const storeId = req.user!.storeId;
    const overview = await this.dashboardService.getOverview(storeId);

    const { placeId } = req.params;
    const place = overview.places.find(p => p.id === placeId);

    if (!place) {
      res.status(404).json({
        success: false,
        error: 'Place not found',
        code: 'PLACE_NOT_FOUND'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        place: {
          id: place.id,
          name: place.name,
          color: place.color
        },
        tables: place.tables,
        summary: {
          totalTables: place.totalTables,
          emptyTables: place.emptyTables,
          seatedTables: place.seatedTables,
          orderedTables: place.orderedTables
        }
      },
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/v1/dashboard/tables/:tableId
  getTableDetail = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationApiError('Validation failed', errors.array());
    }

    const storeId = req.user!.storeId;
    const { tableId } = req.params;

    const overview = await this.dashboardService.getOverview(storeId);

    // Find table in all places
    let foundTable = null;
    for (const place of overview.places) {
      const table = place.tables.find(t => t.id === tableId);
      if (table) {
        foundTable = table;
        break;
      }
    }

    if (!foundTable) {
      res.status(404).json({
        success: false,
        error: 'Table not found',
        code: 'TABLE_NOT_FOUND'
      });
      return;
    }

    // Get recent logs for this table
    const recentLogs = await this.logService.getLogs(storeId, 10, 0);
    const tableLogs = recentLogs.logs.filter(log => log.tableId === tableId);

    res.json({
      success: true,
      data: {
        table: foundTable,
        recentActivity: tableLogs.slice(0, 5)
      },
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/v1/dashboard/summary
  getSummaryOnly = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const storeId = req.user!.storeId;
    const overview = await this.dashboardService.getOverview(storeId);

    res.json({
      success: true,
      data: overview.summary,
      timestamp: new Date().toISOString()
    });
  });

  // POST /api/v1/dashboard/tables/:tableId/clear
  clearTable = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationApiError('Validation failed', errors.array());
    }

    const { tableId } = req.params;
    const userId = req.user!.id;
    const userName = req.user!.name;

    const clearedTable = await this.dashboardService.updateTableStatus(
      tableId,
      ETableStatus.EMPTY,
      userId,
      userName,
      0
    );

    res.json({
      success: true,
      data: clearedTable,
      message: '테이블이 정리되었습니다.',
      timestamp: new Date().toISOString()
    });
  });

  // POST /api/v1/dashboard/tables/:tableId/seat
  seatTable = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationApiError('Validation failed', errors.array());
    }

    const { tableId } = req.params;
    const { numberOfPeople = 1 } = req.body;
    const userId = req.user!.id;
    const userName = req.user!.name;

    const seatedTable = await this.dashboardService.updateTableStatus(
      tableId,
      ETableStatus.SEATED,
      userId,
      userName,
      numberOfPeople
    );

    res.json({
      success: true,
      data: seatedTable,
      message: `테이블에 ${numberOfPeople}명이 착석하였습니다.`,
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/v1/dashboard/realtime/status
  getRealtimeStatus = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
    const storeId = req.user!.storeId;

    // Get fresh data without cache
    const overview = await this.dashboardService.getOverview(storeId);

    // Get recent activity (last 10 logs)
    const recentActivity = await this.logService.getLogs(storeId, 10, 0);

    res.json({
      success: true,
      data: {
        summary: overview.summary,
        recentActivity: recentActivity.logs,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  });
}