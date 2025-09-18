// WAFL project API base URL - Store Management Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://112.148.37.41:4002';

export interface StoreData {
  id: number;
  storeCode: number;
  storeName: string;
  ownerName: string;
  storeAddress: string;
  businessRegistrationNumber: string;
  userPin: string;
  // Note: This is a simplified version for WAFL project
}

export interface UserData {
  id: number;
  phone: string;
  name: string;
  email?: string;
  role: 'owner' | 'staff';
}

export interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  storeId?: number;
}

class StoreContextService {
  private currentStoreId: number | null = null;
  private currentStore: StoreData | null = null;

  // Store context management
  setCurrentStore(storeId: number, store?: StoreData) {
    this.currentStoreId = storeId;
    if (store) {
      this.currentStore = store;
    }
    // Store in localStorage for persistence
    localStorage.setItem('currentStoreId', storeId.toString());
    if (store) {
      localStorage.setItem('currentStore', JSON.stringify(store));
    }
  }

  getCurrentStoreId(): number | null {
    if (this.currentStoreId) {
      return this.currentStoreId;
    }

    // Try to load from localStorage
    const stored = localStorage.getItem('currentStoreId');
    if (stored) {
      this.currentStoreId = parseInt(stored);
      return this.currentStoreId;
    }

    return null;
  }

  getCurrentStore(): StoreData | null {
    if (this.currentStore) {
      return this.currentStore;
    }

    // Try to load from localStorage
    const stored = localStorage.getItem('currentStore');
    if (stored) {
      try {
        this.currentStore = JSON.parse(stored);
        return this.currentStore;
      } catch (error) {
        console.error('Failed to parse stored store data:', error);
      }
    }

    return null;
  }

  clearCurrentStore() {
    this.currentStoreId = null;
    this.currentStore = null;
    localStorage.removeItem('currentStoreId');
    localStorage.removeItem('currentStore');
  }

  // Helper method to create API requests with store context
  createApiRequest(url: string, options: ApiRequestOptions = {}): Request {
    const storeId = options.storeId || this.getCurrentStoreId();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    // Add store context via header
    if (storeId) {
      headers['x-store-id'] = storeId.toString();
    }

    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers,
    };

    if (options.body) {
      // Ensure store_id is in body for non-GET requests
      if (options.method !== 'GET' && storeId) {
        const bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        bodyData.storeId = storeId;
        requestOptions.body = JSON.stringify(bodyData);
      } else {
        requestOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      }
    }

    return new Request(url, requestOptions);
  }

  // Wrapper for fetch with store context
  async fetchWithStoreContext(url: string, options: ApiRequestOptions = {}): Promise<Response> {
    const request = this.createApiRequest(url, options);
    return fetch(request);
  }
}

// StoreContextService instance for managing multi-tenant store context
export const storeContextService = new StoreContextService();