import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { orderService } from '../services/order.service';
import { IAuthRequest } from '../types';
import { AppError } from '../middlewares/error';

export class OrderController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력 데이터가 올바르지 않습니다',
            details: errors.array()
          }
        });
      }

      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const order = await orderService.create(storeId, req.body);

      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력 데이터가 올바르지 않습니다',
            details: errors.array()
          }
        });
      }

      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { orderId } = req.params;

      const order = await orderService.getById(storeId, orderId);

      if (!order) {
        throw new AppError('주문을 찾을 수 없습니다', 404, 'ORDER_NOT_FOUND');
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력 데이터가 올바르지 않습니다',
            details: errors.array()
          }
        });
      }

      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const filters = {
        status: req.query.status as string,
        tableId: req.query.tableId as string,
        orderNumber: req.query.orderNumber as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await orderService.getAll(storeId, filters, page, limit);

      res.json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력 데이터가 올바르지 않습니다',
            details: errors.array()
          }
        });
      }

      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { orderId } = req.params;

      const order = await orderService.updateStatus(storeId, orderId, req.body);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력 데이터가 올바르지 않습니다',
            details: errors.array()
          }
        });
      }

      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { orderId } = req.params;
      const { reason } = req.body;

      const order = await orderService.cancel(storeId, orderId, reason);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async getTableOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력 데이터가 올바르지 않습니다',
            details: errors.array()
          }
        });
      }

      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { tableId } = req.params;

      const orders = await orderService.getTableOrders(storeId, tableId);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const stats = await orderService.getStatistics(storeId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();