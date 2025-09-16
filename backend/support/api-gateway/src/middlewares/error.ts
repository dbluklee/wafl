import { Request, Response, NextFunction } from 'express';
import { IAuthenticatedRequest, IAPIError, EErrorCode } from '../types';
import { createErrorResponse } from '../utils';

export class APIError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: string, message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const errorHandler = (
  error: any,
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  let apiError: IAPIError;

  if (error instanceof APIError) {
    apiError = {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  } else if (error.name === 'ValidationError') {
    apiError = {
      code: EErrorCode.BAD_REQUEST,
      message: 'Validation failed',
      statusCode: 400,
      details: error.details || error.message,
    };
  } else if (error.name === 'UnauthorizedError') {
    apiError = {
      code: EErrorCode.AUTH_TOKEN_EXPIRED,
      message: 'Unauthorized',
      statusCode: 401,
    };
  } else if (error.code === 'ECONNREFUSED') {
    apiError = {
      code: EErrorCode.SERVICE_UNAVAILABLE,
      message: 'Service temporarily unavailable',
      statusCode: 503,
    };
  } else if (error.code === 'TIMEOUT') {
    apiError = {
      code: EErrorCode.SERVICE_TIMEOUT,
      message: 'Service request timeout',
      statusCode: 504,
    };
  } else {
    // Log unexpected errors
    console.error('Unexpected error:', {
      message: error.message,
      stack: error.stack,
      requestId: req.requestId,
    });

    apiError = {
      code: EErrorCode.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      statusCode: 500,
    };
  }

  const response = createErrorResponse(apiError, req.requestId);
  res.status(apiError.statusCode).json(response);
};

export const notFoundHandler = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const apiError: IAPIError = {
    code: EErrorCode.NOT_FOUND,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    statusCode: 404,
  };

  const response = createErrorResponse(apiError, req.requestId);
  res.status(404).json(response);
};

export const asyncHandler = (
  fn: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const timeoutHandler = (timeout: number = 30000) => {
  return (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        const error = new APIError(
          EErrorCode.SERVICE_TIMEOUT,
          'Request timeout',
          504
        );
        next(error);
      }
    }, timeout);

    // Clear timeout when response is finished
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};