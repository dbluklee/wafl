import { Request, Response, NextFunction } from 'express';
import { param } from 'express-validator';
import { validationResult } from 'express-validator';
import { kitchenService } from '../services/kitchen.service';
import { orderService } from '../services/order.service';
import { IAuthRequest } from '../types';
import { AppError } from '../middlewares/error';

export class KitchenController {
  async getPendingOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const orders = await kitchenService.getPendingOrders(storeId);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  async getCookingOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const orders = await kitchenService.getCookingOrders(storeId);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  async getReadyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const orders = await kitchenService.getReadyOrders(storeId);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const orders = await kitchenService.getAllKitchenOrders(storeId);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  async startCooking(req: Request, res: Response, next: NextFunction) {
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

      // Kitchen 큐에서 조리 시작
      await kitchenService.startCooking(storeId, orderId);

      // 주문 상태도 업데이트
      await orderService.updateStatus(storeId, orderId, { status: 'cooking' });

      res.json({
        success: true,
        message: '조리를 시작했습니다'
      });
    } catch (error) {
      next(error);
    }
  }

  async completeOrder(req: Request, res: Response, next: NextFunction) {
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

      // Kitchen 큐에서 완료 처리
      await kitchenService.completeOrder(storeId, orderId);

      // 주문 상태도 업데이트
      await orderService.updateStatus(storeId, orderId, { status: 'ready' });

      res.json({
        success: true,
        message: '조리가 완료되었습니다'
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsServed(req: Request, res: Response, next: NextFunction) {
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

      // Kitchen 큐에서 서빙 완료 처리
      await kitchenService.markAsServed(storeId, orderId);

      // 주문 상태도 업데이트
      await orderService.updateStatus(storeId, orderId, { status: 'served' });

      res.json({
        success: true,
        message: '서빙이 완료되었습니다'
      });
    } catch (error) {
      next(error);
    }
  }

  async getKitchenStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const stats = await kitchenService.getKitchenStats(storeId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
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

      const order = await kitchenService.getOrderById(storeId, orderId);

      if (!order) {
        throw new AppError('주방 큐에서 주문을 찾을 수 없습니다', 404, 'KITCHEN_ORDER_NOT_FOUND');
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async setPriority(req: Request, res: Response, next: NextFunction) {
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
      const { priority } = req.body;

      await kitchenService.setPriority(storeId, orderId, priority);

      res.json({
        success: true,
        message: '우선순위가 변경되었습니다'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const kitchenController = new KitchenController();

// 검증 미들웨어
export const validateOrderId = [
  param('orderId')
    .notEmpty()
    .withMessage('주문 ID는 필수입니다')
    .isUUID()
    .withMessage('유효한 주문 ID를 입력해주세요')
];