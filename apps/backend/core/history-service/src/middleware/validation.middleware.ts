import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { EHistoryErrorCode } from '../types';
import { HistoryLogger } from '../utils/simple-logger';

/**
 * 유효성 검증 결과 처리 미들웨어
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors = errors.array() as ValidationError[];

    // 첫 번째 에러를 로깅
    if (validationErrors.length > 0) {
      const firstError = validationErrors[0];
      HistoryLogger.logValidationError(
        'path' in firstError ? firstError.path : 'unknown',
        'value' in firstError ? firstError.value : 'unknown',
        firstError.msg
      );
    }

    // 모든 에러를 정리하여 응답
    const formattedErrors = validationErrors.map(error => ({
      field: 'param' in error ? error.param : 'unknown',
      message: error.msg,
      value: 'value' in error ? error.value : undefined
    }));

    res.status(400).json({
      success: false,
      error: {
        code: EHistoryErrorCode.HISTORY_008,
        message: '입력값이 유효하지 않습니다.',
        details: {
          validationErrors: formattedErrors
        }
      }
    });
    return;
  }

  next();
};

/**
 * 에러 처리 미들웨어
 */
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  HistoryLogger.logError(error, {
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    params: req.params
  });

  // Prisma 에러 처리
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;

    if (prismaError.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: {
          code: EHistoryErrorCode.HISTORY_008,
          message: '중복된 데이터입니다.'
        }
      });
      return;
    }

    if (prismaError.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: {
          code: EHistoryErrorCode.HISTORY_001,
          message: '요청된 데이터를 찾을 수 없습니다.'
        }
      });
      return;
    }
  }

  // JSON 파싱 에러
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      success: false,
      error: {
        code: EHistoryErrorCode.HISTORY_008,
        message: 'JSON 형식이 올바르지 않습니다.'
      }
    });
    return;
  }

  // 기본 에러 응답
  const statusCode = (error as any).statusCode || 500;
  const errorCode = statusCode === 404
    ? EHistoryErrorCode.HISTORY_001
    : EHistoryErrorCode.HISTORY_010;

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: error.message || '서버 내부 오류가 발생했습니다.',
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          stack: error.stack
        }
      })
    }
  });
};

/**
 * 404 처리 미들웨어
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: EHistoryErrorCode.HISTORY_001,
      message: `요청한 엔드포인트를 찾을 수 없습니다: ${req.method} ${req.path}`
    }
  });
};