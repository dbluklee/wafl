import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3004', 10),
  serviceName: process.env.SERVICE_NAME || 'order-service',

  database: {
    url: process.env.DATABASE_URL!
  },

  auth: {
    serviceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
  },

  store: {
    serviceUrl: process.env.STORE_SERVICE_URL || 'http://localhost:3002'
  },

  websocket: {
    port: parseInt(process.env.WEBSOCKET_PORT || '3004', 10),
    path: process.env.WEBSOCKET_PATH || '/socket.io'
  },

  order: {
    numberPrefix: process.env.ORDER_NUMBER_PREFIX || 'A',
    resetDaily: process.env.ORDER_NUMBER_RESET_DAILY === 'true',
    defaultPrepTime: parseInt(process.env.DEFAULT_PREP_TIME || '15', 10)
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:4000',
      'http://localhost:4002'
    ]
  }
};