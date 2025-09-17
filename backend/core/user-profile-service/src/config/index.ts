import dotenv from 'dotenv';

dotenv.config();

interface IConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;

  // Service URLs
  AUTH_SERVICE_URL: string;
  ORDER_SERVICE_URL: string;
  DASHBOARD_SERVICE_URL: string;
  PAYMENT_SERVICE_URL: string;
  STORE_MANAGEMENT_URL: string;

  // Upload Settings
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;

  // Points System
  POINT_EARN_RATE: number;
  POINT_EXPIRY_DAYS: number;

  // Cache Settings
  CACHE_TTL: number;
}

const config: IConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3009', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/aipos?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',

  // Service URLs
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
  DASHBOARD_SERVICE_URL: process.env.DASHBOARD_SERVICE_URL || 'http://localhost:3003',
  PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
  STORE_MANAGEMENT_URL: process.env.STORE_MANAGEMENT_URL || 'http://localhost:3002',

  // Upload Settings
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB

  // Points System
  POINT_EARN_RATE: parseFloat(process.env.POINT_EARN_RATE || '0.05'),
  POINT_EXPIRY_DAYS: parseInt(process.env.POINT_EXPIRY_DAYS || '365', 10),

  // Cache Settings
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutes
};

// 개발 환경에서 설정 검증
if (config.NODE_ENV === 'development') {
  console.log('🔧 User Profile Service Configuration:');
  console.log(`   NODE_ENV: ${config.NODE_ENV}`);
  console.log(`   PORT: ${config.PORT}`);
  console.log(`   JWT_SECRET: ${config.JWT_SECRET ? '[SET]' : '[MISSING]'}`);
  console.log(`   DATABASE_URL: ${config.DATABASE_URL ? '[SET]' : '[MISSING]'}`);
  console.log(`   UPLOAD_DIR: ${config.UPLOAD_DIR}`);
  console.log(`   CACHE_TTL: ${config.CACHE_TTL}s`);
  console.log(`   POINT_EARN_RATE: ${config.POINT_EARN_RATE * 100}%`);
}

export default config;