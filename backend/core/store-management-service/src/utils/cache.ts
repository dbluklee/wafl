// Cache functionality disabled - using in-memory cache instead of Redis
export class CacheManager {
  private cache = new Map<string, { data: any; expires: number }>();
  private prefix = 'store:';

  private getKey(storeId: string, type: string, id?: string): string {
    if (id) {
      return `${this.prefix}${storeId}:${type}:${id}`;
    }
    return `${this.prefix}${storeId}:${type}`;
  }

  async get<T>(storeId: string, type: string, id?: string): Promise<T | null> {
    try {
      const key = this.getKey(storeId, type, id);
      const item = this.cache.get(key);

      if (!item) return null;

      if (Date.now() > item.expires) {
        this.cache.delete(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(storeId: string, type: string, data: any, id?: string, ttl: number = 3600): Promise<void> {
    try {
      const key = this.getKey(storeId, type, id);
      const expires = Date.now() + (ttl * 1000);
      this.cache.set(key, { data, expires });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(storeId: string, type: string, id?: string): Promise<void> {
    try {
      const key = this.getKey(storeId, type, id);
      this.cache.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidate(storeId: string, type: string): Promise<void> {
    try {
      const pattern = `${this.prefix}${storeId}:${type}`;
      for (const key of this.cache.keys()) {
        if (key.startsWith(pattern)) {
          this.cache.delete(key);
        }
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }
}

export const cacheManager = new CacheManager();