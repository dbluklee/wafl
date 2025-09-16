import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import { storeContext } from './middlewares/storeContext';
import { errorHandler } from './middlewares/errorHandler';

// Routes
import categoryRoutes from './routes/category.routes';
import menuRoutes from './routes/menu.routes';
import placeRoutes from './routes/place.routes';
import tableRoutes from './routes/table.routes';

export const createApp = () => {
  const app = express();

  // 보안 미들웨어
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // CORS 설정
  app.use(cors({
    origin: config.cors.origin,
    credentials: true
  }));

  // 로깅
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files (업로드된 이미지)
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  });

  app.use('/api/v1', limiter);

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      service: config.serviceName,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // Store context middleware
  app.use(storeContext);

  // API Routes
  app.use('/api/v1/store/categories', categoryRoutes);
  app.use('/api/v1/store/menus', menuRoutes);
  app.use('/api/v1/store/places', placeRoutes);
  app.use('/api/v1/store/tables', tableRoutes);

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