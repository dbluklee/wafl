import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4001', 10),
  serviceName: process.env.SERVICE_NAME || 'auth-service',

  database: {
    url: process.env.DATABASE_URL!
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-this',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // Redis configuration removed - using in-memory store

  sms: {
    apiUrl: process.env.SMS_API_URL || '',
    apiKey: process.env.SMS_API_KEY || '',
    verificationExpiresIn: parseInt(process.env.SMS_VERIFICATION_EXPIRES_IN || '300', 10)
  },

  business: {
    apiUrl: process.env.BUSINESS_API_URL || '',
    apiKey: process.env.BUSINESS_API_KEY || ''
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4000', 'http://localhost:4001']
  }
};