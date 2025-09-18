import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3003', 10),
  env: process.env.NODE_ENV || 'development',
  serviceName: 'dashboard-service',

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/aipos'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.TOKEN_EXPIRY || '24h'
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '60', 10), // seconds
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '120', 10), // seconds
    maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10)
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:4000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Store-ID'
    ]
  },

  // WebSocket Configuration
  websocket: {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:3000',
        'http://localhost:4000'
      ],
      credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Dashboard Specific Settings
  dashboard: {
    // How long to consider a table "staying" after last activity
    tableStayingTimeThreshold: 5, // minutes

    // Maximum number of logs to return per request
    maxLogsPerRequest: 100,

    // How long logs are considered "undoable"
    undoableTimeLimit: 30 * 60 * 1000, // 30 minutes in milliseconds

    // Cache keys patterns
    cacheKeys: {
      overview: (storeId: string) => `dashboard:overview:${storeId}`,
      tableStats: (storeId: string) => `dashboard:table_stats:${storeId}`,
      todayStats: (storeId: string) => `dashboard:today_stats:${storeId}`,
      placeOverview: (storeId: string, placeId: string) => `dashboard:place:${storeId}:${placeId}`,
      logs: (storeId: string, page: number = 0) => `dashboard:logs:${storeId}:${page}`
    },

    // WebSocket rooms
    rooms: {
      store: (storeId: string) => `store:${storeId}`,
      table: (tableId: string) => `table:${tableId}`,
      dashboard: (storeId: string) => `dashboard:${storeId}`,
      logs: (storeId: string) => `logs:${storeId}`
    },

    // Real-time update intervals
    updateIntervals: {
      overview: 10000, // 10 seconds
      stats: 30000, // 30 seconds
      tableStatus: 5000 // 5 seconds
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: process.env.LOG_FORMAT || 'combined',
    enableConsole: process.env.ENABLE_CONSOLE_LOG !== 'false',
    enableFile: process.env.ENABLE_FILE_LOG === 'true',
    logDir: process.env.LOG_DIR || './logs'
  },

  // External Services (for future integration)
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      timeout: 5000
    },
    storeManagement: {
      url: process.env.STORE_MANAGEMENT_URL || 'http://localhost:3002',
      timeout: 5000
    },
    order: {
      url: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
      timeout: 5000
    }
  },

  // Health Check
  health: {
    timeout: 5000,
    retryInterval: 30000
  }
};

// Validation
if (!config.database.url) {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!config.jwt.secret || config.jwt.secret === 'your-super-secret-jwt-key-change-this-in-production') {
  if (config.env === 'production') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
  console.warn('⚠️  Using default JWT_SECRET. Please set a secure secret in production.');
}

// Export for easy access to nested configs
export const {
  port,
  env,
  serviceName
} = config;

export const {
  ttl: cacheTtl,
  checkPeriod: cacheCheckPeriod,
  maxItems: cacheMaxItems
} = config.cache;

export const {
  secret: jwtSecret,
  expiresIn: jwtExpiresIn
} = config.jwt;

export const {
  overview: overviewCacheKey,
  tableStats: tableStatsCacheKey,
  todayStats: todayStatsCacheKey
} = config.dashboard.cacheKeys;

export const {
  store: storeRoom,
  table: tableRoom,
  dashboard: dashboardRoom
} = config.dashboard.rooms;