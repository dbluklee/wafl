import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '@/config';
import { IAuthenticatedRequest, IApiResponse } from '@/types';

export interface IJWTPayload {
  userId: string;
  storeId: string;
  role: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export const authenticateToken = (
  req: IAuthenticatedRequest,
  res: Response<IApiResponse>,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token is required',
        },
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as IJWTPayload;

    req.user = {
      userId: decoded.userId,
      storeId: decoded.storeId,
      role: decoded.role,
    };

    if (decoded.email) {
      req.user.email = decoded.email;
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware] Token verification failed:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Authentication failed',
        },
      });
    }
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (
    req: IAuthenticatedRequest,
    res: Response<IApiResponse>,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        },
      });
      return;
    }

    next();
  };
};

export const ownerOnly = requireRole(['owner']);

export const staffAndOwner = requireRole(['owner', 'staff']);