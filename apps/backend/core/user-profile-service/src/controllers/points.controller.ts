import { Response } from 'express';
import { AuthRequest } from '../types';
import { validationResult } from 'express-validator';
import { PointsService } from '../services/points.service';

export class PointsController {
  static async getPointsHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const storeId = req.user!.storeId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as string; // 'earn' | 'redeem' | 'expire'

      const history = await PointsService.getPointsHistory({
        customerId,
        storeId,
        page,
        limit,
        type
      });

      res.json({
        success: true,
        data: history,
        message: '포인트 이력 조회 성공'
      });
    } catch (error) {
      console.error('포인트 이력 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '포인트 이력 조회에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  static async earnPoints(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: '입력 데이터가 올바르지 않습니다.',
          errors: errors.array()
        });
        return;
      }

      const { customerId } = req.params;
      const { orderId, amount, description } = req.body;
      const storeId = req.user!.storeId;

      const result = await PointsService.earnPoints({
        customerId,
        storeId,
        orderId,
        amount,
        description
      });

      res.status(201).json({
        success: true,
        data: result,
        message: '포인트 적립 성공'
      });
    } catch (error) {
      console.error('포인트 적립 실패:', error);
      res.status(500).json({
        success: false,
        message: '포인트 적립에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  static async redeemPoints(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: '입력 데이터가 올바르지 않습니다.',
          errors: errors.array()
        });
        return;
      }

      const { customerId } = req.params;
      const { orderId, points, description } = req.body;
      const storeId = req.user!.storeId;

      const result = await PointsService.redeemPoints({
        customerId,
        storeId,
        orderId,
        points,
        description
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: '포인트 사용 성공'
      });
    } catch (error) {
      console.error('포인트 사용 실패:', error);
      res.status(500).json({
        success: false,
        message: '포인트 사용에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  static async getPointsBalance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const storeId = req.user!.storeId;

      const balance = await PointsService.getPointsBalance(customerId, storeId);

      res.json({
        success: true,
        data: balance,
        message: '포인트 잔액 조회 성공'
      });
    } catch (error) {
      console.error('포인트 잔액 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '포인트 잔액 조회에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  static async adjustPoints(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: '입력 데이터가 올바르지 않습니다.',
          errors: errors.array()
        });
        return;
      }

      const { customerId } = req.params;
      const { points, type, description } = req.body;
      const storeId = req.user!.storeId;
      const adminId = req.user!.id;

      const result = await PointsService.adjustPoints({
        customerId,
        storeId,
        adminId,
        points,
        type, // 'increase' | 'decrease'
        description
      });

      res.json({
        success: true,
        data: result,
        message: '포인트 조정 성공'
      });
    } catch (error) {
      console.error('포인트 조정 실패:', error);
      res.status(500).json({
        success: false,
        message: '포인트 조정에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  static async getMembershipInfo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const storeId = req.user!.storeId;

      const membershipInfo = await PointsService.getMembershipInfo(customerId, storeId);

      res.json({
        success: true,
        data: membershipInfo,
        message: '멤버십 정보 조회 성공'
      });
    } catch (error) {
      console.error('멤버십 정보 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '멤버십 정보 조회에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  static async expirePoints(req: AuthRequest, res: Response): Promise<void> {
    try {
      const storeId = req.user!.storeId;

      const result = await PointsService.expirePoints(storeId);

      res.json({
        success: true,
        data: result,
        message: '만료 포인트 처리 완료'
      });
    } catch (error) {
      console.error('만료 포인트 처리 실패:', error);
      res.status(500).json({
        success: false,
        message: '만료 포인트 처리에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  static async getPointsStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const storeId = req.user!.storeId;
      const period = req.query.period as string || 'month'; // 'week' | 'month' | 'year'

      const stats = await PointsService.getPointsStats(storeId, period);

      res.json({
        success: true,
        data: stats,
        message: '포인트 통계 조회 성공'
      });
    } catch (error) {
      console.error('포인트 통계 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '포인트 통계 조회에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}