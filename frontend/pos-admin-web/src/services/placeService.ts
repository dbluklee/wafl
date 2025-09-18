import { storeContextService } from './storeContextService';

// WAFL project API base URL - Store Management Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://112.148.37.41:4002/api/v1';

export interface PlaceData {
  id?: number;
  storeId: number;
  name: string;
  color: string;
  tableCount: number;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LogData {
  id?: number;
  storeId: number;
  type: string;
  message: string;
  metadata?: string;
  createdAt?: Date;
}

class PlaceService {
  // Places API - WAFL Store Management Service
  async createPlace(place: Omit<PlaceData, 'id' | 'createdAt' | 'updatedAt' | 'storeId'>): Promise<PlaceData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/places`, {
      method: 'POST',
      body: place,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create place');
    }

    return response.json();
  }

  async getAllPlaces(): Promise<PlaceData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/places`);

    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }

    return response.json();
  }

  async getPlacesByStore(storeId: number): Promise<PlaceData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/places/store/${storeId}`, {
      storeId
    });

    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }

    return response.json();
  }

  async getPlaceById(id: number): Promise<PlaceData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/places/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch place');
    }

    return response.json();
  }

  async updatePlace(id: number, updates: Partial<PlaceData>): Promise<PlaceData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/places/${id}`, {
      method: 'PUT',
      body: updates,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update place');
    }

    return response.json();
  }

  async deletePlace(id: number): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/places/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete place');
    }
  }

  // Update place order
  async updatePlaceOrder(placeOrders: { id: number; sortOrder: number }[]): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/places/reorder`, {
      method: 'PUT',
      body: { places: placeOrders },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update place order');
    }
  }
}

export const placeService = new PlaceService();