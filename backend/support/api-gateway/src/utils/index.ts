import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import config from '../config';
import { IJWTPayload, IAPIResponse, IAPIError } from '../types';

export const generateRequestId = (): string => {
  return uuidv4();
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const createSuccessResponse = <T>(
  data: T,
  requestId: string
): IAPIResponse<T> => {
  return {
    success: true,
    data,
    meta: {
      timestamp: getCurrentTimestamp(),
      version: config.app.version,
      requestId,
    },
  };
};

export const createErrorResponse = (
  error: IAPIError,
  requestId: string
): IAPIResponse => {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
    meta: {
      timestamp: getCurrentTimestamp(),
      version: config.app.version,
      requestId,
    },
  };
};

export const verifyJWT = (token: string): IJWTPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as IJWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const extractBearerToken = (authorization?: string): string | null => {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  return authorization.substring(7);
};

export const isPublicRoute = (path: string, publicRoutes: string[]): boolean => {
  return publicRoutes.some(route => {
    if (route.includes('*')) {
      const baseRoute = route.replace('*', '');
      return path.startsWith(baseRoute);
    }
    return path === route || path.startsWith(route + '/');
  });
};

export const findMatchingRoute = (path: string, routes: any[]): any | null => {
  for (const route of routes) {
    if (path.startsWith(route.path)) {
      return route;
    }
  }
  return null;
};

export const sanitizeHeaders = (headers: any): any => {
  const sanitized = { ...headers };
  delete sanitized.authorization;
  delete sanitized.cookie;
  return sanitized;
};

export const calculateResponseTime = (startTime: number): number => {
  return Date.now() - startTime;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getClientIP = (req: any): string => {
  return req.ip ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '0.0.0.0';
};

export const isHealthCheckPath = (path: string): boolean => {
  const healthPaths = ['/health', '/api/health', '/healthcheck', '/ping'];
  return healthPaths.includes(path);
};

export const extractServiceName = (target: string): string => {
  return target.replace('-service', '');
};

export const buildProxyPath = (originalPath: string, routePath: string): string => {
  return originalPath.replace(routePath, '');
};

export const logRequest = (req: any, res: any, responseTime: number): void => {
  const method = req.method;
  const url = req.originalUrl || req.url;
  const status = res.statusCode;
  const contentLength = res.get('Content-Length') || '0';
  const userAgent = req.get('User-Agent') || '';
  const ip = getClientIP(req);

  console.log(`${method} ${url} ${status} ${contentLength} - ${responseTime}ms - ${ip} "${userAgent}"`);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const maskSensitiveData = (data: any): any => {
  const masked = { ...data };
  const sensitiveFields = ['password', 'pin', 'token', 'secret', 'key'];

  for (const field of sensitiveFields) {
    if (masked[field]) {
      masked[field] = '***';
    }
  }

  return masked;
};

export const parseJSONSafe = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
};