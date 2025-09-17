import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import { StaffService } from '../services/staff.service';

export class StaffController {
  // 직원 목록 조회 (점주 전용)
  static async getStaffList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const storeId = req.user!.storeId;
      const staffList = await StaffService.getStaffList(storeId);

      res.json({
        success: true,
        data: staffList,
        message: '직원 목록 조회 성공'
      });
    } catch (error) {
      console.error('직원 목록 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '직원 목록 조회에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // 직원 추가 (점주 전용)
  static async createStaff(req: AuthRequest, res: Response): Promise<void> {
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

      const storeId = req.user!.storeId;
      const { name, userPin, phone } = req.body;

      const newStaff = await StaffService.createStaff({
        storeId,
        name,
        userPin,
        phone
      });

      res.status(201).json({
        success: true,
        data: newStaff,
        message: '직원 추가 성공'
      });
    } catch (error) {
      console.error('직원 추가 실패:', error);
      if (error instanceof Error && error.message.includes('중복')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '직원 추가에 실패했습니다.',
          error: process.env.NODE_ENV === 'development' ? error : undefined
        });
      }
    }
  }

  // 직원 수정 (점주 전용)
  static async updateStaff(req: AuthRequest, res: Response): Promise<void> {
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

      const { staffId } = req.params;
      const storeId = req.user!.storeId;
      const updateData = req.body;

      const updatedStaff = await StaffService.updateStaff(staffId, storeId, updateData);

      if (!updatedStaff) {
        res.status(404).json({
          success: false,
          message: '직원을 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: updatedStaff,
        message: '직원 정보 수정 성공'
      });
    } catch (error) {
      console.error('직원 정보 수정 실패:', error);
      res.status(500).json({
        success: false,
        message: '직원 정보 수정에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // 직원 비활성화/활성화 (점주 전용)
  static async toggleStaffStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { staffId } = req.params;
      const { isActive } = req.body;
      const storeId = req.user!.storeId;

      const updatedStaff = await StaffService.toggleStaffStatus(staffId, storeId, isActive);

      if (!updatedStaff) {
        res.status(404).json({
          success: false,
          message: '직원을 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: updatedStaff,
        message: `직원 ${isActive ? '활성화' : '비활성화'} 성공`
      });
    } catch (error) {
      console.error('직원 상태 변경 실패:', error);
      res.status(500).json({
        success: false,
        message: '직원 상태 변경에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}