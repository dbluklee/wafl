import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { IJwtPayload, EHistoryErrorCode } from '../types';
import { HistoryLogger } from '../utils/simple-logger';

// Express Request 확장
export interface AuthRequest extends Request {
  user?: {
    id: string;
    storeId: string;
    role: 'owner' | 'staff';
    name: string;
  };
  requestId?: string;
}

/**
 * JWT 토큰 검증 미들웨어
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      HistoryLogger.logUnauthorizedAccess(undefined, req.method, req.path);
      res.status(401).json({
        success: false,
        error: {
          code: EHistoryErrorCode.HISTORY_007,
          message: '인증 토큰이 필요합니다.'
        }
      });
      return;
    }

    // Bearer 토큰 추출
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
      HistoryLogger.logUnauthorizedAccess(undefined, req.method, req.path);
      res.status(401).json({
        success: false,
        error: {
          code: EHistoryErrorCode.HISTORY_007,
          message: '토큰 형식이 올바르지 않습니다.'
        }
      });
      return;
    }

    // JWT 토큰 검증
    const decoded = jwt.verify(token, config.JWT_SECRET) as IJwtPayload;

    // 토큰 만료 체크
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      HistoryLogger.logUnauthorizedAccess(decoded.userId, req.method, req.path);
      res.status(401).json({
        success: false,
        error: {
          code: EHistoryErrorCode.HISTORY_007,
          message: '토큰이 만료되었습니다.'
        }
      });
      return;
    }

    // 사용자 정보를 request에 설정
    req.user = {
      id: decoded.userId,
      storeId: decoded.storeId,
      role: decoded.role,
      name: decoded.name || 'Unknown'
    };

    // Request ID 생성 (로깅용)
    req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      HistoryLogger.logUnauthorizedAccess(undefined, req.method, req.path);
      res.status(401).json({
        success: false,
        error: {
          code: EHistoryErrorCode.HISTORY_007,
          message: '유효하지 않은 토큰입니다.'
        }
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      HistoryLogger.logUnauthorizedAccess(undefined, req.method, req.path);
      res.status(401).json({
        success: false,
        error: {
          code: EHistoryErrorCode.HISTORY_007,
          message: '토큰이 만료되었습니다.'
        }
      });
      return;
    }

    HistoryLogger.logError(error as Error, {
      path: req.path,
      method: req.method,
      headers: req.headers
    });

    res.status(500).json({
      success: false,
      error: {
        code: EHistoryErrorCode.HISTORY_010,
        message: '인증 처리 중 오류가 발생했습니다.'
      }
    });
  }
};

/**
 * 점주 권한 확인 미들웨어
 */
export const ownerOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: EHistoryErrorCode.HISTORY_007,
        message: '인증이 필요합니다.'
      }
    });
    return;
  }

  if (req.user.role !== 'owner') {
    HistoryLogger.logUnauthorizedAccess(req.user.id, req.method, req.path);
    res.status(403).json({
      success: false,
      error: {
        code: EHistoryErrorCode.HISTORY_007,
        message: '점주 권한이 필요합니다.'
      }
    });
    return;
  }

  next();
};

/**
 * 매장 접근 권한 확인 미들웨어
 * URL 파라미터의 storeId와 토큰의 storeId가 일치하는지 확인
 */
export const storeAccessMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: EHistoryErrorCode.HISTORY_007,
        message: '인증이 필요합니다.'
      }
    });
    return;
  }

  const requestStoreId = req.params.storeId || req.query.storeId || req.body.storeId;

  // storeId가 없으면 토큰의 storeId 사용
  if (!requestStoreId) {
    next();
    return;
  }

  // 매장 ID가 일치하지 않으면 접근 거부
  if (requestStoreId !== req.user.storeId) {
    HistoryLogger.logUnauthorizedAccess(
      req.user.id,
      req.method,
      req.path
    );

    res.status(403).json({
      success: false,
      error: {
        code: EHistoryErrorCode.HISTORY_007,
        message: '해당 매장에 대한 접근 권한이 없습니다.'
      }
    });
    return;
  }

  next();
};

/**
 * API 응답 미들웨어 (Request ID 추가)
 */
export const responseMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const originalJson = res.json;

  res.json = function(body: any) {
    if (body && typeof body === 'object') {
      // 성공 응답에 메타데이터 추가
      if (body.success === true) {
        body.meta = {
          ...body.meta,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          requestId: req.requestId || 'unknown'
        };
      }
    }

    return originalJson.call(this, body);
  };

  next();
};

/**
 * 요청 로깅 미들웨어
 */
export const requestLoggerMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // 응답 완료 시 로깅
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.requestId,
      userId: req.user?.id,
      storeId: req.user?.storeId,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    };

    if (res.statusCode >= 400) {
      HistoryLogger.logError(new Error(`HTTP ${res.statusCode}`), logData);
    } else {
      console.log('📥 API Request:', JSON.stringify(logData));
    }
  });

  next();
};