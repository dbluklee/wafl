import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    storeId: string;
    role: string;
    name: string;
  };
}

export interface JWTPayload {
  id: string;
  storeId: string;
  role: string;
  name: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
      return;
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;

    req.user = {
      id: decoded.id,
      storeId: decoded.storeId,
      role: decoded.role,
      name: decoded.name
    };

    next();
  } catch (error) {
    console.error('JWT 검증 실패:', error);
    res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }
};

export const ownerOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'owner') {
    res.status(403).json({
      success: false,
      message: '점주 권한이 필요합니다.'
    });
    return;
  }
  next();
};