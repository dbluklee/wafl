import { storeContextService } from './storeContextService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

export interface PlaceData {
  id?: number;
  store_id: number;
  name: string;
  color: string;
  table_count: number;
  sort_order?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface LogData {
  id?: number;
  store_id: number;
  type: string;
  message: string;
  metadata?: string;
  created_at?: Date;
}

class PlaceService {
  // Places API
  async createPlace(place: Omit<PlaceData, 'id' | 'created_at' | 'updated_at' | 'store_id'>): Promise<PlaceData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/places`, {
      method: 'POST',
      body: place,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create place');
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
      throw new Error(error.error || 'Failed to fetch place');
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
      throw new Error(error.error || 'Failed to update place');
    }

    return response.json();
  }

  async deletePlace(id: number): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/places/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete place');
    }
  }

  // Update place order
  async updatePlaceOrder(placeOrders: { id: number; sort_order: number }[]): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/places/order`, {
      method: 'PUT',
      body: { placeOrders },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update place order');
    }
  }

  // Logs API
  async createLog(log: Omit<LogData, 'id' | 'created_at' | 'store_id'>): Promise<LogData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/logs`, {
      method: 'POST',
      body: log,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create log');
    }

    return response.json();
  }

  async getAllLogs(limit?: number): Promise<LogData[]> {
    const url = new URL(`${API_BASE_URL}/logs`);
    if (limit) {
      url.searchParams.append('limit', limit.toString());
    }

    const response = await storeContextService.fetchWithStoreContext(url.toString());
    
    if (!response.ok) {
      throw new Error('Failed to fetch logs');
    }

    return response.json();
  }

  async getLogsByStore(storeId: number, limit?: number): Promise<LogData[]> {
    const url = new URL(`${API_BASE_URL}/logs/store/${storeId}`);
    if (limit) {
      url.searchParams.append('limit', limit.toString());
    }

    const response = await storeContextService.fetchWithStoreContext(url.toString(), {
      storeId
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch logs');
    }

    return response.json();
  }

  async getLogsByType(type: string, limit?: number): Promise<LogData[]> {
    const url = new URL(`${API_BASE_URL}/logs/type/${type}`);
    if (limit) {
      url.searchParams.append('limit', limit.toString());
    }

    const response = await storeContextService.fetchWithStoreContext(url.toString());
    
    if (!response.ok) {
      throw new Error('Failed to fetch logs');
    }

    return response.json();
  }

  async deleteLog(id: number): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/logs/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete log');
    }
  }
}

export const placeService = new PlaceService();