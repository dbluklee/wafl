import winston from 'winston';
import config from '@/config';

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
  ),
  defaultMeta: { service: config.serviceName },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  ]
});

if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
      })
    )
  }));
}

// AI 관련 전용 로깅 메서드들
export const aiLogger = {
  chatRequest: (sessionId: string, message: string, context?: any) => {
    logger.info('AI Chat Request', {
      type: 'chat_request',
      sessionId,
      messageLength: message.length,
      hasContext: !!context,
      context: context ? Object.keys(context) : []
    });
  },

  chatResponse: (sessionId: string, responseLength: number, processingTime: number) => {
    logger.info('AI Chat Response', {
      type: 'chat_response',
      sessionId,
      responseLength,
      processingTime
    });
  },

  translationRequest: (text: string, sourceLang: string, targetLang: string) => {
    logger.info('Translation Request', {
      type: 'translation_request',
      textLength: text.length,
      sourceLang,
      targetLang
    });
  },

  ollamaRequest: (endpoint: string, modelUsed: string, tokenCount?: number) => {
    logger.debug('Ollama API Request', {
      type: 'ollama_request',
      endpoint,
      model: modelUsed,
      tokenCount
    });
  },

  ollamaError: (endpoint: string, error: Error) => {
    logger.error('Ollama API Error', {
      type: 'ollama_error',
      endpoint,
      error: error.message,
      stack: error.stack
    });
  },

  cacheHit: (key: string, type: 'conversation' | 'translation' | 'suggestion') => {
    logger.debug('Cache Hit', {
      type: 'cache_hit',
      key: key.substring(0, 50) + (key.length > 50 ? '...' : ''),
      cacheType: type
    });
  },

  cacheMiss: (key: string, type: 'conversation' | 'translation' | 'suggestion') => {
    logger.debug('Cache Miss', {
      type: 'cache_miss',
      key: key.substring(0, 50) + (key.length > 50 ? '...' : ''),
      cacheType: type
    });
  },

  rateLimitHit: (userId: string, endpoint: string, current: number, max: number) => {
    logger.warn('Rate Limit Hit', {
      type: 'rate_limit_hit',
      userId,
      endpoint,
      current,
      max
    });
  },

  suggestionGenerated: (type: string, priority: string, storeId: string) => {
    logger.info('AI Suggestion Generated', {
      type: 'suggestion_generated',
      suggestionType: type,
      priority,
      storeId
    });
  }
};

export default logger;