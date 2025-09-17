import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { IApiResponse, IServiceError, IValidationError } from '@/types';

export class PaymentServiceError extends Error implements IServiceError {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_SERVER_ERROR', details?: any) {
    super(message);
    this.name = 'PaymentServiceError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const handleValidationErrors = (
  req: Request,
  res: Response<IApiResponse>,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors: IValidationError[] = errors.array().map((error) => ({
      field: ('param' in error ? error.param : 'unknown') as string,
      message: error.msg,
      value: 'value' in error ? error.value : undefined,
    }));

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        details: { errors: validationErrors },
      },
    });
    return;
  }

  next();
};

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response<IApiResponse>,
  _next: NextFunction
): void => {
  console.error('[Payment Service Error]:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString(),
  });

  if (error instanceof PaymentServiceError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    });
    return;
  }

  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
      },
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expired',
      },
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response<IApiResponse>
): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};