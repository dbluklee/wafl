import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    storeId: string;
    role: 'owner' | 'staff';
    username: string;
  };
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaStreamResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  context?: {
    includeAnalytics?: boolean;
    dateRange?: string;
    customerId?: string;
    language?: string;
    preferences?: string[];
  } | undefined;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  timestamp: Date;
  recommendations?: MenuRecommendation[];
  quickQuestions?: string[];
  metadata?: Record<string, any>;
}

export interface StreamChunk {
  chunk: string;
  done: boolean;
  metadata?: Record<string, any>;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ConversationSession {
  sessionId: string;
  storeId: string;
  userId?: string | undefined;
  customerId?: string | undefined;
  type: 'owner' | 'customer';
  messages: ConversationMessage[];
  createdAt: Date;
  lastActivity: Date;
  metadata?: Record<string, any> | undefined;
}

export interface MenuRecommendation {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  reason: string;
  confidence: number;
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
}

export interface TranslationRequest {
  text?: string;
  menuId?: string;
  items?: string[];
  sourceLang?: string;
  targetLang: string;
  includeAllergens?: boolean;
  includeDescription?: boolean;
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  confidence: number;
  culturalNotes?: string[];
}

export interface AISuggestion {
  id: string;
  type: 'revenue' | 'menu' | 'operation' | 'marketing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: string;
  impact?: string;
  estimatedEffect?: {
    revenue?: number;
    efficiency?: number;
    customerSatisfaction?: number;
  };
  deadline?: Date;
  isApplied: boolean;
  confidence: number;
}

export interface AnalyticsData {
  storeId: string;
  period: string;
  todayRevenue: number;
  yesterdayRevenue: number;
  comparison: number;
  topMenus: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
  }>;
  hourlyData: Array<{
    hour: number;
    orders: number;
    revenue: number;
  }>;
  customerCount: number;
  averageOrderValue: number;
}

export interface StoreContext {
  id: string;
  name: string;
  category: string;
  settings: {
    language: string;
    currency: string;
    timezone: string;
  };
  menus: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    allergens: string[];
    isVegetarian: boolean;
    isVegan: boolean;
    isActive: boolean;
  }>;
}

export interface CustomerContext {
  customerId?: string;
  language: string;
  preferences?: string[];
  allergens?: string[];
  dietaryRestrictions?: string[];
  previousOrders?: Array<{
    menuId: string;
    quantity: number;
    rating?: number;
  }>;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Date;
}

export interface RateLimitInfo {
  windowMs: number;
  max: number;
  current: number;
  remaining: number;
  resetTime: Date;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  version: string;
  dependencies: {
    ollama: 'connected' | 'disconnected' | 'error';
    database: 'connected' | 'disconnected' | 'error';
    cache: {
      status: 'active';
      entries: number;
      hitRate: number;
    };
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface QuickQuestion {
  question: string;
  category: 'menu' | 'order' | 'recommendation' | 'business' | 'analytics';
  priority: number;
}

export interface PromptContext {
  storeInfo?: StoreContext | undefined;
  customerInfo?: CustomerContext | undefined;
  analyticsData?: AnalyticsData | undefined;
  conversationHistory?: ConversationMessage[] | undefined;
  timestamp: Date;
  language: string;
}

export interface UndoRedoAction {
  id: string;
  sessionId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldData: Record<string, any>;
  newData: Record<string, any>;
  timestamp: Date;
  canUndo: boolean;
  undoDeadline: Date;
}