import http from 'http';
import APIGateway from './app';
import { WebSocketManager } from './websocket';
import config from './config';

class GatewayServer {
  private server: http.Server | null = null;
  private gateway: APIGateway;
  private wsManager: WebSocketManager;

  constructor() {
    this.gateway = new APIGateway();
    this.wsManager = WebSocketManager.getInstance();
  }

  public async start(): Promise<void> {
    try {
      console.log('🚀 Starting WAFL API Gateway...');
      console.log(`📍 Environment: ${config.app.nodeEnv}`);
      console.log(`📋 Version: ${config.app.version}`);

      // Create HTTP server
      this.server = http.createServer(this.gateway.getApp());

      // Initialize WebSocket server
      this.wsManager.initialize(this.server);

      // Start health checks
      await this.gateway.startHealthChecks();

      // Start server
      await this.startServer();

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      console.log('🎉 API Gateway started successfully!');
      console.log(`📊 Health Dashboard: http://localhost:${config.app.port}/api/v1/gateway/health`);
      console.log(`📈 Metrics: http://localhost:${config.app.port}/api/v1/gateway/metrics`);
      console.log(`🔌 WebSocket: ws://localhost:${config.app.port}${config.websocket.path}`);

    } catch (error: any) {
      console.error('❌ Failed to start API Gateway:', error.message);
      process.exit(1);
    }
  }

  private async startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        reject(new Error('Server not created'));
        return;
      }

      this.server.listen(config.app.port, '0.0.0.0', () => {
        console.log(`🌐 API Gateway listening on port ${config.app.port}`);
        console.log(`🔗 Local access: http://localhost:${config.app.port}`);
        console.log(`🌍 External access: http://112.148.37.41:${config.app.port}`);
        resolve();
      });

      this.server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Port ${config.app.port} is already in use`);
        } else {
          console.error('❌ Server error:', error.message);
        }
        reject(error);
      });

      // Handle server errors
      this.server.on('clientError', (err, socket) => {
        console.error('Client error:', err.message);
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
      });

      // Handle upgrade requests for WebSocket
      this.server.on('upgrade', (request, socket, head) => {
        console.log('[WebSocket] Upgrade request received');
        // The WebSocket server will handle the upgrade automatically
      });
    });
  }

  private setupGracefulShutdown(): void {
    const signals = ['SIGTERM', 'SIGINT', 'SIGQUIT'] as const;

    signals.forEach(signal => {
      process.on(signal, async () => {
        console.log(`📋 Received ${signal}. Starting graceful shutdown...`);
        await this.shutdown();
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      console.error('Stack:', error.stack);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  private async shutdown(): Promise<void> {
    try {
      console.log('🔄 Shutting down API Gateway...');

      // Stop accepting new connections
      if (this.server) {
        this.server.close(() => {
          console.log('📴 HTTP server closed');
        });
      }

      // Close WebSocket connections
      this.wsManager.close();

      // Shutdown gateway services
      await this.gateway.shutdown();

      console.log('✅ API Gateway shutdown completed');
      process.exit(0);

    } catch (error: any) {
      console.error('❌ Error during shutdown:', error.message);
      process.exit(1);
    }
  }

  public getServer(): http.Server | null {
    return this.server;
  }
}

// Start the server
const gatewayServer = new GatewayServer();

if (require.main === module) {
  gatewayServer.start().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}

export default gatewayServer;