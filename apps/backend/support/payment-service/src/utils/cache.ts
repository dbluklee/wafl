import config from '@/config';
import { IPaymentCacheData } from '@/types';

export class InMemoryCache {
  private cache: Map<string, any> = new Map();
  private ttlMap: Map<string, number> = new Map();

  set(key: string, value: any, ttl: number = config.cache.ttlMedium): void {
    const expiresAt = Date.now() + (ttl * 1000);
    this.cache.set(key, value);
    this.ttlMap.set(key, expiresAt);
    console.log(`[Cache] Set key: ${key}, TTL: ${ttl}s`);
  }

  get<T = any>(key: string): T | null {
    const expiresAt = this.ttlMap.get(key);

    if (!expiresAt || Date.now() > expiresAt) {
      this.delete(key);
      console.log(`[Cache] Key expired: ${key}`);
      return null;
    }

    const value = this.cache.get(key);
    console.log(`[Cache] Get key: ${key}, found: ${value !== undefined}`);
    return value || null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.ttlMap.delete(key);
    if (deleted) {
      console.log(`[Cache] Deleted key: ${key}`);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.ttlMap.clear();
    console.log('[Cache] Cleared all entries');
  }

  has(key: string): boolean {
    const expiresAt = this.ttlMap.get(key);

    if (!expiresAt || Date.now() > expiresAt) {
      this.delete(key);
      return false;
    }

    return this.cache.has(key);
  }

  size(): number {
    this.cleanExpired();
    return this.cache.size;
  }

  keys(): string[] {
    this.cleanExpired();
    return Array.from(this.cache.keys());
  }

  invalidatePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    }

    console.log(`[Cache] Invalidated ${count} keys matching pattern: ${pattern}`);
    return count;
  }

  private cleanExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, expiresAt] of this.ttlMap.entries()) {
      if (now > expiresAt) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.delete(key);
    }
  }

  getStats(): {
    totalKeys: number;
    memoryUsage: number;
    hitRate?: number;
  } {
    this.cleanExpired();

    return {
      totalKeys: this.cache.size,
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length,
    };
  }

  setPayment(paymentId: string, data: any, ttl: number = config.cache.ttlMedium): void {
    const cacheData: IPaymentCacheData = {
      payment: data,
      cachedAt: Date.now(),
      ttl: ttl * 1000,
    };
    this.set(`payment:${paymentId}`, cacheData, ttl);
  }

  getPayment(paymentId: string): any | null {
    const cacheData = this.get<IPaymentCacheData>(`payment:${paymentId}`);
    return cacheData ? cacheData.payment : null;
  }

  invalidatePayment(paymentId: string): boolean {
    return this.delete(`payment:${paymentId}`);
  }

  invalidateOrderPayments(orderId: string): number {
    return this.invalidatePattern(`payment:.*:order:${orderId}`);
  }

  invalidateStorePayments(storeId: string): number {
    return this.invalidatePattern(`payment:.*:store:${storeId}`);
  }
}

export const paymentCache = new InMemoryCache();

console.log('[Cache] Payment service in-memory cache initialized');