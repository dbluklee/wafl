import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '@/config';
import { AuthenticatedRequest } from '@/types';
import logger from '@/utils/logger';

export interface JWTPayload {
  id: string;
  storeId: string;
  role: 'owner' | 'staff';
  username: string;
  iat?: number;
  exp?: number;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    jwt.verify(token, config.jwtSecret, (err, payload) => {
      if (err) {
        logger.warn('Invalid token attempt:', { error: err.message });
        res.status(403).json({
          success: false,
          error: 'Invalid or expired token'
        });
        return;
      }

      req.user = payload as JWTPayload;
      next();
    });
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// 점주 권한만 허용
export const requireOwner = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  if (req.user.role !== 'owner') {
    res.status(403).json({
      success: false,
      error: 'Owner access required'
    });
    return;
  }

  next();
};

// 특정 매장 접근 권한 확인
export const requireStoreAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  const storeId = req.params.storeId || req.body.storeId;

  if (storeId && req.user.storeId !== storeId) {
    res.status(403).json({
      success: false,
      error: 'Store access denied'
    });
    return;
  }

  next();
};

export default { authenticateToken, requireOwner, requireStoreAccess };