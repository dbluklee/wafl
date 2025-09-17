import axios from 'axios';
import config from '@/config';
import {
  StoreContext,
  CustomerContext,
  AnalyticsData,
  ConversationSession,
  ConversationMessage
} from '@/types';
import logger from '@/utils/logger';
import { cache } from '@/utils/cache';
import { v4 as uuidv4 } from 'uuid';

export class ContextService {
  private conversations: Map<string, ConversationSession> = new Map();

  // 매장 컨텍스트 조회 (캐시 우선)
  async getStoreContext(storeId: string): Promise<StoreContext | null> {
    const cacheKey = `store:${storeId}:context`;

    // 캐시 확인
    let storeContext = cache.getMedium<StoreContext>(cacheKey);
    if (storeContext) {
      return storeContext;
    }

    try {
      // Store Management Service에서 매장 정보 조회
      const [storeResponse, menusResponse] = await Promise.all([
        axios.get(`${config.services.storeManagement}/api/v1/stores/${storeId}`, {
          timeout: 5000,
          headers: {
            'Authorization': `Bearer ${this.generateServiceToken()}`
          }
        }),
        axios.get(`${config.services.storeManagement}/api/v1/stores/${storeId}/menus`, {
          timeout: 5000,
          headers: {
            'Authorization': `Bearer ${this.generateServiceToken()}`
          }
        })
      ]);

      const store = storeResponse.data;
      const menus = menusResponse.data;

      storeContext = {
        id: store.id,
        name: store.name,
        category: store.category,
        settings: {
          language: store.language || 'ko',
          currency: 'KRW',
          timezone: 'Asia/Seoul'
        },
        menus: menus.map((menu: any) => ({
          id: menu.id,
          name: menu.name,
          description: menu.description || '',
          price: menu.price,
          category: menu.category?.name || 'default',
          allergens: menu.allergens || [],
          isVegetarian: menu.isVegetarian || false,
          isVegan: menu.isVegan || false,
          isActive: menu.isActive
        }))
      };

      // 5분 캐시
      cache.setMedium(cacheKey, storeContext);

      logger.debug(`Store context loaded for store ${storeId}`);
      return storeContext;

    } catch (error) {
      logger.error(`Failed to load store context for ${storeId}:`, error);
      return null;
    }
  }

  // 고객 컨텍스트 조회
  async getCustomerContext(customerId: string, storeId: string): Promise<CustomerContext | null> {
    if (!customerId) return null;

    const cacheKey = `customer:${customerId}:context`;

    // 캐시 확인
    let customerContext = cache.getMedium<CustomerContext>(cacheKey);
    if (customerContext) {
      return customerContext;
    }

    try {
      // Order Service에서 고객의 이전 주문 조회
      const ordersResponse = await axios.get(
        `${config.services.order}/api/v1/orders/customer/${customerId}`,
        {
          timeout: 5000,
          params: { limit: 10, storeId },
          headers: {
            'Authorization': `Bearer ${this.generateServiceToken()}`
          }
        }
      );

      const orders = ordersResponse.data || [];

      customerContext = {
        customerId,
        language: 'ko', // 기본값, 추후 사용자 설정으로 확장
        previousOrders: orders.map((order: any) => ({
          menuId: order.menuId,
          quantity: order.quantity,
          rating: order.rating
        }))
      };

      // 5분 캐시
      cache.setMedium(cacheKey, customerContext);

      logger.debug(`Customer context loaded for customer ${customerId}`);
      return customerContext;

    } catch (error) {
      logger.warn(`Failed to load customer context for ${customerId}:`, error);
      // 빈 컨텍스트 반환
      return {
        customerId,
        language: 'ko'
      };
    }
  }

  // 분석 데이터 컨텍스트 조회
  async getAnalyticsContext(storeId: string, dateRange: string = 'today'): Promise<AnalyticsData | null> {
    const cacheKey = `analytics:${storeId}:${dateRange}`;

    // 짧은 캐시 확인 (30초)
    let analyticsData = cache.getShort<AnalyticsData>(cacheKey);
    if (analyticsData) {
      return analyticsData;
    }

    try {
      // Dashboard Service에서 분석 데이터 조회
      const response = await axios.get(
        `${config.services.dashboard}/api/v1/analytics/revenue`,
        {
          timeout: 5000,
          params: { storeId, period: dateRange },
          headers: {
            'Authorization': `Bearer ${this.generateServiceToken()}`
          }
        }
      );

      analyticsData = response.data;

      // 30초 캐시 (실시간성 중요)
      cache.setShort(cacheKey, analyticsData);

      logger.debug(`Analytics context loaded for store ${storeId}, period ${dateRange}`);
      return analyticsData;

    } catch (error) {
      logger.warn(`Failed to load analytics context for ${storeId}:`, error);
      return null;
    }
  }

  // 대화 세션 관리
  createConversationSession(
    storeId: string,
    type: 'owner' | 'customer',
    userId?: string,
    customerId?: string
  ): ConversationSession {
    const sessionId = uuidv4();
    const now = new Date();

    const session: ConversationSession = {
      sessionId,
      storeId,
      userId,
      customerId,
      type,
      messages: [],
      createdAt: now,
      lastActivity: now
    };

    this.conversations.set(sessionId, session);
    logger.debug(`Created conversation session ${sessionId} for store ${storeId}, type ${type}`);

    return session;
  }

  getConversationSession(sessionId: string): ConversationSession | null {
    return this.conversations.get(sessionId) || null;
  }

  addMessageToSession(sessionId: string, message: ConversationMessage): boolean {
    const session = this.conversations.get(sessionId);
    if (!session) {
      logger.warn(`Conversation session not found: ${sessionId}`);
      return false;
    }

    session.messages.push(message);
    session.lastActivity = new Date();

    // TTL 기반 세션 정리를 위해 캐시에도 저장
    const cacheKey = `conversation:${sessionId}`;
    cache.setMedium(cacheKey, session);

    return true;
  }

  // 대화 히스토리 조회 (최근 N개 메시지)
  getConversationHistory(sessionId: string, limit: number = 10): ConversationMessage[] {
    const session = this.conversations.get(sessionId);
    if (!session) return [];

    return session.messages.slice(-limit);
  }

  // 세션 정리 (만료된 세션 제거)
  cleanupExpiredSessions(): number {
    const now = new Date();
    const ttl = config.ai.conversationTtl * 1000; // 초를 밀리초로
    let cleanedCount = 0;

    for (const [sessionId, session] of this.conversations.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > ttl) {
        this.conversations.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired conversation sessions`);
    }

    return cleanedCount;
  }

  // 매장의 활성 세션 수 조회
  getActiveSessionCount(storeId: string): number {
    let count = 0;
    for (const session of this.conversations.values()) {
      if (session.storeId === storeId) {
        count++;
      }
    }
    return count;
  }

  // 컨텍스트 통합 (AI 프롬프트용)
  async buildPromptContext(
    storeId: string,
    sessionId?: string,
    customerId?: string,
    includeAnalytics: boolean = false,
    dateRange: string = 'today'
  ) {
    try {
      const [storeContext, customerContext, analyticsData] = await Promise.all([
        this.getStoreContext(storeId),
        customerId ? this.getCustomerContext(customerId, storeId) : Promise.resolve(null),
        includeAnalytics ? this.getAnalyticsContext(storeId, dateRange) : Promise.resolve(null)
      ]);

      const conversationHistory = sessionId ? this.getConversationHistory(sessionId, 5) : [];

      return {
        storeInfo: storeContext,
        customerInfo: customerContext,
        analyticsData,
        conversationHistory,
        timestamp: new Date(),
        language: storeContext?.settings.language || 'ko'
      };

    } catch (error) {
      logger.error('Failed to build prompt context:', error);
      return {
        timestamp: new Date(),
        language: 'ko'
      };
    }
  }

  // 서비스 간 통신용 토큰 생성 (간단한 방식, 실제로는 더 안전한 방법 사용)
  private generateServiceToken(): string {
    // 실제 구현에서는 서비스 간 인증을 위한 더 안전한 토큰 생성
    // 현재는 JWT secret을 사용한 간단한 서비스 토큰
    return 'service-token-placeholder';
  }

  // 메뉴 추천을 위한 컨텍스트 분석
  async analyzeMenuPreferences(customerId: string, storeId: string): Promise<{
    preferredCategories: string[];
    allergens: string[];
    priceRange: { min: number; max: number } | null;
    dietaryRestrictions: string[];
  }> {
    const customerContext = await this.getCustomerContext(customerId, storeId);
    const storeContext = await this.getStoreContext(storeId);

    if (!customerContext || !storeContext) {
      return {
        preferredCategories: [],
        allergens: [],
        priceRange: null,
        dietaryRestrictions: []
      };
    }

    // 이전 주문 분석
    const previousOrders = customerContext.previousOrders || [];
    const categoryCount: Record<string, number> = {};
    const prices: number[] = [];

    for (const order of previousOrders) {
      const menu = storeContext.menus.find(m => m.id === order.menuId);
      if (menu) {
        categoryCount[menu.category] = (categoryCount[menu.category] || 0) + order.quantity;
        prices.push(menu.price);
      }
    }

    const preferredCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    const priceRange = prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices)
    } : null;

    return {
      preferredCategories,
      allergens: customerContext.allergens || [],
      priceRange,
      dietaryRestrictions: customerContext.dietaryRestrictions || []
    };
  }
}

export default new ContextService();