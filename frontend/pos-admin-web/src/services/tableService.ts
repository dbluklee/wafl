import { storeContextService } from './storeContextService';

// WAFL project API base URL - Store Management Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://112.148.37.41:4002/api/v1';

export interface TableData {
  id?: number;
  placeId: number;
  storeId: number;
  name: string;
  color: string;
  diningCapacity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class TableService {
  async createTable(table: Omit<TableData, 'id' | 'createdAt' | 'updatedAt' | 'storeId'>): Promise<TableData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/tables`, {
      method: 'POST',
      body: table,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create table');
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
      throw new Error(error.message || 'Failed to fetch table');
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
      throw new Error(error.message || 'Failed to update table');
    }

    return response.json();
  }

  async deleteTable(id: number): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/tables/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete table');
    }
  }
}

export const tableService = new TableService();