import dotenv from 'dotenv';

dotenv.config();

interface IConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;

  // Service URLs
  AUTH_SERVICE_URL: string;
  STORE_MANAGEMENT_URL: string;
  DASHBOARD_SERVICE_URL: string;
  ORDER_SERVICE_URL: string;
  PAYMENT_SERVICE_URL: string;
  USER_PROFILE_SERVICE_URL: string;
  API_GATEWAY_URL: string;

  // History Service Settings
  UNDO_DEADLINE_MINUTES: number;
  MAX_HISTORY_ENTRIES_PER_PAGE: number;
  HISTORY_RETENTION_DAYS: number;

  // Cache Settings
  CACHE_TTL_SHORT: number;
  CACHE_TTL_MEDIUM: number;
  CACHE_TTL_LONG: number;

  // Logging Settings
  LOG_LEVEL: string;
  LOG_FILE_PATH: string;
  LOG_MAX_SIZE: string;
  LOG_MAX_FILES: string;

  // Service Name
  SERVICE_NAME: string;
}

const config: IConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4010', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:Cl!Wm@Dp!Dl@Em!@localhost:5432/aipos?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',

  // Service URLs
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  STORE_MANAGEMENT_URL: process.env.STORE_MANAGEMENT_URL || 'http://localhost:4002',
  DASHBOARD_SERVICE_URL: process.env.DASHBOARD_SERVICE_URL || 'http://localhost:4003',
  ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL || 'http://localhost:4004',
  PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL || 'http://localhost:4005',
  USER_PROFILE_SERVICE_URL: process.env.USER_PROFILE_SERVICE_URL || 'http://localhost:4009',
  API_GATEWAY_URL: process.env.API_GATEWAY_URL || 'http://localhost:4000',

  // History Service Settings
  UNDO_DEADLINE_MINUTES: parseInt(process.env.UNDO_DEADLINE_MINUTES || '30', 10),
  MAX_HISTORY_ENTRIES_PER_PAGE: parseInt(process.env.MAX_HISTORY_ENTRIES_PER_PAGE || '20', 10),
  HISTORY_RETENTION_DAYS: parseInt(process.env.HISTORY_RETENTION_DAYS || '90', 10),

  // Cache Settings
  CACHE_TTL_SHORT: parseInt(process.env.CACHE_TTL_SHORT || '30', 10),     // 30초
  CACHE_TTL_MEDIUM: parseInt(process.env.CACHE_TTL_MEDIUM || '300', 10),  // 5분
  CACHE_TTL_LONG: parseInt(process.env.CACHE_TTL_LONG || '3600', 10),     // 1시간

  // Logging Settings
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs',
  LOG_MAX_SIZE: process.env.LOG_MAX_SIZE || '10m',
  LOG_MAX_FILES: process.env.LOG_MAX_FILES || '5',

  // Service Name
  SERVICE_NAME: process.env.SERVICE_NAME || 'history-service'
};

// 필수 환경 변수 검증
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// 개발 환경에서 설정 검증 및 출력
if (config.NODE_ENV === 'development') {
  console.log('🔧 History Service Configuration:');
  console.log(`   NODE_ENV: ${config.NODE_ENV}`);
  console.log(`   PORT: ${config.PORT}`);
  console.log(`   SERVICE_NAME: ${config.SERVICE_NAME}`);
  console.log(`   JWT_SECRET: ${config.JWT_SECRET ? '[SET]' : '[MISSING]'}`);
  console.log(`   DATABASE_URL: ${config.DATABASE_URL ? '[SET]' : '[MISSING]'}`);
  console.log(`   UNDO_DEADLINE_MINUTES: ${config.UNDO_DEADLINE_MINUTES}분`);
  console.log(`   MAX_HISTORY_ENTRIES_PER_PAGE: ${config.MAX_HISTORY_ENTRIES_PER_PAGE}개`);
  console.log(`   HISTORY_RETENTION_DAYS: ${config.HISTORY_RETENTION_DAYS}일`);
  console.log(`   CACHE_TTL_SHORT: ${config.CACHE_TTL_SHORT}초`);
  console.log(`   CACHE_TTL_MEDIUM: ${config.CACHE_TTL_MEDIUM}초`);
  console.log(`   CACHE_TTL_LONG: ${config.CACHE_TTL_LONG}초`);
  console.log(`   LOG_LEVEL: ${config.LOG_LEVEL}`);
  console.log(`   LOG_FILE_PATH: ${config.LOG_FILE_PATH}`);
}

export default config;