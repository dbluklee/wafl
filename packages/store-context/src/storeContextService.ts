// Default API base URL - can be overridden by the consuming application
const DEFAULT_API_BASE_URL = 'http://112.148.37.41:4000';

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
  storeId?: string;
}

class StoreContextService {
  private currentStoreId: string | null = null;
  private currentStore: StoreData | null = null;
  private apiBaseUrl: string;

  constructor(apiBaseUrl?: string) {
    this.apiBaseUrl = apiBaseUrl || DEFAULT_API_BASE_URL;
  }

  // Store context management
  setCurrentStore(storeId: string, store?: StoreData) {
    this.currentStoreId = storeId;
    if (store) {
      this.currentStore = store;
    }
    // Store in localStorage for persistence
    localStorage.setItem('currentStoreId', storeId);
    if (store) {
      localStorage.setItem('currentStore', JSON.stringify(store));
    }
  }

  getCurrentStoreId(): string | null {
    // Try to load from authStore (persist storage) first - this contains the UUID
    const authStorage = localStorage.getItem('pos-admin-auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const storeId = parsed.state?.store?.id;
        if (storeId) {
          console.log('🏪 Found storeId from authStore:', storeId);
          return storeId; // Return the UUID directly
        }
      } catch (error) {
        console.error('Failed to parse auth storage:', error);
      }
    }

    // Try to access the authStore state directly from window
    try {
      const authStoreState = (window as any).__ZUSTAND_AUTH_STORE__;
      if (authStoreState?.store?.id) {
        console.log('🏪 Found storeId from window authStore:', authStoreState.store.id);
        return authStoreState.store.id;
      }
    } catch (e) {
      console.log('No window authStore available');
    }

    console.warn('⚠️ No storeId found in authStore!');
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
      headers['x-store-id'] = storeId;
    }

    // Get token from localStorage (multiple possible keys)
    const authToken = localStorage.getItem('authToken');
    const authStorage = localStorage.getItem('pos-admin-auth-storage');
    const accessToken = localStorage.getItem('access_token');

    console.log('🔍 Debug Token Info:', {
      authToken: authToken ? authToken.substring(0, 50) + '...' : null,
      authStorage: authStorage ? 'exists' : null,
      accessToken: accessToken ? accessToken.substring(0, 50) + '...' : null
    });

    let finalToken = null;

    // Try to get token from Zustand persist storage
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        finalToken = parsed.state?.accessToken;
        console.log('🔍 From authStorage:', finalToken ? finalToken.substring(0, 50) + '...' : null);
      } catch (e) {
        console.error('Failed to parse authStorage:', e);
      }
    }

    // Fallback to other localStorage keys
    if (!finalToken) {
      finalToken = authToken || accessToken;
    }

    // If still no token, try to get from direct authStore access
    if (!finalToken) {
      try {
        // Try to access the authStore state directly from window
        const authStoreState = (window as any).__ZUSTAND_AUTH_STORE__;
        if (authStoreState?.accessToken) {
          finalToken = authStoreState.accessToken;
          console.log('🔍 From window authStore:', finalToken.substring(0, 50) + '...');
        }
      } catch (e) {
        console.log('No window authStore available');
      }
    }

    if (finalToken) {
      headers['Authorization'] = `Bearer ${finalToken}`;
      console.log('🔑 Using token:', finalToken.substring(0, 50) + '...');
    } else {
      console.warn('⚠️ No auth token found in any location!');
      console.log('Available localStorage keys:', Object.keys(localStorage));
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
// Default instance - consuming applications can create their own with custom API base
export const storeContextService = new StoreContextService();

// Export the class for custom instances
export { StoreContextService };