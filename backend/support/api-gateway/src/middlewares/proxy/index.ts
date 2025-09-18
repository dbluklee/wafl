import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { Request, Response } from 'express';
import { IAuthenticatedRequest, IRouteConfig, IProxyOptions } from '../../types';
import config from '../../config';
import { APIError } from '../error';
import { EErrorCode } from '../../types';

export const createServiceProxy = (routeConfig: IRouteConfig): any => {
  const serviceConfig = config.services[routeConfig.target];

  if (!serviceConfig) {
    throw new APIError(
      EErrorCode.SERVICE_UNAVAILABLE,
      `Service ${routeConfig.target} not configured`,
      503
    );
  }

  const proxyOptions: Options = {
    target: serviceConfig.url,
    changeOrigin: true,
    pathRewrite: (path: string, req: any) => {
      console.log(`[PATHREWRITE] Original path: ${path}`);
      return path;
    },
    timeout: 30000, // Reduced to reasonable timeout
    proxyTimeout: 35000,

    // Fix for body parsing issues
    selfHandleResponse: false,
    xfwd: true,
    secure: false,

    onProxyReq: (proxyReq: any, req: any, res: any) => {
      console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${serviceConfig.url}${proxyReq.path}`);

      // Add custom headers for downstream services
      proxyReq.setHeader('X-Gateway-Request-ID', req.requestId);
      proxyReq.setHeader('X-Gateway-Timestamp', new Date().toISOString());
      proxyReq.setHeader('X-Service-Name', routeConfig.target);

      // Forward user context if available
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.userId);
        proxyReq.setHeader('X-Store-ID', req.user.storeId);
        proxyReq.setHeader('X-User-Role', req.user.role);

        if (req.user.sessionId) {
          proxyReq.setHeader('X-Session-ID', req.user.sessionId);
        }
      }

      // Fix body forwarding issue - rewrite body if already parsed
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
        console.log(`[PROXY BODY] Forwarding parsed body: ${bodyData}`);
      }
    },

    onProxyRes: (proxyRes: any, req: any, res: any) => {
      // Add response headers
      proxyRes.headers['x-gateway-request-id'] = req.requestId;
      proxyRes.headers['x-proxied-by'] = 'api-gateway';

      // Log proxy response
      const responseTime = Date.now() - req.startTime;
      console.log(`[PROXY] ${req.method} ${req.originalUrl} <- ${proxyRes.statusCode} (${responseTime}ms)`);
    },

    onError: (err: any, req: any, res: any) => {
      console.error(`[PROXY ERROR] ${req.method} ${req.originalUrl}:`, {
        error: err.message,
        code: err.code,
        requestId: req.requestId,
        service: routeConfig.target,
      });

      let statusCode = 503;
      let errorCode = EErrorCode.SERVICE_UNAVAILABLE;
      let message = 'Service temporarily unavailable';

      if ((err as any).code === 'ECONNREFUSED') {
        message = `${routeConfig.target} is not available`;
      } else if ((err as any).code === 'ETIMEDOUT' || (err as any).code === 'ESOCKETTIMEDOUT') {
        statusCode = 504;
        errorCode = EErrorCode.SERVICE_TIMEOUT;
        message = `${routeConfig.target} request timeout`;
      }

      if (!res.headersSent) {
        res.status(statusCode).json({
          success: false,
          error: {
            code: errorCode,
            message,
            details: {
              service: routeConfig.target,
              originalError: err.message,
            },
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: config.app.version,
            requestId: req.requestId,
          },
        });
      }
    },

    // Health check filter
    logLevel: 'warn', // Reduce logs for production

    // Custom router for dynamic routing
    router: (req: Request) => {
      // Always route to the service URL - let the service handle its own health
      console.log(`[ROUTER] Routing ${req.method} ${req.url} to ${serviceConfig.url}`);
      return serviceConfig.url;
    },
  };

  return createProxyMiddleware(proxyOptions);
};

export const createLoadBalancedProxy = (
  routeConfig: IRouteConfig,
  services: string[]
): any => {
  let currentIndex = 0;

  const proxyOptions: Options = {
    target: 'http://placeholder', // Will be overridden by router
    changeOrigin: true,
    // Don't rewrite paths - Express already stripped the route prefix

    router: (req: Request) => {
      // Round-robin load balancing
      const serviceName = services[currentIndex % services.length];
      currentIndex++;

      const serviceConfig = config.services[serviceName];

      if (!serviceConfig || !serviceConfig.isHealthy) {
        // Find next healthy service
        for (let i = 0; i < services.length; i++) {
          const nextServiceName = services[(currentIndex + i) % services.length];
          const nextService = config.services[nextServiceName];

          if (nextService && nextService.isHealthy) {
            currentIndex += i;
            return nextService.url;
          }
        }

        // No healthy services available
        throw new Error('All services are unavailable');
      }

      return serviceConfig.url;
    },
  };

  return createProxyMiddleware(proxyOptions);
};

export const createWebSocketProxy = (target: string): any => {
  return createProxyMiddleware({
    target,
    ws: true,
    changeOrigin: true,

    onError: (err, req, socket) => {
      console.error('[WebSocket Proxy Error]:', err.message);
      if (socket.writable) {
        socket.write('HTTP/1.1 503 Service Unavailable\r\n' +
                    'Content-Type: text/plain\r\n' +
                    'Connection: close\r\n\r\n' +
                    'WebSocket service unavailable\r\n');
        socket.end();
      }
    },
  });
};

function isHealthCheckRequest(req: Request): boolean {
  return req.path.includes('/health') || req.path.includes('/ping');
}