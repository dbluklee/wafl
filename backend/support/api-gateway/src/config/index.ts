import dotenv from 'dotenv';
import { IConfig, IServiceRegistry, IServiceConfig } from '../types';

dotenv.config();

const createServiceConfig = (
  name: string,
  url: string,
  healthPath: string = '/health'
): IServiceConfig => ({
  name,
  url: url || `http://localhost:${3000 + parseInt(name.split('-')[0]) || 1}`,
  healthPath,
  timeout: parseInt(process.env.SERVICE_TIMEOUT || '5000'),
  retries: 3,
  isHealthy: false,
});

const services: IServiceRegistry = {
  'auth-service': createServiceConfig(
    'auth-service',
    process.env.AUTH_SERVICE_URL || 'http://localhost:4001'
  ),
  'store-management-service': createServiceConfig(
    'store-management-service',
    process.env.STORE_MANAGEMENT_SERVICE_URL || 'http://112.148.37.41:4002'
  ),
  'dashboard-service': createServiceConfig(
    'dashboard-service',
    process.env.DASHBOARD_SERVICE_URL || 'http://112.148.37.41:4003'
  ),
  'order-service': createServiceConfig(
    'order-service',
    process.env.ORDER_SERVICE_URL || 'http://112.148.37.41:4004'
  ),
  'payment-service': createServiceConfig(
    'payment-service',
    process.env.PAYMENT_SERVICE_URL || 'http://112.148.37.41:4005'
  ),
  'ai-service': createServiceConfig(
    'ai-service',
    process.env.AI_SERVICE_URL || 'http://112.148.37.41:4006'
  ),
  'analytics-service': createServiceConfig(
    'analytics-service',
    process.env.ANALYTICS_SERVICE_URL || 'http://112.148.37.41:4007'
  ),
  'notification-service': createServiceConfig(
    'notification-service',
    process.env.NOTIFICATION_SERVICE_URL || 'http://112.148.37.41:4008'
  ),
  'user-profile-service': createServiceConfig(
    'user-profile-service',
    process.env.USER_PROFILE_SERVICE_URL || 'http://112.148.37.41:4009'
  ),
  'history-service': createServiceConfig(
    'history-service',
    process.env.HISTORY_SERVICE_URL || 'http://112.148.37.41:4010'
  ),
  'scraping-service': createServiceConfig(
    'scraping-service',
    process.env.SCRAPING_SERVICE_URL || 'http://112.148.37.41:4011'
  ),
  'qr-service': createServiceConfig(
    'qr-service',
    process.env.QR_SERVICE_URL || 'http://112.148.37.41:4012'
  ),
};

const config: IConfig = {
  app: {
    port: parseInt(process.env.PORT || '4000'),
    version: process.env.API_VERSION || 'v1',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-api-gateway-2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },
  services,
  websocket: {
    port: parseInt(process.env.WS_PORT || '4000'),
    path: process.env.WS_PATH || '/ws',
  },
  // Redis configuration removed - using in-memory store
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    format: process.env.LOG_FORMAT || 'combined',
  },
};

export default config;