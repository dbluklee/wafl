import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3002', 10),
  serviceName: process.env.SERVICE_NAME || 'store-management-service',

  database: {
    url: process.env.DATABASE_URL!
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10)
  },

  auth: {
    serviceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001'
  },

  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedImageTypes: process.env.ALLOWED_IMAGE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp'
    ]
  },

  qr: {
    baseUrl: process.env.QR_BASE_URL || 'https://order.aipos.kr'
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-this'
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4000']
  }
};