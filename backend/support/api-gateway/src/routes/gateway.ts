import { Router, Request, Response } from 'express';
import { IAuthenticatedRequest } from '../types';
import { createSuccessResponse } from '../utils';
import { HealthService } from '../services/health';
import config from '../config';

const router = Router();
const healthService = HealthService.getInstance();

// Gateway health check
router.get('/health', async (req: any, res: Response) => {
  try {
    const systemHealth = await healthService.getSystemHealth();

    const response = createSuccessResponse({
      gateway: {
        status: 'healthy',
        uptime: process.uptime(),
        version: config.app.version,
        nodeEnv: config.app.nodeEnv,
      },
      system: systemHealth,
    }, req.requestId);

    const statusCode = systemHealth.status === 'healthy' ? 200 :
                      systemHealth.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Individual service health check
router.get('/health/:serviceName', async (req: any, res: Response) => {
  try {
    const { serviceName } = req.params;
    const healthResult = await healthService.checkServiceHealth(serviceName);

    const response = createSuccessResponse(healthResult, req.requestId);
    const statusCode = healthResult.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Gateway metrics and statistics
router.get('/metrics', async (req: any, res: Response) => {
  try {
    const systemHealth = await healthService.getSystemHealth();
    const serviceStatuses = healthService.getAllServiceStatuses();

    const metrics = {
      gateway: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: config.app.version,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
      services: {
        total: Object.keys(config.services).length,
        healthy: Object.values(serviceStatuses).filter(Boolean).length,
        unhealthy: Object.values(serviceStatuses).filter(status => !status).length,
        statuses: serviceStatuses,
      },
      system: {
        status: systemHealth.status,
        lastHealthCheck: systemHealth.timestamp,
      },
      routes: {
        configured: Object.keys(config.services).length,
      },
    };

    const response = createSuccessResponse(metrics, req.requestId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Service discovery endpoint
router.get('/services', async (req: any, res: Response) => {
  try {
    const servicesInfo = Object.entries(config.services).map(([name, service]) => ({
      name,
      url: service.url,
      isHealthy: service.isHealthy,
      lastHealthCheck: service.lastHealthCheck,
      healthPath: service.healthPath,
    }));

    const response = createSuccessResponse({
      services: servicesInfo,
      total: servicesInfo.length,
      healthy: servicesInfo.filter(s => s.isHealthy).length,
    }, req.requestId);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Gateway configuration (non-sensitive info only)
router.get('/config', async (req: any, res: Response) => {
  try {
    const safeConfig = {
      version: config.app.version,
      nodeEnv: config.app.nodeEnv,
      cors: {
        origin: config.cors.origin,
      },
      rateLimit: {
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
      },
      websocket: {
        path: config.websocket.path,
      },
      services: Object.keys(config.services),
    };

    const response = createSuccessResponse(safeConfig, req.requestId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Manual health check trigger
router.post('/health/check', async (req: any, res: Response) => {
  try {
    console.log(`[Manual Health Check] Triggered by request ${req.requestId}`);

    const results = await healthService.checkAllServices();
    const response = createSuccessResponse({
      message: 'Health check completed',
      results,
      healthyServices: results.filter(r => r.status === 'healthy').length,
      totalServices: results.length,
    }, req.requestId);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Gateway status (simple endpoint for load balancers)
router.get('/ping', (req: any, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'pong',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

export default router;