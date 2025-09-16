import { cache } from './cache';
import { config } from '../config';
import { format } from 'date-fns';

export class OrderNumberGenerator {
  private getKey(storeId: string): string {
    if (config.order.resetDaily) {
      const today = format(new Date(), 'yyyy-MM-dd');
      return `order:counter:${storeId}:${today}`;
    }
    return `order:counter:${storeId}`;
  }

  async generate(storeId: string): Promise<string> {
    const key = this.getKey(storeId);

    // 카운터 증가
    const counter = cache.incr(key);

    // 일일 리셋인 경우 자정에 만료
    if (config.order.resetDaily) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const ttlSeconds = Math.floor((tomorrow.getTime() - Date.now()) / 1000);
      cache.set(key, counter, ttlSeconds);
    }

    // 주문 번호 생성 (예: A001, A002, ...)
    const paddedNumber = counter.toString().padStart(3, '0');
    return `${config.order.numberPrefix}${paddedNumber}`;
  }

  async reset(storeId: string): Promise<void> {
    const key = this.getKey(storeId);
    cache.del(key);
  }
}

export const orderNumberGenerator = new OrderNumberGenerator();