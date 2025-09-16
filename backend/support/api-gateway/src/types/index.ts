import { Request } from 'express';

// API Gateway Types
export interface IServiceConfig {
  name: string;
  url: string;
  healthPath: string;
  timeout: number;
  retries: number;
  isHealthy: boolean;
  lastHealthCheck?: Date;
}

export interface IRouteConfig {
  path: string;
  target: string;
  methods?: string[];
  requireAuth: boolean;
  requiredRoles?: string[];
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  timeout?: number;
  retries?: number;
}

// JWT Types
export interface IJWTPayload {
  userId: string;
  storeId: string;
  role: 'owner' | 'staff' | 'customer';
  sessionId?: string;
  iat?: number;
  exp?: number;
}

// Extended Request Type
export interface IAuthenticatedRequest extends Request {
  user?: IJWTPayload;
  requestId: string;
  startTime: number;
}

// Service Discovery Types
export interface IServiceRegistry {
  [serviceName: string]: IServiceConfig;
}

// WebSocket Types
export interface IWebSocketMessage {
  type: string;
  storeId?: string;
  userId?: string;
  timestamp: string;
  payload: any;
}

export interface IWebSocketSubscription {
  storeId: string;
  userId?: string;
  events: string[];
  topics: string[];
}

// Error Types
export interface IAPIError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

// Response Types
export interface IAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

// Proxy Options
export interface IProxyOptions {
  target: string;
  changeOrigin: boolean;
  pathRewrite?: { [key: string]: string };
  onProxyReq?: (proxyReq: any, req: any, res: any) => void;
  onProxyRes?: (proxyRes: any, req: any, res: any) => void;
  onError?: (err: any, req: any, res: any) => void;
  timeout?: number;
}

// Rate Limiting Types
export interface IRateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

// Health Check Types
export interface IHealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
  timestamp: string;
}

export interface ISystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: IHealthCheckResult[];
  timestamp: string;
  uptime: number;
}

// Metrics Types
export interface IServiceMetrics {
  requests: number;
  responses: number;
  errors: number;
  averageResponseTime: number;
  lastActivity: Date;
}

export interface IGatewayMetrics {
  [serviceName: string]: IServiceMetrics;
}

// Configuration Types
export interface IConfig {
  app: {
    port: number;
    version: string;
    nodeEnv: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
  rateLimit: IRateLimitConfig;
  services: IServiceRegistry;
  websocket: {
    port: number;
    path: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  logging: {
    level: string;
    format: string;
  };
}

// Enums
export enum EServiceStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

export enum EUserRole {
  OWNER = 'owner',
  STAFF = 'staff',
  CUSTOMER = 'customer'
}

export enum EErrorCode {
  // Authentication Errors
  AUTH_TOKEN_MISSING = 'AUTH_001',
  AUTH_TOKEN_EXPIRED = 'AUTH_002',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_003',

  // Service Errors
  SERVICE_UNAVAILABLE = 'SERVICE_001',
  SERVICE_TIMEOUT = 'SERVICE_002',
  SERVICE_ERROR = 'SERVICE_003',

  // Gateway Errors
  GATEWAY_INVALID_ROUTE = 'GATEWAY_001',
  GATEWAY_RATE_LIMIT = 'GATEWAY_002',
  GATEWAY_INVALID_REQUEST = 'GATEWAY_003',

  // Generic Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_001',
  BAD_REQUEST = 'BAD_REQUEST_001',
  NOT_FOUND = 'NOT_FOUND_001'
}