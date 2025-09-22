// Simple in-memory store for development/testing
// In production, this should be replaced with Redis or another persistent store

interface IStorageItem {
  value: any;
  expiresAt: number;
}

class MemoryStore {
  private store: Map<string, IStorageItem> = new Map();

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds
      ? Date.now() + (ttlSeconds * 1000)
      : Date.now() + (24 * 60 * 60 * 1000); // Default 24 hours

    this.store.set(key, { value, expiresAt });
  }

  async get(key: string): Promise<any> {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.store.get(key);
    if (!item) return false;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  // Clean up expired entries periodically
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.store.entries()) {
        if (now > item.expiresAt) {
          this.store.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }
}

const memoryStore = new MemoryStore();
memoryStore.startCleanup();

// Session management
export const sessionStore = {
  async set(key: string, value: any, ttl?: number): Promise<void> {
    await memoryStore.set(`session:${key}`, value, ttl || 86400); // 24 hours default
  },

  async get(key: string): Promise<any> {
    return await memoryStore.get(`session:${key}`);
  },

  async delete(key: string): Promise<void> {
    await memoryStore.delete(`session:${key}`);
  },

  async exists(key: string): Promise<boolean> {
    return await memoryStore.exists(`session:${key}`);
  }
};

// Refresh token storage
export const refreshTokenStore = {
  async set(userId: string, token: string, ttl: number): Promise<void> {
    await memoryStore.set(`refresh:${userId}`, token, ttl);
  },

  async get(userId: string): Promise<string | null> {
    return await memoryStore.get(`refresh:${userId}`);
  },

  async delete(userId: string): Promise<void> {
    await memoryStore.delete(`refresh:${userId}`);
  }
};