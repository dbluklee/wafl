interface ICacheItem<T> {
  value: T;
  expiry?: number;
}

class InMemoryCache {
  private cache = new Map<string, ICacheItem<any>>();

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const item: ICacheItem<T> = { value };

    if (ttlSeconds) {
      item.expiry = Date.now() + ttlSeconds * 1000;
    }

    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  del(key: string): void {
    this.cache.delete(key);
  }

  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) return false;

    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  keys(pattern?: string): string[] {
    const keys = Array.from(this.cache.keys());

    if (!pattern) return keys;

    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(key => regex.test(key));
  }

  incr(key: string): number {
    const current = this.get<number>(key) || 0;
    const incremented = current + 1;
    this.set(key, incremented);
    return incremented;
  }

  clear(): void {
    this.cache.clear();
  }

  // 만료된 아이템 정리
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new InMemoryCache();

// 5분마다 만료된 아이템 정리
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);