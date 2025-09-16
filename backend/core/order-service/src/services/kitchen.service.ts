import { cache } from '../utils/cache';
import { emitToKitchen } from '../config/socket';
import { IKitchenOrder } from '../types';

export class KitchenService {
  async getPendingOrders(storeId: string): Promise<IKitchenOrder[]> {
    const key = `kitchen:${storeId}:pending`;
    return cache.get<IKitchenOrder[]>(key) || [];
  }

  async getCookingOrders(storeId: string): Promise<IKitchenOrder[]> {
    const key = `kitchen:${storeId}:cooking`;
    const orders = cache.get<IKitchenOrder[]>(key) || [];

    // 경과 시간 계산
    return orders.map(order => {
      if (order.startedAt) {
        const elapsed = Math.floor(
          (Date.now() - new Date(order.startedAt).getTime()) / 1000 / 60
        );
        return { ...order, elapsedTime: elapsed };
      }
      return order;
    });
  }

  async getReadyOrders(storeId: string): Promise<IKitchenOrder[]> {
    const key = `kitchen:${storeId}:ready`;
    return cache.get<IKitchenOrder[]>(key) || [];
  }

  async startCooking(storeId: string, orderId: string): Promise<void> {
    // Pending에서 찾기
    const pendingKey = `kitchen:${storeId}:pending`;
    const pendingOrders = cache.get<IKitchenOrder[]>(pendingKey) || [];
    const orderIndex = pendingOrders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      throw new Error('주문을 찾을 수 없습니다');
    }

    const order = pendingOrders[orderIndex];

    // Pending에서 제거
    pendingOrders.splice(orderIndex, 1);
    cache.set(pendingKey, pendingOrders, 24 * 60 * 60);

    // Cooking에 추가
    const cookingKey = `kitchen:${storeId}:cooking`;
    const cookingOrders = cache.get<IKitchenOrder[]>(cookingKey) || [];
    cookingOrders.push({
      ...order,
      status: 'cooking',
      startedAt: new Date()
    });
    cache.set(cookingKey, cookingOrders, 24 * 60 * 60);

    // WebSocket 알림
    emitToKitchen(storeId, 'order:cooking', { orderId });
  }

  async completeOrder(storeId: string, orderId: string): Promise<void> {
    // Cooking에서 찾기
    const cookingKey = `kitchen:${storeId}:cooking`;
    const cookingOrders = cache.get<IKitchenOrder[]>(cookingKey) || [];
    const orderIndex = cookingOrders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      throw new Error('조리 중인 주문을 찾을 수 없습니다');
    }

    const order = cookingOrders[orderIndex];

    // Cooking에서 제거
    cookingOrders.splice(orderIndex, 1);
    cache.set(cookingKey, cookingOrders, 24 * 60 * 60);

    // Ready에 추가
    const readyKey = `kitchen:${storeId}:ready`;
    const readyOrders = cache.get<IKitchenOrder[]>(readyKey) || [];
    readyOrders.push({
      ...order,
      status: 'ready',
      completedAt: new Date()
    });
    cache.set(readyKey, readyOrders, 24 * 60 * 60);

    // WebSocket 알림
    emitToKitchen(storeId, 'order:ready', { orderId });
  }

  async markAsServed(storeId: string, orderId: string): Promise<void> {
    // Ready에서 제거
    const readyKey = `kitchen:${storeId}:ready`;
    const readyOrders = cache.get<IKitchenOrder[]>(readyKey) || [];
    const filteredOrders = readyOrders.filter(o => o.id !== orderId);
    cache.set(readyKey, filteredOrders, 24 * 60 * 60);

    // WebSocket 알림
    emitToKitchen(storeId, 'order:served', { orderId });
  }

  async getKitchenStats(storeId: string): Promise<{
    pending: number;
    cooking: number;
    ready: number;
    avgCookingTime: number;
  }> {
    const [pendingOrders, cookingOrders, readyOrders] = await Promise.all([
      this.getPendingOrders(storeId),
      this.getCookingOrders(storeId),
      this.getReadyOrders(storeId)
    ]);

    // 평균 조리 시간 계산 (완료된 주문들)
    const completedOrders = readyOrders.filter(o => o.completedAt && o.startedAt);
    const cookingTimes = completedOrders.map(order => {
      const cookingTime = new Date(order.completedAt!).getTime() -
                         new Date(order.startedAt!).getTime();
      return cookingTime / (1000 * 60); // 분 단위
    });

    const avgCookingTime = cookingTimes.length > 0
      ? cookingTimes.reduce((a, b) => a + b, 0) / cookingTimes.length
      : 0;

    return {
      pending: pendingOrders.length,
      cooking: cookingOrders.length,
      ready: readyOrders.length,
      avgCookingTime: Math.round(avgCookingTime)
    };
  }

  async getOrderById(storeId: string, orderId: string): Promise<IKitchenOrder | null> {
    const queues = ['pending', 'cooking', 'ready'];

    for (const queue of queues) {
      const key = `kitchen:${storeId}:${queue}`;
      const orders = cache.get<IKitchenOrder[]>(key) || [];
      const order = orders.find(o => o.id === orderId);

      if (order) {
        if (queue === 'cooking' && order.startedAt) {
          const elapsed = Math.floor(
            (Date.now() - new Date(order.startedAt).getTime()) / 1000 / 60
          );
          return { ...order, elapsedTime: elapsed };
        }
        return order;
      }
    }

    return null;
  }

  async getAllKitchenOrders(storeId: string): Promise<{
    pending: IKitchenOrder[];
    cooking: IKitchenOrder[];
    ready: IKitchenOrder[];
  }> {
    const [pending, cooking, ready] = await Promise.all([
      this.getPendingOrders(storeId),
      this.getCookingOrders(storeId),
      this.getReadyOrders(storeId)
    ]);

    return { pending, cooking, ready };
  }

  // 긴급 주문 우선순위 조정
  async setPriority(storeId: string, orderId: string, priority: number): Promise<void> {
    const queues = ['pending', 'cooking'];

    for (const queue of queues) {
      const key = `kitchen:${storeId}:${queue}`;
      const orders = cache.get<IKitchenOrder[]>(key) || [];
      const orderIndex = orders.findIndex(o => o.id === orderId);

      if (orderIndex !== -1) {
        orders[orderIndex].priority = priority;

        // 우선순위에 따라 정렬 (높은 숫자가 높은 우선순위)
        orders.sort((a, b) => (b.priority || 0) - (a.priority || 0));

        cache.set(key, orders, 24 * 60 * 60);

        // WebSocket 알림
        emitToKitchen(storeId, 'order:priority:changed', {
          orderId,
          priority,
          queue
        });
        break;
      }
    }
  }
}

export const kitchenService = new KitchenService();