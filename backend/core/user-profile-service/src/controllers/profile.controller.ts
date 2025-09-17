import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import { ProfileService } from '../services/profile.service';

export class ProfileController {
  // 내 프로필 조회
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await ProfileService.getProfile(userId);

      if (!profile) {
        res.status(404).json({
          success: false,
          message: '프로필을 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: profile,
        message: '프로필 조회 성공'
      });
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '프로필 조회에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // 프로필 수정 (이름만)
  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
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

      const userId = req.user!.id;
      const { name } = req.body;

      const updatedProfile = await ProfileService.updateProfile(userId, { name });

      res.json({
        success: true,
        data: updatedProfile,
        message: '프로필 수정 성공'
      });
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      res.status(500).json({
        success: false,
        message: '프로필 수정에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // PIN 변경
  static async changePin(req: AuthRequest, res: Response): Promise<void> {
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

      const userId = req.user!.id;
      const { currentPin, newPin } = req.body;

      const result = await ProfileService.changePin(userId, currentPin, newPin);

      if (!result) {
        res.status(400).json({
          success: false,
          message: '현재 PIN이 일치하지 않습니다.'
        });
        return;
      }

      res.json({
        success: true,
        message: 'PIN 변경 성공'
      });
    } catch (error) {
      console.error('PIN 변경 실패:', error);
      res.status(500).json({
        success: false,
        message: 'PIN 변경에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // 언어 설정 변경 (사용자별 저장 - 추후 확장 가능)
  static async updateLanguage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { language } = req.body;
      const userId = req.user!.id;

      if (!language || !['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de'].includes(language)) {
        res.status(400).json({
          success: false,
          message: '지원하지 않는 언어입니다.'
        });
        return;
      }

      await ProfileService.updateLanguage(userId, language);

      res.json({
        success: true,
        message: '언어 설정 변경 성공'
      });
    } catch (error) {
      console.error('언어 설정 변경 실패:', error);
      res.status(500).json({
        success: false,
        message: '언어 설정 변경에 실패했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}