import { storeContextService } from './storeContextService';

// WAFL project API base URL - via API Gateway
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://112.148.37.41:4000';

export interface TableData {
  id?: string;
  placeId: string;
  storeId: string;
  name: string;
  color: string;
  diningCapacity: number;
  createdAt?: string;
  updatedAt?: string;
}

class TableService {
  // Tables API - WAFL Store Management Service
  async createTable(table: Omit<TableData, 'id' | 'createdAt' | 'updatedAt' | 'storeId'>): Promise<TableData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/tables`, {
      method: 'POST',
      body: table,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create table');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getAllTables(): Promise<TableData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/tables`);

    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getTablesByStore(storeId: string): Promise<TableData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/tables/store/${storeId}`, {
      storeId
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getTablesByPlace(placeId: string): Promise<TableData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/tables/place/${placeId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getTableById(id: string): Promise<TableData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/tables/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch table');
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateTable(id: string, updates: Partial<TableData>): Promise<TableData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/tables/${id}`, {
      method: 'PUT',
      body: updates,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update table');
    }

    const result = await response.json();
    return result.data || result;
  }

  async deleteTable(id: string): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/tables/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete table');
    }
  }

  // Update table order
  async updateTableOrder(tableOrders: { id: string; sortOrder: number }[]): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/tables/reorder`, {
      method: 'PUT',
      body: { orders: tableOrders },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update table order');
    }
  }
}

export const tableService = new TableService();