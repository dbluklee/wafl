import { createClient } from 'redis';
import { config } from './index';

// Redis client is optional - if no URL provided, operations are no-ops
export const redisClient = config.redis.url ? createClient({
  url: config.redis.url
}) : null;

// Only attach event listeners if client exists
if (redisClient) {
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });
}

export async function connectRedis() {
  if (redisClient && !redisClient.isOpen) {
    await redisClient.connect();
  }
}

// Session management helpers - all operations are safe no-ops without Redis
export const sessionStore = {
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!redisClient) return;
    try {
      if (redisClient.isOpen) {
        await redisClient.setEx(
          `session:${key}`,
          ttl || config.redis.sessionTTL,
          JSON.stringify(value)
        );
      }
    } catch (error) {
      console.warn('Redis session set failed:', error.message);
    }
  },

  async get(key: string): Promise<any> {
    if (!redisClient) return null;
    try {
      if (redisClient.isOpen) {
        const data = await redisClient.get(`session:${key}`);
        return data ? JSON.parse(data) : null;
      }
      return null;
    } catch (error) {
      console.warn('Redis session get failed:', error.message);
      return null;
    }
  },

  async delete(key: string): Promise<void> {
    if (!redisClient) return;
    try {
      if (redisClient.isOpen) {
        await redisClient.del(`session:${key}`);
      }
    } catch (error) {
      console.warn('Redis session delete failed:', error.message);
    }
  },

  async exists(key: string): Promise<boolean> {
    if (!redisClient) return false;
    try {
      if (redisClient.isOpen) {
        const result = await redisClient.exists(`session:${key}`);
        return result === 1;
      }
      return false;
    } catch (error) {
      console.warn('Redis session exists failed:', error.message);
      return false;
    }
  }
};

// Refresh token storage - all operations are safe no-ops without Redis
export const refreshTokenStore = {
  async set(userId: string, token: string, ttl: number): Promise<void> {
    if (!redisClient) return;
    try {
      if (redisClient.isOpen) {
        await redisClient.setEx(`refresh:${userId}`, ttl, token);
      }
    } catch (error) {
      console.warn('Redis refresh token set failed:', error.message);
    }
  },

  async get(userId: string): Promise<string | null> {
    if (!redisClient) return null;
    try {
      if (redisClient.isOpen) {
        return await redisClient.get(`refresh:${userId}`);
      }
      return null;
    } catch (error) {
      console.warn('Redis refresh token get failed:', error.message);
      return null;
    }
  },

  async delete(userId: string): Promise<void> {
    if (!redisClient) return;
    try {
      if (redisClient.isOpen) {
        await redisClient.del(`refresh:${userId}`);
      }
    } catch (error) {
      console.warn('Redis refresh token delete failed:', error.message);
    }
  }
};