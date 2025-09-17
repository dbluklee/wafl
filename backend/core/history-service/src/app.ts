import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import config from './config';
import { responseMiddleware, requestLoggerMiddleware } from './middleware/auth.middleware';
import { errorHandler, notFoundHandler } from './middleware/validation.middleware';
import historyRoutes from './routes/history.routes';
import { historyCache } from './utils/cache';
import logger from './utils/simple-logger';

const app = express();

// 보안 미들웨어
app.use(helmet());

// CORS 설정
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['http://localhost:4000'] // API Gateway만 허용
    : true, // 개발 환경에서는 모든 origin 허용
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Internal-Request']
}));

// 요청 압축
app.use(compression());

// JSON 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 커스텀 미들웨어
app.use(responseMiddleware);
app.use(requestLoggerMiddleware);

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  const cacheStats = historyCache.getStats();
  const memoryUsage = process.memoryUsage();

  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: config.SERVICE_NAME,
      port: config.PORT,
      environment: config.NODE_ENV,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      logProcessor: 'operational',
      storageUsage: 'N/A', // 실제 구현시 디스크 사용량 체크
      lastBackup: null, // 실제 구현시 마지막 백업 시간
      cacheStats: {
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hitRate: cacheStats.hitRate,
        memoryUsage: `${historyCache.getMemoryUsage()}KB`,
        totalEntries: historyCache.size()
      },
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
      }
    }
  });
});

// API 라우트
app.use('/api/v1/history', historyRoutes);

// 404 핸들러
app.use(notFoundHandler);

// 에러 핸들러
app.use(errorHandler);

// Graceful shutdown 처리
process.on('SIGTERM', () => {
  logger.info('SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT 신호를 받았습니다. 서버를 종료합니다...');
  process.exit(0);
});

// 처리되지 않은 Promise rejection 처리
process.on('unhandledRejection', (reason, promise) => {
  logger.error('처리되지 않은 Promise rejection:', {
    reason,
    promise
  });
});

// 처리되지 않은 예외 처리
process.on('uncaughtException', (error) => {
  logger.error('처리되지 않은 예외:', error);
  process.exit(1);
});

export default app;