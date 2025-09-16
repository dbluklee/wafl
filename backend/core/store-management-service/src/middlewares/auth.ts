import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IAuthRequest, IJwtPayload } from '../types';

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

    // JWT 토큰 로컬 검증
    try {
      const payload = jwt.verify(token, config.jwt.secret) as IJwtPayload;
      (req as IAuthRequest).user = payload;

      // Store ID를 헤더에 추가
      req.headers['x-store-id'] = payload.storeId;

      next();
    } catch (error) {
      console.error('JWT verification failed:', error);
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_002',
          message: '토큰이 유효하지 않습니다'
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