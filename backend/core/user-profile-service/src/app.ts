import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';

// 라우터 imports
import profileRoutes from './routes/profile.routes';
import staffRoutes from './routes/staff.routes';

// 설정
import config from './config';

const app: Application = express();

// 보안 미들웨어
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS 설정
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-production-domain.com']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 일반 미들웨어
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일 제공 (프로필 이미지)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 요청 로깅 (개발 환경)
if (config.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// 헬스체크 엔드포인트
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    service: 'user-profile-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    port: config.PORT
  });
});

// 기본 루트
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'WAFL User Profile Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      profile: '/api/v1/profile',
      staff: '/api/v1/profile/staff'
    }
  });
});

// API 라우트
app.use('/api/v1/profile/staff', staffRoutes);        // 직원 관리 (staff 먼저)
app.use('/api/v1/profile', profileRoutes);            // 프로필 관리

// 404 처리
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: '요청하신 엔드포인트를 찾을 수 없습니다.',
    path: req.path
  });
});

// 에러 처리
app.use((error: any, req: Request, res: Response, next: any) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: '서버 내부 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default app;