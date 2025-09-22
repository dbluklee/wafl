import { CacheEntry } from '@/types';
import logger, { aiLogger } from './logger';

class InMemoryCache {
  private store: Map<string, CacheEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  set<T>(key: string, value: T, ttlSeconds: number = 3600): void {
    const entry: CacheEntry<T> = {
      key,
      value,
      ttl: ttlSeconds * 1000, // TTL을 밀리초로 변환
      createdAt: new Date()
    };

    this.store.set(key, entry);
    logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
  }

  get<T>(key: string, type: 'conversation' | 'translation' | 'suggestion' = 'conversation'): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      this.stats.misses++;
      aiLogger.cacheMiss(key, type);
      return null;
    }

    // TTL 체크
    const now = new Date();
    const expirationTime = new Date(entry.createdAt.getTime() + entry.ttl);

    if (now > expirationTime) {
      this.store.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      aiLogger.cacheMiss(key, type);
      logger.debug(`Cache EXPIRED: ${key}`);
      return null;
    }

    this.stats.hits++;
    aiLogger.cacheHit(key, type);
    return entry.value as T;
  }

  delete(key: string): boolean {
    const deleted = this.store.delete(key);
    if (deleted) {
      logger.debug(`Cache DELETE: ${key}`);
    }
    return deleted;
  }

  clear(): void {
    const size = this.store.size;
    this.store.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
    logger.info(`Cache CLEAR: ${size} entries removed`);
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;

    // TTL 체크
    const now = new Date();
    const expirationTime = new Date(entry.createdAt.getTime() + entry.ttl);

    if (now > expirationTime) {
      this.store.delete(key);
      this.stats.evictions++;
      return false;
    }

    return true;
  }

  size(): number {
    return this.store.size;
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      total,
      hitRate: parseFloat(hitRate.toFixed(2)),
      size: this.store.size
    };
  }

  // 만료된 항목들을 정리하는 메서드
  cleanup(): number {
    const now = new Date();
    let cleanedCount = 0;

    for (const [key, entry] of this.store.entries()) {
      const expirationTime = new Date(entry.createdAt.getTime() + entry.ttl);
      if (now > expirationTime) {
        this.store.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.stats.evictions += cleanedCount;
      logger.info(`Cache CLEANUP: ${cleanedCount} expired entries removed`);
    }

    return cleanedCount;
  }

  // 패턴 기반 삭제
  deleteByPattern(pattern: string): number {
    let deletedCount = 0;
    const regex = new RegExp(pattern);

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.debug(`Cache DELETE_PATTERN: ${pattern} - ${deletedCount} entries removed`);
    }

    return deletedCount;
  }

  // 사용량 기반 정리 (LRU와 유사한 동작)
  evictLeastRecentlyUsed(maxSize: number): number {
    if (this.store.size <= maxSize) return 0;

    // createdAt 기준으로 정렬하여 가장 오래된 항목부터 제거
    const entries = Array.from(this.store.entries());
    entries.sort((a, b) => a[1].createdAt.getTime() - b[1].createdAt.getTime());

    const toEvict = entries.slice(0, this.store.size - maxSize);
    let evictedCount = 0;

    for (const [key] of toEvict) {
      this.store.delete(key);
      evictedCount++;
    }

    this.stats.evictions += evictedCount;
    if (evictedCount > 0) {
      logger.info(`Cache LRU_EVICTION: ${evictedCount} entries removed (max size: ${maxSize})`);
    }

    return evictedCount;
  }
}

// TTL별 전용 캐시 인스턴스들
class TTLCache {
  private shortTermCache = new InMemoryCache(); // 30초
  private mediumTermCache = new InMemoryCache(); // 5분
  private longTermCache = new InMemoryCache(); // 1시간

  // 짧은 캐시 (실시간 데이터)
  setShort<T>(key: string, value: T): void {
    this.shortTermCache.set(key, value, 30);
  }

  getShort<T>(key: string): T | null {
    return this.shortTermCache.get<T>(key);
  }

  // 중간 캐시 (메뉴, 설정 등)
  setMedium<T>(key: string, value: T): void {
    this.mediumTermCache.set(key, value, 300); // 5분
  }

  getMedium<T>(key: string): T | null {
    return this.mediumTermCache.get<T>(key);
  }

  // 긴 캐시 (번역, 분석 결과 등)
  setLong<T>(key: string, value: T): void {
    this.longTermCache.set(key, value, 3600); // 1시간
  }

  getLong<T>(key: string): T | null {
    return this.longTermCache.get<T>(key, 'translation');
  }

  // 전체 통계
  getStats() {
    const shortStats = this.shortTermCache.getStats();
    const mediumStats = this.mediumTermCache.getStats();
    const longStats = this.longTermCache.getStats();

    return {
      short: shortStats,
      medium: mediumStats,
      long: longStats,
      total: {
        size: shortStats.size + mediumStats.size + longStats.size,
        hits: shortStats.hits + mediumStats.hits + longStats.hits,
        misses: shortStats.misses + mediumStats.misses + longStats.misses,
        evictions: shortStats.evictions + mediumStats.evictions + longStats.evictions
      }
    };
  }

  // 전체 정리
  cleanup(): number {
    const shortCleaned = this.shortTermCache.cleanup();
    const mediumCleaned = this.mediumTermCache.cleanup();
    const longCleaned = this.longTermCache.cleanup();

    return shortCleaned + mediumCleaned + longCleaned;
  }

  // 패턴별 삭제
  invalidateByPattern(pattern: string): number {
    const shortDeleted = this.shortTermCache.deleteByPattern(pattern);
    const mediumDeleted = this.mediumTermCache.deleteByPattern(pattern);
    const longDeleted = this.longTermCache.deleteByPattern(pattern);

    return shortDeleted + mediumDeleted + longDeleted;
  }

  // 매장별 캐시 무효화
  invalidateStore(storeId: string): number {
    return this.invalidateByPattern(`store:${storeId}:.*`);
  }

  // 사용자별 캐시 무효화
  invalidateUser(userId: string): number {
    return this.invalidateByPattern(`user:${userId}:.*`);
  }
}

// 전역 캐시 인스턴스
export const cache = new TTLCache();

export default InMemoryCache;