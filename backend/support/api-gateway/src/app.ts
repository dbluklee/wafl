import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import config from './config';
import { routeConfigs } from './config/routes';
import { IAuthenticatedRequest } from './types';

// Middlewares
import {
  requestIdMiddleware,
  requestLoggingMiddleware,
  corsMiddleware,
  securityHeadersMiddleware,
  headerValidationMiddleware,
} from './middlewares/request';
import { jwtAuthMiddleware, requireRole } from './middlewares/auth/jwt';
import { errorHandler, notFoundHandler, timeoutHandler } from './middlewares/error';
import { createServiceProxy } from './middlewares/proxy';

// Routes
import gatewayRoutes from './routes/gateway';

// Services
import { HealthService } from './services/health';

class APIGateway {
  private app: express.Application;
  private healthService: HealthService;

  constructor() {
    this.app = express();
    this.healthService = HealthService.getInstance();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeProxyRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middlewares
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // Compression
    this.app.use(compression());

    // CORS
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Store-ID',
        'X-User-Role',
        'Accept-Language',
      ],
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request processing
    this.app.use(requestIdMiddleware as any);
    this.app.use(securityHeadersMiddleware as any);

    // Logging (only in development)
    if (config.app.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    }

    // Request logging
    this.app.use(requestLoggingMiddleware as any);

    // Global rate limiting
    this.app.use(rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: config.rateLimit.message,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: config.app.version,
        },
      },
      standardHeaders: config.rateLimit.standardHeaders,
      legacyHeaders: config.rateLimit.legacyHeaders,
      skip: (req) => {
        // Skip rate limiting for health checks
        return req.path.includes('/health') || req.path.includes('/ping');
      },
    }));

    // Global timeout
    this.app.use(timeoutHandler(30000) as any);

    // JWT Authentication (will skip public routes internally)
    this.app.use(jwtAuthMiddleware as any);

    // Header validation and enhancement
    this.app.use(headerValidationMiddleware as any);
  }

  private initializeRoutes(): void {
    // Gateway-specific routes
    this.app.use('/api/v1/gateway', gatewayRoutes);

    // Health check endpoints
    this.app.get('/health', (req: any, res: any) => {
      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: config.app.version,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: config.app.version,
          requestId: req.requestId,
        },
      });
    });

    this.app.get('/ping', (req: any, res: any) => {
      res.json({
        success: true,
        data: { message: 'pong', timestamp: new Date().toISOString() },
      });
    });
  }

  private initializeProxyRoutes(): void {
    console.log(`[Gateway] Initializing ${routeConfigs.length} proxy routes...`);

    // Sort routes by path length (longer paths first to avoid conflicts)
    const sortedRoutes = [...routeConfigs].sort((a, b) => b.path.length - a.path.length);

    sortedRoutes.forEach(routeConfig => {
      try {
        console.log(`[Gateway] Setting up route: ${routeConfig.path} -> ${routeConfig.target}`);

        // Create route-specific middleware chain
        const middlewares: express.RequestHandler[] = [];

        // Route-specific rate limiting
        if (routeConfig.rateLimit) {
          middlewares.push(rateLimit({
            windowMs: routeConfig.rateLimit.windowMs,
            max: routeConfig.rateLimit.max,
            message: {
              success: false,
              error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: `Rate limit exceeded for ${routeConfig.path}`,
              },
            },
          }));
        }

        // Role-based authorization
        if (routeConfig.requireAuth && routeConfig.requiredRoles) {
          middlewares.push(requireRole(routeConfig.requiredRoles) as any);
        }

        // Route-specific timeout
        if (routeConfig.timeout) {
          middlewares.push(timeoutHandler(routeConfig.timeout) as any);
        }

        // Create proxy middleware
        const proxyMiddleware = createServiceProxy(routeConfig);
        middlewares.push(proxyMiddleware);

        // Register the route with all middlewares
        this.app.use(routeConfig.path, ...middlewares);

        console.log(`[Gateway] ✓ Route configured: ${routeConfig.path}`);
      } catch (error: any) {
        console.error(`[Gateway] ✗ Failed to configure route ${routeConfig.path}:`, error.message);
      }
    });

    console.log('[Gateway] Proxy routes initialization completed');
  }

  private initializeErrorHandling(): void {
    // 404 handler (must be after all routes)
    this.app.use(notFoundHandler as any);

    // Global error handler (must be last)
    this.app.use(errorHandler as any);
  }

  public getApp(): express.Application {
    return this.app;
  }

  public async startHealthChecks(): Promise<void> {
    console.log('[Gateway] Starting health check service...');

    // Start periodic health checks
    this.healthService.startHealthCheckInterval(30000); // Every 30 seconds

    // Initial health check
    console.log('[Gateway] Performing initial health checks...');
    const initialResults = await this.healthService.checkAllServices();

    const healthyServices = initialResults.filter(r => r.status === 'healthy');
    console.log(`[Gateway] Initial health check: ${healthyServices.length}/${initialResults.length} services healthy`);

    // Log unhealthy services
    const unhealthyServices = initialResults.filter(r => r.status !== 'healthy');
    if (unhealthyServices.length > 0) {
      console.warn('[Gateway] Unhealthy services detected:',
        unhealthyServices.map(s => `${s.service}: ${s.error || s.status}`)
      );
    }
  }

  public async shutdown(): Promise<void> {
    console.log('[Gateway] Shutting down...');

    // Stop health checks
    this.healthService.stopHealthCheckInterval();

    console.log('[Gateway] Shutdown completed');
  }
}

export default APIGateway;