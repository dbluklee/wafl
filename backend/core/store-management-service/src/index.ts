import { createApp } from './app';
import { config } from './config';
import { prisma } from '@shared/database';
import fs from 'fs/promises';
import path from 'path';

const startServer = async () => {
  try {
    // Upload 디렉토리 생성
    const uploadDir = path.join(__dirname, '../uploads/menus');
    await fs.mkdir(uploadDir, { recursive: true });

    // Database 연결
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    console.log('📦 Using in-memory cache (Redis disabled)');

    // Express 앱 생성
    const app = createApp();

    // 서버 시작
    const server = app.listen(config.port, () => {
      console.log(`🚀 ${config.serviceName} is running on port ${config.port}`);
      console.log(`📍 Environment: ${config.env}`);
      console.log(`📁 Upload directory: ${config.upload.dir}`);
      console.log(`🔗 API Gateway URL: http://localhost:8080/api/v1/store`);
      console.log(`🔐 JWT Secret configured: ${config.jwt.secret.substring(0, 10)}...`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);

      server.close(async () => {
        console.log('HTTP server closed');

        await prisma.$disconnect();
        console.log('Database disconnected');

        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();