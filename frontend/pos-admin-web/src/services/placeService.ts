import { storeContextService } from './storeContextService';

// WAFL project API base URL - via API Gateway
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://112.148.37.41:4000';

export interface PlaceData {
  id?: string;
  storeId: string;
  name: string;
  color: string;
  tableCount?: number;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    tables: number;
  };
}

export interface LogData {
  id?: string;
  storeId: string;
  type: string;
  message: string;
  metadata?: string;
  createdAt?: string;
}

class PlaceService {
  // Places API - WAFL Store Management Service
  async createPlace(place: Omit<PlaceData, 'id' | 'createdAt' | 'updatedAt' | 'storeId'>): Promise<PlaceData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/places`, {
      method: 'POST',
      body: place,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create place');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getAllPlaces(): Promise<PlaceData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/places`);

    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getPlacesByStore(storeId: string): Promise<PlaceData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/places/store/${storeId}`, {
      storeId
    });

    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getPlaceById(id: string): Promise<PlaceData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/places/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch place');
    }

    const result = await response.json();
    return result.data || result;
  }

  async updatePlace(id: string, updates: Partial<PlaceData>): Promise<PlaceData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/places/${id}`, {
      method: 'PUT',
      body: updates,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update place');
    }

    const result = await response.json();
    return result.data || result;
  }

  async deletePlace(id: string): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/places/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete place');
    }
  }

  // Update place order
  async updatePlaceOrder(placeOrders: { id: string; sortOrder: number }[]): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/places/reorder`, {
      method: 'PUT',
      body: { orders: placeOrders },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update place order');
    }
  }
}

export const placeService = new PlaceService();