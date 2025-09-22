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
      // Remove excessive logging for performance
      return path;
    },
    timeout: 5000, // Reduced timeout for faster failure
    proxyTimeout: 6000,

    // Fix for body parsing issues
    selfHandleResponse: false,
    xfwd: true,
    secure: false,
    followRedirects: false, // Prevent redirect loops

    onProxyReq: (proxyReq: any, req: any, res: any) => {
      console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${serviceConfig.url}${proxyReq.path}`);

      // 기본 헤더 설정
      proxyReq.setHeader('X-Gateway-Request-ID', req.requestId);
      proxyReq.setHeader('X-Gateway-Timestamp', new Date().toISOString());
      proxyReq.setHeader('X-Service-Name', routeConfig.target);

      // 사용자 컨텍스트 전달
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.userId);
        proxyReq.setHeader('X-Store-ID', req.user.storeId);
        proxyReq.setHeader('X-User-Role', req.user.role);
        if (req.user.sessionId) {
          proxyReq.setHeader('X-Session-ID', req.user.sessionId);
        }
        console.log(`[PROXY AUTH] User context: ${req.user.userId}, Role: ${req.user.role}, Store: ${req.user.storeId}`);
      } else {
        console.log(`[PROXY AUTH] No user context found for ${req.originalUrl}`);
      }

      // 🔧 핵심 해결책: 파싱된 body 재작성
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
        console.log(`[PROXY BODY] Forwarding parsed body: ${bodyData}`);
      }

      // Authorization 헤더 전달 확인
      if (req.headers.authorization) {
        console.log(`[PROXY AUTH] Authorization header present: ${req.headers.authorization.substring(0, 20)}...`);
      } else {
        console.log(`[PROXY AUTH] No Authorization header found`);
      }
    },

    onProxyRes: (proxyRes: any, req: any, res: any) => {
      // Add minimal response headers
      proxyRes.headers['x-gateway-request-id'] = req.requestId;
      // Remove verbose logging for performance
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
    logLevel: 'silent', // Reduce logs for performance

    // Custom router for dynamic routing
    router: (req: Request) => {
      // Always route to the service URL - let the service handle its own health
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