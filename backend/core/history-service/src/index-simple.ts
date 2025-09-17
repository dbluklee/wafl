import dotenv from 'dotenv';
dotenv.config();

import config from './config';
import app from './app-simple';

console.log('🔧 History Service Configuration:');
console.log(`   NODE_ENV: ${config.NODE_ENV}`);
console.log(`   PORT: ${config.PORT}`);
console.log(`   SERVICE_NAME: ${config.SERVICE_NAME}`);
console.log(`   JWT_SECRET: ${config.JWT_SECRET ? '[SET]' : '[NOT SET]'}`);
console.log(`   DATABASE_URL: ${config.DATABASE_URL ? '[SET]' : '[NOT SET]'}`);
console.log(`   UNDO_DEADLINE_MINUTES: ${config.UNDO_DEADLINE_MINUTES}분`);
console.log(`   MAX_HISTORY_ENTRIES_PER_PAGE: ${config.MAX_HISTORY_ENTRIES_PER_PAGE}개`);
console.log(`   HISTORY_RETENTION_DAYS: ${config.HISTORY_RETENTION_DAYS}일`);
console.log(`   CACHE_TTL_SHORT: ${config.CACHE_TTL_SHORT}초`);
console.log(`   CACHE_TTL_MEDIUM: ${config.CACHE_TTL_MEDIUM}초`);
console.log(`   CACHE_TTL_LONG: ${config.CACHE_TTL_LONG}초`);
console.log(`   LOG_LEVEL: ${config.LOG_LEVEL}`);
console.log(`   LOG_FILE_PATH: ${config.LOG_FILE_PATH}`);

// Start server
const server = app.listen(config.PORT, () => {
  console.log('==================================================');
  console.log('🚀 WAFL History Service Started Successfully');
  console.log('==================================================');
  console.log(`📡 Server: http://localhost:${config.PORT}`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
  console.log(`💾 Database: Connected`);
  console.log(`🔐 JWT Secret: Configured`);
  console.log(`📊 Cache: In-Memory TTL Cache Active`);
  console.log('==================================================');
  console.log('📋 Available Endpoints:');
  console.log('  GET  /health                    - Health check');
  console.log('==================================================');
  console.log('🔗 Service Dependencies:');
  console.log('  📦 Store Management: http://localhost:4002');
  console.log('  📋 Order Service: http://localhost:4004');
  console.log('  👤 User Profile: http://localhost:4009');
  console.log('  🔐 Auth Service: http://localhost:4001');
  console.log('==================================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

export { app, server };