import { ICacheItem, ICacheManager } from '../types';
import { config } from '../config';

class InMemoryCache implements ICacheManager {
  private cache = new Map<string, ICacheItem<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, config.cache.checkPeriod * 1000);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number = config.cache.ttl): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);

    // Check cache size limit
    if (this.cache.size >= config.cache.maxItems) {
      // Remove oldest items (simple LRU-like behavior)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      expiresAt
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Convert pattern to regex (simple wildcard support)
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    const regex = new RegExp(regexPattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let activeCount = 0;

    for (const item of this.cache.values()) {
      if (now > item.expiresAt) {
        expiredCount++;
      } else {
        activeCount++;
      }
    }

    return {
      totalItems: this.cache.size,
      activeItems: activeCount,
      expiredItems: expiredCount,
      maxItems: config.cache.maxItems,
      usage: (this.cache.size / config.cache.maxItems) * 100
    };
  }

  // Manual cleanup of expired items
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  // Get all keys matching pattern
  getKeys(pattern?: string): string[] {
    if (!pattern) {
      return Array.from(this.cache.keys());
    }

    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    const regex = new RegExp(regexPattern);

    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  // Graceful shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Create singleton instance
export const cache = new InMemoryCache();

// Cache key builders (centralized)
export const CacheKeys = {
  // Dashboard overview
  overview: (storeId: string) => `dashboard:overview:${storeId}`,

  // Table related
  tableOverview: (storeId: string, tableId?: string) =>
    tableId ? `table:${storeId}:${tableId}` : `table:${storeId}:*`,

  // Statistics
  todayStats: (storeId: string) => `stats:today:${storeId}`,
  hourlyStats: (storeId: string, date: string) => `stats:hourly:${storeId}:${date}`,

  // Places
  placeOverview: (storeId: string, placeId: string) => `place:${storeId}:${placeId}`,

  // Logs
  logs: (storeId: string, page: number = 0) => `logs:${storeId}:${page}`,

  // Order related
  activeOrders: (storeId: string) => `orders:active:${storeId}`,
  tableOrders: (tableId: string) => `orders:table:${tableId}`,

  // Menu and categories
  menus: (storeId: string) => `menus:${storeId}`,
  categories: (storeId: string) => `categories:${storeId}`,

  // User related
  userPermissions: (userId: string) => `user:permissions:${userId}`,

  // System
  systemHealth: () => 'system:health',
  lastUpdate: (storeId: string, type: string) => `lastupdate:${storeId}:${type}`
};

// Cache invalidation helpers
export const CacheInvalidator = {
  // Invalidate all dashboard data for a store
  invalidateDashboard(storeId: string): void {
    cache.clear(`dashboard:*:${storeId}*`);
    cache.clear(`stats:*:${storeId}*`);
    cache.clear(`table:${storeId}:*`);
  },

  // Invalidate table related data
  invalidateTable(storeId: string, tableId?: string): void {
    if (tableId) {
      cache.clear(`table:${storeId}:${tableId}`);
      cache.clear(`orders:table:${tableId}`);
    } else {
      cache.clear(`table:${storeId}:*`);
    }
    cache.delete(CacheKeys.overview(storeId));
  },

  // Invalidate stats
  invalidateStats(storeId: string): void {
    cache.clear(`stats:*:${storeId}*`);
    cache.delete(CacheKeys.overview(storeId));
  },

  // Invalidate orders
  invalidateOrders(storeId: string, tableId?: string): void {
    cache.delete(CacheKeys.activeOrders(storeId));
    if (tableId) {
      cache.delete(CacheKeys.tableOrders(tableId));
    }
    cache.delete(CacheKeys.overview(storeId));
  },

  // Invalidate everything for a store
  invalidateStore(storeId: string): void {
    cache.clear(`*:${storeId}*`);
    cache.clear(`*:*:${storeId}*`);
  }
};

// Cache warming utilities
export const CacheWarmer = {
  // Pre-populate frequently accessed cache keys
  async warmupDashboard(storeId: string, getData: () => Promise<any>): Promise<void> {
    try {
      const data = await getData();
      cache.set(CacheKeys.overview(storeId), data, 30); // 30 seconds for warm data
    } catch (error) {
      console.error(`Failed to warm up dashboard cache for store ${storeId}:`, error);
    }
  }
};

// Cleanup on process exit
process.on('SIGINT', () => {
  cache.destroy();
});

process.on('SIGTERM', () => {
  cache.destroy();
});