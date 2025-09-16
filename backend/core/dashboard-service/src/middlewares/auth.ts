import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IAuthenticatedRequest } from '../types';
import { config } from '../config';

// JWT payload interface (matches Auth Service format)
interface IJwtPayload {
  userId: string;
  storeId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Authentication middleware
export const authenticate = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_TOKEN_MISSING',
        message: 'Please provide a valid authentication token'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication token is empty',
        code: 'AUTH_TOKEN_EMPTY'
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as IJwtPayload;

    if (!decoded || !decoded.userId || !decoded.storeId) {
      res.status(401).json({
        success: false,
        error: 'Invalid token payload',
        code: 'AUTH_TOKEN_INVALID_PAYLOAD'
      });
      return;
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      storeId: decoded.storeId,
      role: decoded.role || 'staff',
      name: 'User' // Auth service doesn't provide name in JWT
    };

    req.storeId = decoded.storeId;

    next();
  } catch (error: any) {
    console.error('JWT Authentication error:', error);

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Token has expired',
        code: 'AUTH_TOKEN_EXPIRED',
        message: 'Please refresh your token and try again'
      });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        error: 'Invalid token format',
        code: 'AUTH_TOKEN_MALFORMED',
        message: 'Token is malformed or corrupted'
      });
      return;
    }

    if (error.name === 'NotBeforeError') {
      res.status(401).json({
        success: false,
        error: 'Token not active yet',
        code: 'AUTH_TOKEN_NOT_ACTIVE'
      });
      return;
    }

    // Generic authentication error
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_FAILED',
      message: 'Please check your authentication credentials'
    });
  }
};

// Owner-only middleware (requires owner role)
export const requireOwner = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  if (req.user.role !== 'owner') {
    res.status(403).json({
      success: false,
      error: 'Owner access required',
      code: 'AUTH_OWNER_REQUIRED',
      message: 'This operation requires owner privileges'
    });
    return;
  }

  next();
};

// Staff or Owner middleware (requires staff or owner role)
export const requireStaffOrOwner = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  if (!['owner', 'staff'].includes(req.user.role)) {
    res.status(403).json({
      success: false,
      error: 'Staff or Owner access required',
      code: 'AUTH_STAFF_REQUIRED',
      message: 'This operation requires staff or owner privileges'
    });
    return;
  }

  next();
};

// Store validation middleware (ensures user belongs to the store)
export const validateStoreAccess = (paramName: string = 'storeId') => {
  return (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const requestedStoreId = req.params[paramName] || req.body[paramName] || req.query[paramName];

    if (!requestedStoreId) {
      res.status(400).json({
        success: false,
        error: 'Store ID is required',
        code: 'STORE_ID_MISSING'
      });
      return;
    }

    if (req.user.storeId !== requestedStoreId) {
      res.status(403).json({
        success: false,
        error: 'Access denied to this store',
        code: 'STORE_ACCESS_DENIED',
        message: 'You can only access data from your own store'
      });
      return;
    }

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without authentication
    next();
    return;
  }

  // Token provided, try to authenticate
  authenticate(req, res, next);
};

// Rate limiting by user
export const createUserRateLimit = (windowMs: number, max: number) => {
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  return (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      next();
      return;
    }

    const userId = req.user.id;
    const now = Date.now();
    const userLimit = rateLimitMap.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      // First request or window expired
      rateLimitMap.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }

    if (userLimit.count >= max) {
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Maximum ${max} requests per ${windowMs / 1000} seconds exceeded`
      });
      return;
    }

    userLimit.count++;
    next();
  };
};

// Cleanup rate limit map periodically
setInterval(() => {
  // This would be implemented if using the rate limiting function above
}, 5 * 60 * 1000); // Clean up every 5 minutes