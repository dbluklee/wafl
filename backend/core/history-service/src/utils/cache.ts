import { HistoryLogger } from './logger';

interface ICacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

interface ICacheStats {
  hits: number;
  misses: number;
  total: number;
  hitRate: number;
}

/**
 * 인메모리 캐시 시스템
 * TTL 기반으로 자동 만료되며, 패턴 기반 일괄 삭제 지원
 */
export class InMemoryCache {
  private cache = new Map<string, ICacheEntry<any>>();
  private stats: ICacheStats = {
    hits: 0,
    misses: 0,
    total: 0,
    hitRate: 0
  };

  // TTL 상수 (초)
  public static readonly TTL = {
    SHORT: 30,        // 30초 - 실시간 데이터
    MEDIUM: 300,      // 5분 - 일반 데이터
    LONG: 3600        // 1시간 - 정적 데이터
  };

  /**
   * 캐시에 데이터 저장
   * @param key 캐시 키
   * @param value 저장할 데이터
   * @param ttl TTL (초), 기본값: 300초
   */
  set<T>(key: string, value: T, ttl: number = InMemoryCache.TTL.MEDIUM): void {
    const expiresAt = Date.now() + (ttl * 1000);
    this.cache.set(key, {
      data: value,
      expiresAt,
      createdAt: Date.now()
    });
  }

  /**
   * 캐시에서 데이터 조회
   * @param key 캐시 키
   * @returns 데이터 또는 null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      HistoryLogger.logCacheMiss(key);
      return null;
    }

    // 만료 체크
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      HistoryLogger.logCacheMiss(key);
      return null;
    }

    this.stats.hits++;
    this.updateStats();
    HistoryLogger.logCacheHit(key);
    return entry.data;
  }

  /**
   * 특정 키의 캐시 삭제
   * @param key 캐시 키
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 패턴에 맞는 모든 키의 캐시 삭제
   * @param pattern 패턴 (와일드카드 * 지원)
   * @returns 삭제된 키의 개수
   */
  deleteByPattern(pattern: string): number {
    const regex = new RegExp('^' + pattern.replace(/\\*/g, '.*') + '$');
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * 만료된 캐시 정리
   * @returns 삭제된 키의 개수
   */
  cleanup(): number {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * 모든 캐시 삭제
   */
  clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  /**
   * 캐시에 키가 존재하는지 확인 (만료 체크 포함)
   * @param key 캐시 키
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 캐시 통계 조회
   */
  getStats(): ICacheStats {
    return { ...this.stats };
  }

  /**
   * 현재 캐시 크기 조회
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 모든 캐시 키 조회
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 캐시 메모리 사용량 추정 (KB)
   */
  getMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length;
      totalSize += JSON.stringify(entry.data).length;
    }
    return Math.round(totalSize / 1024); // KB 단위
  }

  private updateStats(): void {
    this.stats.total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = this.stats.total > 0
      ? Math.round((this.stats.hits / this.stats.total) * 100) / 100
      : 0;
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      total: 0,
      hitRate: 0
    };
  }
}

// 히스토리 서비스 전용 캐시 키 상수
export const CACHE_KEYS = {
  // 이력 관련
  HISTORY_LIST: (storeId: string, page: number) => `history:list:${storeId}:${page}`,
  HISTORY_ENTRY: (historyId: string) => `history:entry:${historyId}`,
  HISTORY_ENTITY: (entityType: string, entityId: string) => `history:entity:${entityType}:${entityId}`,

  // 사용자 관련
  USER_ACTIVITY: (userId: string, period: string) => `user:activity:${userId}:${period}`,
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,

  // 통계 관련
  HISTORY_STATS: (storeId: string, date: string) => `stats:history:${storeId}:${date}`,

  // Undo/Redo 관련
  UNDO_STACK: (userId: string) => `undo:stack:${userId}`,
  UNDOABLE_ACTIONS: (storeId: string) => `undo:actions:${storeId}`,

  // 패턴 (일괄 삭제용)
  PATTERNS: {
    HISTORY_BY_STORE: (storeId: string) => `history:*:${storeId}:*`,
    USER_DATA: (userId: string) => `user:*:${userId}*`,
    STORE_DATA: (storeId: string) => `*:${storeId}:*`
  }
};

// 싱글톤 캐시 인스턴스
export const historyCache = new InMemoryCache();

// 5분마다 만료된 캐시 정리
setInterval(() => {
  const deletedCount = historyCache.cleanup();
  if (deletedCount > 0) {
    HistoryLogger.logCacheHit(`Cleaned up ${deletedCount} expired cache entries`);
  }
}, 5 * 60 * 1000);