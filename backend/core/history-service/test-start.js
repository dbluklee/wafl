// 간단한 테스트용 서버 시작 파일
require('dotenv').config();

console.log('🔧 Starting History Service...');
console.log('Environment variables loaded');

try {
  // config 모듈 로드 테스트
  console.log('Loading config...');
  require('./src/config');
  console.log('✅ Config loaded successfully');

  // app 모듈 로드 테스트
  console.log('Loading app...');
  const app = require('./src/app').default;
  console.log('✅ App loaded successfully');

  // 서버 시작
  const PORT = process.env.PORT || 4010;
  const server = app.listen(PORT, () => {
    console.log(`🚀 History Service started on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

} catch (error) {
  console.error('❌ Error starting server:', error.message);
  console.error(error.stack);
  process.exit(1);
}