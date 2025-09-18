import dotenv from 'dotenv';

dotenv.config();

interface IConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

const config: IConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4009', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:Cl!Wm@Dp!Dl@Em!@localhost:5200/aipos?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'wafl-super-secret-jwt-key-for-all-services-2025',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

// 개발 환경에서 설정 검증
if (config.NODE_ENV === 'development') {
  console.log('🔧 User Profile Service Configuration:');
  console.log(`   NODE_ENV: ${config.NODE_ENV}`);
  console.log(`   PORT: ${config.PORT}`);
  console.log(`   JWT_SECRET: ${config.JWT_SECRET ? '[SET]' : '[MISSING]'}`);
  console.log(`   DATABASE_URL: ${config.DATABASE_URL ? '[SET]' : '[MISSING]'}`);
}

export default config;