import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IAuthRequest, IJwtPayload } from '../types';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access token이 필요합니다'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret) as IJwtPayload;
    (req as IAuthRequest).user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(403).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: '유효하지 않은 토큰입니다'
      }
    });
  }
};

export const requireOwner = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as IAuthRequest;

  if (!authReq.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '인증이 필요합니다'
      }
    });
  }

  if (authReq.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: '점주만 접근할 수 있습니다'
      }
    });
  }

  next();
};