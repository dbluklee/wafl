import { createServer } from 'http';
import app from './app';
import { config } from './config';
import { initializeSocket } from './config/socket';

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);
console.log('✅ Socket.IO initialized');

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log('✅ HTTP server closed');

    // Close Socket.IO
    io.close(() => {
      console.log('✅ Socket.IO closed');

      // Exit process
      process.exit(0);
    });
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after 30 seconds');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
server.listen(config.port, () => {
  console.log(`🚀 Order Service is running`);
  console.log(`📍 Port: ${config.port}`);
  console.log(`🌍 Environment: ${config.env}`);
  console.log(`🔌 WebSocket path: ${config.websocket.path}`);
  console.log(`📡 CORS origins: ${config.cors.origin.join(', ')}`);

  if (config.env === 'development') {
    console.log(`🔗 Health check: http://localhost:${config.port}/health`);
    console.log(`🔗 API base: http://localhost:${config.port}/api/v1`);
  }
});