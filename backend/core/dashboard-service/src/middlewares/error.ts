import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';
import { IApiError } from '../types';
import { config } from '../config';

// Custom error classes
export class ApiError extends Error implements IApiError {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export class ValidationApiError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationApiError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with ID '${identifier}' not found`
      : `${resource} not found`;

    super(message, 404, 'RESOURCE_NOT_FOUND', { resource, identifier });
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden access') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, originalError?: any) {
    super(message, 500, 'DATABASE_ERROR', { originalError: originalError?.message });
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service: string, message: string, originalError?: any) {
    super(
      `External service error from ${service}: ${message}`,
      503,
      'EXTERNAL_SERVICE_ERROR',
      { service, originalError: originalError?.message }
    );
    this.name = 'ExternalServiceError';
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error details
  console.error('Error occurred:', {
    name: error.name,
    message: error.message,
    stack: config.env === 'development' ? error.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });

  // Handle different error types
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString(),
      ...(config.env === 'development' && { stack: error.stack })
    });
    return;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;

    switch (prismaError.code) {
      case 'P2002':
        res.status(409).json({
          success: false,
          error: 'Unique constraint violation',
          code: 'DUPLICATE_ENTRY',
          details: prismaError.meta,
          timestamp: new Date().toISOString()
        });
        return;

      case 'P2025':
        res.status(404).json({
          success: false,
          error: 'Record not found',
          code: 'RECORD_NOT_FOUND',
          details: prismaError.meta,
          timestamp: new Date().toISOString()
        });
        return;

      case 'P2003':
        res.status(400).json({
          success: false,
          error: 'Foreign key constraint failed',
          code: 'FOREIGN_KEY_CONSTRAINT',
          details: prismaError.meta,
          timestamp: new Date().toISOString()
        });
        return;

      default:
        res.status(500).json({
          success: false,
          error: 'Database operation failed',
          code: 'DATABASE_ERROR',
          details: config.env === 'development' ? prismaError.meta : undefined,
          timestamp: new Date().toISOString()
        });
        return;
    }
  }

  // Handle Prisma validation errors
  if (error.name === 'PrismaClientValidationError') {
    res.status(400).json({
      success: false,
      error: 'Invalid data provided',
      code: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString(),
      ...(config.env === 'development' && { details: error.message })
    });
    return;
  }

  // Handle JWT errors (if not caught by auth middleware)
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Handle validation errors from express-validator
  if (error.name === 'ValidationError') {
    const validationError = error as any;
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: validationError.details || validationError.errors,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Handle syntax errors
  if (error instanceof SyntaxError) {
    res.status(400).json({
      success: false,
      error: 'Invalid JSON format',
      code: 'SYNTAX_ERROR',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Generic server error
  res.status(500).json({
    success: false,
    error: config.env === 'production' ? 'Internal server error' : error.message,
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
    ...(config.env === 'development' && {
      stack: error.stack,
      details: error
    })
  });
};

// Not found handler (for unmatched routes)
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError('Route', req.originalUrl);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error formatter
export const formatValidationErrors = (errors: any[]): any => {
  const formatted: any = {};

  errors.forEach(error => {
    const field = error.param || error.path || 'unknown';

    if (!formatted[field]) {
      formatted[field] = [];
    }

    formatted[field].push({
      message: error.msg || error.message,
      value: error.value,
      location: error.location
    });
  });

  return formatted;
};

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - start;

    // Log request details
    if (config.env === 'development') {
      console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    }

    originalEnd.apply(this, args);
  };

  next();
};

// Health check for error handling
export const healthCheck = (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'UP',
      service: config.serviceName,
      timestamp: new Date().toISOString(),
      port: config.port,
      environment: config.env,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    }
  });
};