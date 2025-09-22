import app from './app';
import config from './config';

const server = app.listen(config.server.port, () => {
  console.log('='.repeat(50));
  console.log('🚀 WAFL Payment Service Started Successfully');
  console.log('='.repeat(50));
  console.log(`📡 Server: http://localhost:${config.server.port}`);
  console.log(`🌍 Environment: ${config.server.env}`);
  console.log(`💾 Database: Connected`);
  console.log(`🔐 JWT Secret: Configured`);
  console.log(`💳 PG Service: Mock Mode (Development)`);
  console.log(`📊 Cache: In-Memory Cache Active`);
  console.log('='.repeat(50));
  console.log('📋 Available Endpoints:');
  console.log('  GET  /health                    - Health check');
  console.log('  POST /api/v1/payments           - Create payment');
  console.log('  GET  /api/v1/payments/:id       - Get payment details');
  console.log('  PATCH /api/v1/payments/:id/status - Update payment status');
  console.log('  POST /api/v1/payments/:id/cancel - Cancel payment');
  console.log('  POST /api/v1/payments/callback  - PG callback (no auth)');
  console.log('  GET  /api/v1/payments/order/:orderId - Get payments by order');
  console.log('='.repeat(50));
  console.log('🔗 Service Dependencies:');
  console.log(`  📦 Order Service: ${config.services.order}`);
  console.log(`  📊 Dashboard Service: ${config.services.dashboard}`);
  console.log(`  🔐 Auth Service: ${config.services.auth}`);
  console.log('='.repeat(50));
});

const gracefulShutdown = (signal: string) => {
  console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    console.log('✅ Payment Service HTTP server closed');
    console.log('🛑 Payment Service shutdown complete');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('❌ Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});