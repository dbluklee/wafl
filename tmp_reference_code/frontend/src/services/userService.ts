import { storeContextService } from './storeContextService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

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

export interface SignUpData {
  // User data
  phone: string;
  name: string;
  email?: string;
  // Store data
  business_registration_number: string;
  store_name: string;
  owner_name: string;
  store_address: string;
  naver_store_link?: string;
  pre_work?: boolean;
}

export interface UserProfile extends UserData {
  // User fields already included from UserData
  stores?: StoreData[];
}

export interface SignInData {
  store_number: string;
  user_pin: string;
}

export interface AuthResponse {
  user: UserData;
  store: StoreData;
}

class UserService {
  async checkServerConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return { 
          connected: true, 
          message: 'Server connection successful' 
        };
      } else {
        return { 
          connected: false, 
          message: `Server responded with status ${response.status}` 
        };
      }
    } catch (error) {
      return { 
        connected: false, 
        message: `Server connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async register(signUpData: SignUpData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessRegistrationNumber: signUpData.business_registration_number,
        storeName: signUpData.store_name,
        ownerName: signUpData.owner_name,
        phoneNumber: signUpData.phone,
        email: signUpData.email,
        storeAddress: signUpData.store_address,
        naverStoreLink: signUpData.naver_store_link,
        preWork: signUpData.pre_work || false
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to register user');
    }

    const result = await response.json();
    
    // Create user and store objects from the response
    const store: StoreData = {
      id: result.storeId,
      user_id: result.userId,
      business_registration_number: signUpData.business_registration_number,
      store_name: result.storeName,
      owner_name: result.ownerName,
      store_address: signUpData.store_address,
      naver_store_link: signUpData.naver_store_link,
      store_number: result.storeNumber,
      user_pin: result.userPin,
      pre_work: result.preWork,
      created_at: new Date(result.createdAt),
      updated_at: new Date(result.createdAt)
    };

    const user: UserData = {
      id: result.userId,
      phone: signUpData.phone,
      name: signUpData.name,
      email: signUpData.email,
      created_at: new Date(result.createdAt),
      updated_at: new Date(result.createdAt)
    };

    // Set the store context for future API calls
    storeContextService.setCurrentStore(store.id, store);

    return { user, store };
  }

  async signIn(signInData: SignInData): Promise<any> {
    const response = await fetch(`${API_BASE}/users/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeNumber: signInData.store_number,
        userPin: signInData.user_pin
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign in');
    }

    const result = await response.json();
    
    // Set the store context for future API calls using the flattened response
    const storeData = {
      id: result.storeId,
      user_id: result.userId,
      store_name: result.storeName,
      owner_name: result.ownerName,
      store_number: result.storeNumber,
      user_pin: result.userPin,
      pre_work: result.preWork,
      // Add other required fields
      business_registration_number: '',
      store_address: '',
      naver_store_link: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    storeContextService.setCurrentStore(result.storeId, storeData);

    return result;
  }

  async getUserById(userId: number): Promise<UserData> {
    const response = await fetch(`${API_BASE}/users/${userId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user');
    }

    return response.json();
  }

  async getUserStores(userId: number): Promise<StoreData[]> {
    return storeContextService.getStoresByUserId(userId);
  }

  // Get current user profile with stores
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const store = storeContextService.getCurrentStore();
    if (!store) {
      return null;
    }

    try {
      const user = await this.getUserById(store.user_id);
      const stores = await this.getUserStores(user.id);
      
      return {
        ...user,
        stores
      };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  // Switch to a different store context
  async switchStore(storeId: number): Promise<void> {
    try {
      const store = await storeContextService.getStoreById(storeId);
      storeContextService.setCurrentStore(storeId, store);
    } catch (error) {
      throw new Error('Failed to switch store context');
    }
  }

  // Sign out - clear store context
  signOut(): void {
    storeContextService.clearCurrentStore();
  }
}

export const userService = new UserService();