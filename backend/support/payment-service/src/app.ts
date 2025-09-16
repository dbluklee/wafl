import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import config from '@/config';
import { globalErrorHandler, notFoundHandler } from '@/middlewares/error';
import { IApiResponse, IHealthCheckResponse } from '@/types';
import routes from '@/routes';

const app = express();

app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.server.env === 'development' ? '*' : [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:8080',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    body: req.method !== 'GET' ? req.body : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
  });
  next();
});

app.get('/health', (_req, res: express.Response<IApiResponse<IHealthCheckResponse>>) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      service: 'payment-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: {
          status: 'UP',
          latency: 0,
        },
        'order-service': {
          status: 'UP',
        },
        'dashboard-service': {
          status: 'UP',
        },
        'pg-gateway': {
          status: 'UP',
        },
      },
    },
  });
});

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;