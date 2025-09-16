import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { smsUtils } from '../utils/sms';
import { IAuthRequest } from '../types';

export class AuthController {
  // PIN 로그인
  async loginWithPin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.loginWithPin(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // 모바일 로그인
  async loginWithMobile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.loginWithMobile(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // 매장 가입
  async registerStore(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.registerStore(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  // 고객 세션 생성
  async createCustomerSession(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.createCustomerSession(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // SMS 인증 요청
  async requestSmsVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body;
      const result = await authService.requestSmsVerification(phone);
      res.json({
        success: true,
        data: {
          message: '인증번호가 발송되었습니다',
          expiresIn: result.expiresIn
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // SMS 인증 확인
  async verifySmsCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, verificationCode } = req.body;
      const isValid = await smsUtils.verifyCode(phone, verificationCode);

      res.json({
        success: true,
        data: {
          valid: isValid
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 토큰 갱신
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const authReq = req as IAuthRequest;
      const result = await authService.refreshToken(refreshToken, authReq.user!.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // 로그아웃
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      await authService.logout(authReq.user!.userId);
      res.json({
        success: true,
        data: {
          message: '로그아웃되었습니다'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();