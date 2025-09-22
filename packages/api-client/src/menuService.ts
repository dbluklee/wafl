import { Menu, MenuCreateRequest, MenuUpdateRequest } from '@wafl/store-info';

// HTTP 클라이언트 인터페이스 (categoryService와 동일)
export interface HttpClient {
  fetchWithStoreContext(url: string, options?: {
    method?: string;
    body?: any;
    storeId?: string;
  }): Promise<Response>;
}

export class MenuService {
  constructor(
    private httpClient: HttpClient,
    private apiBaseUrl: string
  ) {}

  // Menu API
  async createMenu(menu: MenuCreateRequest): Promise<Menu> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/menus`, {
      method: 'POST',
      body: menu,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create menu');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getAllMenus(): Promise<Menu[]> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/menus`);

    if (!response.ok) {
      throw new Error('Failed to fetch menus');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getMenusByStore(storeId: string): Promise<Menu[]> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/menus/store/${storeId}`, {
      storeId
    });

    if (!response.ok) {
      throw new Error('Failed to fetch menus');
    }

    const result = await response.json();
    return result.data || result;
  }

  // 카테고리별 메뉴 조회 (요청하신 핵심 기능)
  async getMenusByCategory(categoryId: string): Promise<Menu[]> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/menus/category/${categoryId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch menus');
    }

    const result = await response.json();
    return result.data || result;
  }

  // 카테고리별 메뉴 수 조회 (요청하신 핵심 기능)
  async getMenuCountByCategory(categoryId: string): Promise<number> {
    const menus = await this.getMenusByCategory(categoryId);
    return menus.length;
  }

  async getMenuById(id: string): Promise<Menu> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/menus/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch menu');
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateMenu(id: string, updates: MenuUpdateRequest): Promise<Menu> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/menus/${id}`, {
      method: 'PUT',
      body: updates,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update menu');
    }

    const result = await response.json();
    return result.data || result;
  }

  async deleteMenu(id: string): Promise<void> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/menus/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete menu');
    }
  }

  // Update menu availability (기존 MenuAvailabilityRequest 대신 단순화)
  async updateMenuAvailability(id: string, isAvailable: boolean): Promise<Menu> {
    return this.updateMenu(id, { isAvailable });
  }

  // Update menu order
  async updateMenuOrder(menuOrders: { id: string; sortOrder: number }[]): Promise<void> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/menus/reorder`, {
      method: 'PUT',
      body: { orders: menuOrders },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update menu order');
    }
  }
}