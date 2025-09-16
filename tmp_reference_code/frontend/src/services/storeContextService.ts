const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

export interface StoreData {
  id: number;
  user_id: number;
  business_registration_number: string;
  store_name: string;
  owner_name: string;
  store_address: string;
  naver_store_link?: string;
  store_number: string;
  user_pin: string;
  pre_work: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserData {
  id: number;
  phone: string;
  name: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
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
    
    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers,
    };
    
    if (options.body) {
      // Ensure store_id is in body for non-GET requests
      if (options.method !== 'GET' && storeId) {
        const bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        bodyData.store_id = storeId;
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

  // Store management API methods
  async getStoresByUserId(userId: number): Promise<StoreData[]> {
    const response = await this.fetchWithStoreContext(`${API_BASE_URL}/stores/user/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch stores');
    }
    
    return response.json();
  }

  async getStoreById(storeId: number): Promise<StoreData> {
    const response = await this.fetchWithStoreContext(`${API_BASE_URL}/stores/${storeId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch store');
    }
    
    return response.json();
  }

  async createStore(storeData: {
    user_id: number;
    business_registration_number: string;
    store_name: string;
    owner_name: string;
    store_address: string;
    naver_store_link?: string;
    pre_work?: boolean;
  }): Promise<StoreData> {
    const response = await this.fetchWithStoreContext(`${API_BASE_URL}/stores`, {
      method: 'POST',
      body: storeData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create store');
    }

    return response.json();
  }

  async updateStore(storeId: number, updates: Partial<StoreData>): Promise<StoreData> {
    const response = await this.fetchWithStoreContext(`${API_BASE_URL}/stores/${storeId}`, {
      method: 'PUT',
      body: updates
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update store');
    }

    return response.json();
  }

  async deleteStore(storeId: number): Promise<void> {
    const response = await this.fetchWithStoreContext(`${API_BASE_URL}/stores/${storeId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete store');
    }
  }
}

// StoreContextService instance for managing multi-tenant store context
export const storeContextService = new StoreContextService();