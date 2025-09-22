import dotenv from 'dotenv';

dotenv.config();

export interface IConfig {
  server: {
    port: number;
    env: string;
  };
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiry: string;
    refreshExpiry: string;
  };
  pg: {
    merchantId: string;
    apiKey: string;
    callbackUrl: string;
    timeout: number;
  };
  services: {
    order: string;
    dashboard: string;
    auth: string;
  };
  receipt: {
    emailFrom: string;
    smsFrom: string;
    templatePath: string;
  };
  cache: {
    ttlShort: number;
    ttlMedium: number;
    ttlLong: number;
  };
  cardReader: {
    enabled: boolean;
    timeout: number;
  };
  logging: {
    level: string;
    format: string;
  };
}

const config: IConfig = {
  server: {
    port: parseInt(process.env.PORT || '3005', 10),
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/aipos?schema=public',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiry: process.env.JWT_EXPIRY || '24h',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  pg: {
    merchantId: process.env.PG_MERCHANT_ID || 'test_merchant_wafl',
    apiKey: process.env.PG_API_KEY || 'test_api_key_12345',
    callbackUrl: process.env.PG_CALLBACK_URL || 'http://localhost:3005/api/v1/payments/callback',
    timeout: parseInt(process.env.PG_TIMEOUT || '30000', 10),
  },
  services: {
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
    dashboard: process.env.DASHBOARD_SERVICE_URL || 'http://localhost:3003',
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  },
  receipt: {
    emailFrom: process.env.RECEIPT_EMAIL_FROM || 'noreply@wafl.com',
    smsFrom: process.env.RECEIPT_SMS_FROM || 'WAFL',
    templatePath: process.env.RECEIPT_TEMPLATE_PATH || './templates',
  },
  cache: {
    ttlShort: parseInt(process.env.CACHE_TTL_SHORT || '300', 10),
    ttlMedium: parseInt(process.env.CACHE_TTL_MEDIUM || '900', 10),
    ttlLong: parseInt(process.env.CACHE_TTL_LONG || '3600', 10),
  },
  cardReader: {
    enabled: process.env.CARD_READER_ENABLED === 'true',
    timeout: parseInt(process.env.CARD_READER_TIMEOUT || '60000', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    format: process.env.LOG_FORMAT || 'json',
  },
};

export default config;