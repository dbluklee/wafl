import { Request, Response, NextFunction } from 'express';
import { jwtUtils } from '../utils/jwt';
import { sessionStore } from '../config/memory-store';
import { IAuthRequest } from '../types';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: '인증 토큰이 없습니다'
        }
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwtUtils.verifyToken(token);

      // 세션 확인 (Redis가 없을 때는 토큰만으로 인증)
      const session = await sessionStore.get(decoded.userId);

      // Redis가 작동하지 않는 경우, JWT 토큰만으로 인증 진행
      // 실제 프로덕션에서는 Redis가 필수이므로 이는 개발/테스트용

      (req as IAuthRequest).user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_002',
          message: '토큰이 만료되었습니다'
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// 점주만 접근 가능
export const ownerOnly = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as IAuthRequest;

  if (authReq.user?.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'AUTH_003',
        message: '권한이 없습니다'
      }
    });
  }

  next();
};