import 'express-async-errors';
import { createApp } from './app';
import { config } from './config';
// Using memory store instead of Redis for development
import { prisma } from '@shared/database';

const startServer = async () => {
  try {
    // Database 연결
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Using in-memory session store for development
    console.log('💾 Using in-memory session store');

    // Express 앱 생성
    const app = createApp();

    // 서버 시작 (외부 접근 가능하도록 0.0.0.0 바인딩)
    const server = app.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 ${config.serviceName} is running on port ${config.port}`);
      console.log(`📍 Environment: ${config.env}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/health`);
      console.log(`🌐 External access: http://112.148.37.41:${config.port}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);

      server.close(async () => {
        console.log('HTTP server closed');

        try {
          await prisma.$disconnect();
          console.log('Database disconnected');
        } catch (error) {
          console.error('Database disconnect error:', error);
        }

        // Memory store cleanup happens automatically

        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();