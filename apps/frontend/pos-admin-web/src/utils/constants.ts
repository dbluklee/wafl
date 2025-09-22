// Application constants
export const APP_NAME = 'WAFL POS';
export const APP_VERSION = '1.0.0';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  SIGNIN: '/api/v1/auth/login/pin',
  MOBILE_SIGNIN: '/api/v1/auth/login/mobile',
  SEND_SMS: '/api/v1/auth/mobile/request',
  VERIFY_SMS: '/api/v1/auth/mobile/verify',
  SIGNOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  PROFILE: '/api/v1/auth/profile',

  // Store Management
  STORES: '/api/v1/store/stores',
  CATEGORIES: '/api/v1/store/categories',
  MENU_ITEMS: '/api/v1/store/menu-items',
  PLACES: '/api/v1/store/places',
  TABLES: '/api/v1/store/tables',

  // Dashboard
  DASHBOARD_STATS: '/api/v1/dashboard/stats',
  POS_LOGS: '/api/v1/dashboard/pos-logs',

  // Orders
  ORDERS: '/api/v1/orders',
  ORDER_ITEMS: '/api/v1/order-items',

  // Payments
  PAYMENTS: '/api/v1/payments',

  // AI Agent
  AI_CHAT: '/api/v1/ai/agent/chat',
  AI_SESSIONS: '/api/v1/ai/agent/sessions',
  AI_QUICK_QUESTIONS: '/api/v1/ai/agent/quick-questions',
  AI_INSIGHTS: '/api/v1/ai/agent/insights',

  // Customer AI
  CUSTOMER_CHAT: '/api/v1/ai/customer/chat',
  CUSTOMER_RECOMMEND: '/api/v1/ai/customer/recommend',

  // Translation
  TRANSLATE_TEXT: '/api/v1/ai/translate/text',
  TRANSLATE_MENU: '/api/v1/ai/translate/menu',

  // Analytics
  REVENUE_ANALYTICS: '/api/v1/analytics/revenue',
  MENU_ANALYTICS: '/api/v1/analytics/menu',

  // User Profile
  USER_PROFILE: '/api/v1/profile',
  USER_STAFF: '/api/v1/profile/staff',

  // History
  HISTORY: '/api/v1/history',
  UNDO: '/api/v1/history/undo',
  REDO: '/api/v1/history/redo',
};

// WebSocket event types
export const WS_EVENTS = {
  // Table events
  TABLE_STATUS_CHANGED: 'table.status.changed',

  // Order events
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_COMPLETED: 'order.completed',

  // Payment events
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',

  // Kitchen events
  KITCHEN_ORDER_RECEIVED: 'kitchen.order.received',
  KITCHEN_ORDER_PREPARED: 'kitchen.order.prepared',

  // POS events
  POS_LOG_CREATED: 'pos.log.created',
} as const;

// Table status colors
export const TABLE_STATUS_COLORS = {
  available: 'bg-green-500',
  occupied: 'bg-red-500',
  reserved: 'bg-yellow-500',
  cleaning: 'bg-blue-500',
} as const;

// Order status colors
export const ORDER_STATUS_COLORS = {
  pending: 'bg-gray-500',
  confirmed: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  ready: 'bg-green-500',
  served: 'bg-purple-500',
  completed: 'bg-green-600',
  cancelled: 'bg-red-500',
} as const;

// Payment status colors
export const PAYMENT_STATUS_COLORS = {
  pending: 'bg-gray-500',
  processing: 'bg-yellow-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-600',
} as const;

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date formats
export const DATE_FORMATS = {
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATE: 'MM/DD/YYYY',
  DISPLAY_DATETIME: 'MM/DD/YYYY HH:mm',
  KOREAN_DATE: 'YYYY년 MM월 DD일',
  KOREAN_DATETIME: 'YYYY년 MM월 DD일 HH시 mm분',
} as const;

// Language options
export const LANGUAGES = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
] as const;

// Navigation menu items
export const NAVIGATION_ITEMS = [
  {
    id: 'home',
    label: '홈',
    path: '/',
    icon: 'Home',
    roles: ['owner', 'staff'],
  },
  {
    id: 'dashboard',
    label: '실시간 현황',
    path: '/dashboard',
    icon: 'BarChart3',
    roles: ['owner', 'staff'],
  },
  {
    id: 'management',
    label: '매장 관리',
    path: '/management',
    icon: 'Settings',
    roles: ['owner', 'staff'],
  },
  {
    id: 'ai-agent',
    label: 'AI 컨설팅',
    path: '/ai-agent',
    icon: 'Bot',
    roles: ['owner'],
  },
  {
    id: 'analytics',
    label: '매출 분석',
    path: '/analytics',
    icon: 'TrendingUp',
    roles: ['owner'],
  },
] as const;

// Color palette for categories/places
export const COLOR_PALETTE = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
] as const;

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  STORE: 'store',
  THEME: 'theme',
  LANGUAGE: 'language',
  DASHBOARD_SETTINGS: 'dashboardSettings',
  POS_SETTINGS: 'posSettings',
} as const;

// WebSocket connection config
export const WS_CONFIG = {
  URL: import.meta.env.VITE_WS_URL || 'ws://localhost:4000',
  RECONNECT_INTERVAL: 5000, // 5 seconds
  MAX_RECONNECT_ATTEMPTS: 10,
  PING_INTERVAL: 30000, // 30 seconds
} as const;

// Chart colors for analytics
export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#ec4899', // pink-500
] as const;

// AI chat settings
export const AI_CHAT = {
  MAX_MESSAGE_LENGTH: 2000,
  STREAM_DELAY: 50, // milliseconds between chunks
  AUTO_SCROLL_THRESHOLD: 100,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

// Form validation patterns
export const VALIDATION_PATTERNS = {
  STORE_CODE: /^[0-9]{4}$/,
  PIN: /^[0-9]{4}$/,
  PHONE: /^[0-9-+\s()]{8,20}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;