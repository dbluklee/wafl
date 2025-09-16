import { storeContextService } from './storeContextService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

export interface TableData {
  id?: number;
  place_id: number;
  store_id: number;
  name: string;
  color: string;
  dining_capacity: number;
  created_at?: Date;
  updated_at?: Date;
}

class TableService {
  async createTable(table: Omit<TableData, 'id' | 'created_at' | 'updated_at' | 'store_id'>): Promise<TableData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/tables`, {
      method: 'POST',
      body: table,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create table');
    }

    return response.json();
  }

  async getAllTables(): Promise<TableData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/tables`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    return response.json();
  }

  async getTablesByStore(storeId: number): Promise<TableData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/tables/store/${storeId}`, {
      storeId
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    return response.json();
  }

  async getTablesByPlace(placeId: number): Promise<TableData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/tables/place/${placeId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    return response.json();
  }

  async getTableById(id: number): Promise<TableData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/tables/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch table');
    }

    return response.json();
  }

  async updateTable(id: number, updates: Partial<TableData>): Promise<TableData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/tables/${id}`, {
      method: 'PUT',
      body: updates,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update table');
    }

    return response.json();
  }

  async deleteTable(id: number): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/tables/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete table');
    }
  }
}

export const tableService = new TableService();