import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  serviceName: string;
  logLevel: string;
  cacheTtl: number;
  rateLimitEnabled: boolean;

  ollama: {
    baseUrl: string;
    model: string;
    temperature: number;
    topP: number;
    maxTokens: number;
    stream: boolean;
  };

  services: {
    storeManagement: string;
    dashboard: string;
    order: string;
    auth: string;
    analytics: string;
  };

  ai: {
    conversationTtl: number;
    undoDeadlineMinutes: number;
    cacheCleanupInterval: number;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '4006', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/aipos',
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key-here-change-in-production',
  serviceName: process.env.SERVICE_NAME || 'ai-service',
  logLevel: process.env.LOG_LEVEL || 'debug',
  cacheTtl: parseInt(process.env.CACHE_TTL || '3600', 10),
  rateLimitEnabled: process.env.RATE_LIMIT_ENABLED === 'true',

  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://112.148.37.41:1884',
    model: process.env.OLLAMA_MODEL || 'gemma3:27b-it-q4_K_M',
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    topP: parseFloat(process.env.AI_TOP_P || '0.9'),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048', 10),
    stream: process.env.AI_STREAM === 'true'
  },

  services: {
    storeManagement: process.env.STORE_MANAGEMENT_URL || 'http://localhost:4002',
    dashboard: process.env.DASHBOARD_SERVICE_URL || 'http://localhost:4003',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:4004',
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4007'
  },

  ai: {
    conversationTtl: parseInt(process.env.CONVERSATION_TTL || '1800', 10),
    undoDeadlineMinutes: parseInt(process.env.UNDO_DEADLINE_MINUTES || '30', 10),
    cacheCleanupInterval: parseInt(process.env.CACHE_CLEANUP_INTERVAL || '300000', 10)
  }
};

export default config;