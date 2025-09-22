import dotenv from 'dotenv';

// 환경변수 먼저 로드
dotenv.config();

import app from './app';
import config from './config';
import logger from './utils/simple-logger';

/**
 * History Service 시작
 */
async function startServer(): Promise<void> {
  try {
    // 서버 시작
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 History Service가 시작되었습니다!`);
      logger.info(`📍 포트: ${config.PORT}`);
      logger.info(`🌍 환경: ${config.NODE_ENV}`);
      logger.info(`💾 데이터베이스: ${config.DATABASE_URL ? '연결됨' : '연결 안됨'}`);
      logger.info(`📊 헬스체크: http://localhost:${config.PORT}/health`);
      logger.info(`📚 API 문서: http://localhost:${config.PORT}/api/v1/history`);

      if (config.NODE_ENV === 'development') {
        logger.info(`🔧 개발 모드로 실행 중...`);
        logger.info(`📝 로그 레벨: ${config.LOG_LEVEL}`);
        logger.info(`⏱️  Undo 마감시간: ${config.UNDO_DEADLINE_MINUTES}분`);
        logger.info(`📄 페이지당 히스토리: ${config.MAX_HISTORY_ENTRIES_PER_PAGE}개`);
        logger.info(`🗂️  보관 기간: ${config.HISTORY_RETENTION_DAYS}일`);
      }
    });

    // Graceful shutdown 처리
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} 신호를 받았습니다. 서버를 종료합니다...`);

      server.close((err) => {
        if (err) {
          logger.error('서버 종료 중 오류:', err);
          process.exit(1);
        }

        logger.info('✅ History Service가 정상적으로 종료되었습니다.');
        process.exit(0);
      });
    };

    // 신호 처리
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 오류 처리
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          logger.error(`포트 ${config.PORT}에 대한 권한이 부족합니다.`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`포트 ${config.PORT}가 이미 사용 중입니다.`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    logger.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

// 서버 시작
startServer().catch((error) => {
  logger.error('치명적 오류:', error);
  process.exit(1);
});