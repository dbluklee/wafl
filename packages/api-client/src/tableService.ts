import { Table, TableCreateRequest, TableUpdateRequest } from '@wafl/store-info';

// HTTP 클라이언트 인터페이스
export interface HttpClient {
  fetchWithStoreContext(url: string, options?: {
    method?: string;
    body?: any;
    storeId?: string;
  }): Promise<Response>;
}

export class TableService {
  constructor(
    private httpClient: HttpClient,
    private apiBaseUrl: string
  ) {}

  // Table API
  async createTable(table: TableCreateRequest): Promise<Table> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/tables`, {
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

  async getAllTables(): Promise<Table[]> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/tables`);

    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getTablesByStore(storeId: string): Promise<Table[]> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/tables/store/${storeId}`, {
      storeId
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getTablesByPlace(placeId: string): Promise<Table[]> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/tables/place/${placeId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    const result = await response.json();
    return result.data || result;
  }

  // 장소별 테이블 수 조회 (핵심 기능)
  async getTableCountByPlace(placeId: string): Promise<number> {
    const tables = await this.getTablesByPlace(placeId);
    return tables.length;
  }

  async getTableById(id: string): Promise<Table> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/tables/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch table');
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateTable(id: string, updates: TableUpdateRequest): Promise<Table> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/tables/${id}`, {
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
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/tables/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete table');
    }
  }

  // Update table order
  async updateTableOrder(tableOrders: { id: string; sortOrder: number }[]): Promise<void> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/tables/reorder`, {
      method: 'PUT',
      body: { orders: tableOrders },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update table order');
    }
  }
}