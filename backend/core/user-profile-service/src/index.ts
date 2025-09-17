import app from './app';
import config from './config';
import { PrismaClient } from '../../../../node_modules/@prisma/client';

const prisma = new PrismaClient();

// Graceful shutdown 핸들러
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  try {
    // Prisma 연결 종료
    await prisma.$disconnect();
    console.log('📦 Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// 시그널 핸들러 등록
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 처리되지 않은 예외 핸들러
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 연결 테스트
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // 서버 시작
    const server = app.listen(config.PORT, () => {
      console.log('\n🚀 User Profile Service started successfully!');
      console.log(`📍 Server running on port ${config.PORT}`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${config.PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${config.PORT}/api/v1/profile`);
      console.log('\n📋 Available endpoints:');
      console.log('   Profile Management:');
      console.log('     GET    /api/v1/profile                    - Get my profile');
      console.log('     PUT    /api/v1/profile                    - Update profile (name)');
      console.log('     PUT    /api/v1/profile/pin                - Change PIN');
      console.log('     PUT    /api/v1/profile/language           - Update language setting');
      console.log('\n   Staff Management (Owner only):');
      console.log('     GET    /api/v1/profile/staff              - Get staff list');
      console.log('     POST   /api/v1/profile/staff              - Add staff');
      console.log('     PUT    /api/v1/profile/staff/:staffId     - Update staff');
      console.log('     PATCH  /api/v1/profile/staff/:staffId/status - Toggle staff status');
      console.log('\n🎯 Ready to accept requests!');
    });

    // Keep-alive 설정
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// 서버 시작
startServer().catch((error) => {
  console.error('💥 Server startup failed:', error);
  process.exit(1);
});