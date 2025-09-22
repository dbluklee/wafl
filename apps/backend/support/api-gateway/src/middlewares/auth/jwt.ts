import { Request, Response, NextFunction } from 'express';
import { IAuthenticatedRequest, IJWTPayload, EErrorCode } from '../../types';
import { verifyJWT, extractBearerToken, createErrorResponse } from '../../utils';
import { publicRoutes } from '../../config/routes';

export const jwtAuthMiddleware = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Skip authentication for public routes
  if (isPublicRoute(req.path)) {
    return next();
  }

  const authorization = req.headers.authorization;
  const token = extractBearerToken(authorization);

  if (!token) {
    res.status(401).json(
      createErrorResponse(
        {
          code: EErrorCode.AUTH_TOKEN_MISSING,
          message: 'Authentication token is required',
          statusCode: 401,
        },
        req.requestId
      )
    );
    return;
  }

  const payload = verifyJWT(token);

  if (!payload) {
    res.status(401).json(
      createErrorResponse(
        {
          code: EErrorCode.AUTH_TOKEN_EXPIRED,
          message: 'Invalid or expired token',
          statusCode: 401,
        },
        req.requestId
      )
    );
    return;
  }

  // Attach user info to request
  req.user = payload;

  // Add auth headers for downstream services
  req.headers['x-user-id'] = payload.userId;
  req.headers['x-store-id'] = payload.storeId;
  req.headers['x-user-role'] = payload.role;

  if (payload.sessionId) {
    req.headers['x-session-id'] = payload.sessionId;
  }

  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(
        createErrorResponse(
          {
            code: EErrorCode.AUTH_TOKEN_MISSING,
            message: 'Authentication required',
            statusCode: 401,
          },
          req.requestId
        )
      );
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json(
        createErrorResponse(
          {
            code: EErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
            message: 'Insufficient permissions',
            details: {
              required: allowedRoles,
              current: req.user.role,
            },
            statusCode: 403,
          },
          req.requestId
        )
      );
      return;
    }

    next();
  };
};

export const requireOwnerOrStaff = requireRole(['owner', 'staff']);

export const requireOwnerOnly = requireRole(['owner']);

function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => {
    if (route.includes('*')) {
      const baseRoute = route.replace('*', '');
      return path.startsWith(baseRoute);
    }
    return path === route || path.startsWith(route + '/');
  });
}