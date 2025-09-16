import { IRouteConfig } from '../types';

export const routeConfigs: IRouteConfig[] = [
  // Auth Service Routes
  {
    path: '/api/v1/auth',
    target: 'auth-service',
    requireAuth: false, // Auth routes don't require auth themselves
    timeout: 10000,
  },

  // Store Management Service Routes
  {
    path: '/api/v1/store',
    target: 'store-management-service',
    requireAuth: true,
    requiredRoles: ['owner', 'staff'],
    rateLimit: {
      windowMs: 60000, // 1 minute
      max: 100,
    },
  },

  // Dashboard Service Routes
  {
    path: '/api/v1/dashboard',
    target: 'dashboard-service',
    requireAuth: true,
    requiredRoles: ['owner', 'staff'],
    rateLimit: {
      windowMs: 60000,
      max: 200,
    },
  },

  // Order Service Routes
  {
    path: '/api/v1/orders',
    target: 'order-service',
    requireAuth: true,
    requiredRoles: ['owner', 'staff', 'customer'],
    rateLimit: {
      windowMs: 60000,
      max: 150,
    },
  },

  // Payment Service Routes
  {
    path: '/api/v1/payments',
    target: 'payment-service',
    requireAuth: true,
    requiredRoles: ['owner', 'staff', 'customer'],
    timeout: 30000, // Longer timeout for payment processing
    rateLimit: {
      windowMs: 60000,
      max: 50,
    },
  },

  // AI Service Routes
  {
    path: '/api/v1/ai',
    target: 'ai-service',
    requireAuth: true,
    requiredRoles: ['owner', 'staff', 'customer'],
    timeout: 60000, // AI responses can take longer
    rateLimit: {
      windowMs: 60000,
      max: 30, // Lower limit for AI endpoints
    },
  },

  // Analytics Service Routes
  {
    path: '/api/v1/analytics',
    target: 'analytics-service',
    requireAuth: true,
    requiredRoles: ['owner', 'staff'],
    rateLimit: {
      windowMs: 60000,
      max: 50,
    },
  },

  // Notification Service Routes
  {
    path: '/api/v1/notifications',
    target: 'notification-service',
    requireAuth: true,
    requiredRoles: ['owner', 'staff', 'customer'],
    rateLimit: {
      windowMs: 60000,
      max: 100,
    },
  },

  // User Profile Service Routes
  {
    path: '/api/v1/profile',
    target: 'user-profile-service',
    requireAuth: true,
    requiredRoles: ['owner', 'staff'],
    rateLimit: {
      windowMs: 60000,
      max: 50,
    },
  },

  // History Service Routes
  {
    path: '/api/v1/history',
    target: 'history-service',
    requireAuth: true,
    requiredRoles: ['owner', 'staff'],
    rateLimit: {
      windowMs: 60000,
      max: 100,
    },
  },

  // Scraping Service Routes
  {
    path: '/api/v1/scraping',
    target: 'scraping-service',
    requireAuth: true,
    requiredRoles: ['owner'],
    timeout: 120000, // Scraping can take longer
    rateLimit: {
      windowMs: 300000, // 5 minutes
      max: 10, // Very limited scraping requests
    },
  },

  // QR Service Routes
  {
    path: '/api/v1/qr',
    target: 'qr-service',
    requireAuth: true,
    requiredRoles: ['owner', 'staff'],
    rateLimit: {
      windowMs: 60000,
      max: 50,
    },
  },
];

// Special routes that bypass standard routing (direct gateway handling)
export const gatewayRoutes = [
  '/health',
  '/api/health',
  '/api/v1/gateway',
  '/metrics',
];

// Public routes that don't require any authentication
export const publicRoutes = [
  '/health',
  '/ping',
  '/api/health',
  '/api/v1/gateway/health',
  '/api/v1/gateway/metrics',
  '/api/v1/gateway/services',
  '/api/v1/gateway/config',
  '/api/v1/gateway/ping',
  '/api/v1/auth/stores/register',
  '/api/v1/auth/login/pin',
  '/api/v1/auth/login/mobile',
  '/api/v1/auth/mobile/request',
  '/api/v1/auth/mobile/verify',
  '/api/v1/auth/customer/session',
  '/api/v1/qr/validate', // QR validation for customers
];

// Routes that require special handling
export const specialRoutes = {
  websocket: ['/ws', '/websocket'],
  streaming: ['/api/v1/ai/agent/chat'], // Server-Sent Events
  upload: ['/api/v1/store/menus/upload'], // File uploads
};