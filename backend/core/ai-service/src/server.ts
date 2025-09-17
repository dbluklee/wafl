import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cron from 'node-cron';

import config from '@/config';
import logger from '@/utils/logger';
import { cache } from '@/utils/cache';
import ollamaService from '@/services/ollama.service';
import contextService from '@/services/context.service';

// Routes
import aiRoutes from '@/routes/ai.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.nodeEnv === 'production' ?
    ['https://wafl.app', 'https://admin.wafl.app'] :
    true,
  credentials: true
}));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();

    // Ollama 연결 확인
    const ollamaHealthy = await ollamaService.healthCheck();

    // 캐시 통계
    const cacheStats = cache.getStats();

    // 메모리 사용량
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    const responseTime = Date.now() - startTime;

    const healthData = {
      status: ollamaHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      responseTime: responseTime,
      version: '1.0.0',
      service: config.serviceName,
      dependencies: {
        ollama: ollamaHealthy ? 'connected' : 'disconnected',
        cache: {
          status: 'active',
          ...cacheStats
        }
      },
      memory: memUsageMB,
      environment: config.nodeEnv
    };

    if (ollamaHealthy) {
      res.json(healthData);
    } else {
      res.status(503).json(healthData);
    }
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message
    });
  }
});

// API routes
app.use('/api/v1/ai', aiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  res.status(500).json({
    success: false,
    error: config.nodeEnv === 'production' ?
      'Internal server error' :
      err.message
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Background tasks
// 캐시 정리 작업 (매 5분)
cron.schedule('*/5 * * * *', () => {
  try {
    const cleaned = cache.cleanup();
    if (cleaned > 0) {
      logger.info(`Cache cleanup: ${cleaned} expired entries removed`);
    }
  } catch (error) {
    logger.error('Cache cleanup failed:', error);
  }
});

// 대화 세션 정리 작업 (매 10분)
cron.schedule('*/10 * * * *', () => {
  try {
    const cleaned = contextService.cleanupExpiredSessions();
    if (cleaned > 0) {
      logger.info(`Session cleanup: ${cleaned} expired sessions removed`);
    }
  } catch (error) {
    logger.error('Session cleanup failed:', error);
  }
});

// 로그 디렉토리 생성
import fs from 'fs';
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// 서버 시작
const server = app.listen(config.port, async () => {
  logger.info(`🤖 AI Service started on port ${config.port}`);
  logger.info(`📊 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Ollama Server: ${config.ollama.baseUrl}`);
  logger.info(`🧠 Model: ${config.ollama.model}`);

  // 시작 시 Ollama 연결 테스트
  try {
    const healthy = await ollamaService.healthCheck();
    if (healthy) {
      logger.info('✅ Ollama connection verified');
    } else {
      logger.warn('⚠️ Ollama connection failed - service will start in degraded mode');
    }
  } catch (error) {
    logger.error('❌ Ollama connection test failed:', error);
  }
});

export default app;