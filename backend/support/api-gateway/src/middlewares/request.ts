import { Request, Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../types';
import { generateRequestId } from '../utils';

export const requestIdMiddleware = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  req.requestId = generateRequestId();
  req.startTime = Date.now();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.requestId);

  // Add request ID to downstream services
  req.headers['x-request-id'] = req.requestId;

  next();
};

export const requestLoggingMiddleware = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Request ID: ${req.requestId}`);

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const responseTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms - Request ID: ${req.requestId}`);
    return originalJson.call(this, body);
  };

  next();
};

export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const origin = req.headers.origin;

  // Set CORS headers
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Store-ID, X-User-Role, Accept-Language'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

export const securityHeadersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
  );

  next();
};

export const headerValidationMiddleware = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Validate required headers for authenticated requests
  if (req.user) {
    const storeId = req.headers['x-store-id'];
    const userRole = req.headers['x-user-role'];

    if (!storeId) {
      req.headers['x-store-id'] = req.user.storeId;
    }

    if (!userRole) {
      req.headers['x-user-role'] = req.user.role;
    }
  }

  // Set API version header
  res.setHeader('X-API-Version', 'v1');

  next();
};