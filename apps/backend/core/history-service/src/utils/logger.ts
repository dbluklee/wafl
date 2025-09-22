import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

const logDir = process.env.LOG_FILE_PATH || './logs';

// 로그 디렉토리가 없으면 생성
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 로그 레벨 설정
const logLevel = process.env.LOG_LEVEL || 'info';

// 커스텀 로그 포맷
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    // 스택 트레이스가 있으면 추가
    if (stack) {
      log += `\\n${stack}`;
    }

    // 메타데이터가 있으면 추가
    if (Object.keys(meta).length > 0) {
      log += `\\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

// Transport 설정
const transports: winston.transport[] = [
  // 콘솔 출력 (개발 환경)
  new winston.transports.Console({
    level: logLevel,
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  }),

  // 에러 로그 파일
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: process.env.LOG_MAX_FILES || '5d',
    format: logFormat
  }),

  // 모든 로그 파일
  new DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: process.env.LOG_MAX_FILES || '5d',
    format: logFormat
  })
];

// Winston 로거 생성
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  // 처리되지 않은 예외 처리
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || '5d',
      format: logFormat
    })
  ],
  // 처리되지 않은 Promise rejection 처리
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || '5d',
      format: logFormat
    })
  ]
});

// 중복 콘솔 로거 제거 (이미 위에서 추가됨)

// 히스토리 서비스 전용 로거 메서드들
export class HistoryLogger {
  static logHistoryCreated(actionType: string, entityType: string, entityId: string, userId: string) {
    logger.info('History entry created', {
      action: actionType,
      entityType,
      entityId,
      userId,
      service: 'history'
    });
  }

  static logUndoExecuted(historyId: string, userId: string, entityType: string) {
    logger.info('Undo operation executed', {
      historyId,
      userId,
      entityType,
      operation: 'undo'
    });
  }

  static logRedoExecuted(undoStackId: string, userId: string, entityType: string) {
    logger.info('Redo operation executed', {
      undoStackId,
      userId,
      entityType,
      operation: 'redo'
    });
  }

  static logCacheHit(key: string) {
    logger.debug('Cache hit', { key, type: 'cache-hit' });
  }

  static logCacheMiss(key: string) {
    logger.debug('Cache miss', { key, type: 'cache-miss' });
  }

  static logServiceCall(serviceName: string, endpoint: string, statusCode: number, duration: number) {
    logger.info('External service call', {
      service: serviceName,
      endpoint,
      statusCode,
      duration: `${duration}ms`,
      type: 'service-call'
    });
  }

  static logError(error: Error, context?: any) {
    logger.error('Error occurred', {
      message: error.message,
      stack: error.stack,
      context
    });
  }

  static logValidationError(field: string, value: any, rule: string) {
    logger.warn('Validation error', {
      field,
      value,
      rule,
      type: 'validation-error'
    });
  }

  static logUnauthorizedAccess(userId?: string, action?: string, resource?: string) {
    logger.warn('Unauthorized access attempt', {
      userId,
      action,
      resource,
      type: 'security'
    });
  }
}

export default logger;