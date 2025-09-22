import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/errorHandler';

export const createApp = () => {
  const app = express();

  // 보안 미들웨어
  app.use(helmet());

  // CORS 설정
  app.use(cors({
    origin: config.cors.origin,
    credentials: true
  }));

  // 압축
  app.use(compression());

  // 로깅
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
    }
  });

  app.use('/api/v1/auth/mobile', limiter);
  app.use('/api/v1/auth/login', limiter);

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      service: config.serviceName,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // API Routes
  app.use('/api/v1/auth', authRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '요청하신 경로를 찾을 수 없습니다'
      }
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};