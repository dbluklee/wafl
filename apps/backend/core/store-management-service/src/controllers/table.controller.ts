import { Request, Response, NextFunction } from 'express';
import { tableService } from '../services/table.service';
import { IAuthRequest } from '../types';

export class TableController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const filters = {
        placeId: req.query.placeId as string,
        status: req.query.status as 'empty' | 'seated' | 'ordered',
        minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity as string) : undefined
      };

      const tables = await tableService.getAll(storeId, filters);

      res.json({
        success: true,
        data: tables
      });
    } catch (error) {
      next(error);
    }
  }

  async getByPlace(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { placeId } = req.params;

      const tables = await tableService.getByPlace(storeId, placeId);

      res.json({
        success: true,
        data: tables
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { tableId } = req.params;

      const table = await tableService.getById(storeId, tableId);

      if (!table) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TABLE_NOT_FOUND',
            message: '테이블을 찾을 수 없습니다'
          }
        });
      }

      res.json({
        success: true,
        data: table
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const result = await tableService.create(storeId, req.body);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { tableId } = req.params;

      const table = await tableService.update(storeId, tableId, req.body);

      res.json({
        success: true,
        data: table
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { tableId } = req.params;
      const { status } = req.body;

      const table = await tableService.updateStatus(storeId, tableId, status);

      res.json({
        success: true,
        data: table
      });
    } catch (error) {
      next(error);
    }
  }

  async regenerateQR(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { tableId } = req.params;

      const qrCode = await tableService.regenerateQR(storeId, tableId);

      res.json({
        success: true,
        data: { qrCode }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { tableId } = req.params;

      await tableService.delete(storeId, tableId);

      res.json({
        success: true,
        data: {
          message: '테이블이 삭제되었습니다'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { placeId, startNumber, count, capacity } = req.body;

      const tables = await tableService.bulkCreate(storeId, placeId, startNumber, count, capacity);

      res.status(201).json({
        success: true,
        data: tables
      });
    } catch (error) {
      next(error);
    }
  }
}

export const tableController = new TableController();