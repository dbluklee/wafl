import { storeContextService } from './storeContextService';

// WAFL project API base URL - via API Gateway
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://112.148.37.41:4000';

export interface MenuData {
  id?: string;
  categoryId: string;
  storeId: string;
  name: string;
  price: number;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class MenuService {
  // Menus API
  async createMenu(menu: Omit<MenuData, 'id' | 'createdAt' | 'updatedAt' | 'storeId'>): Promise<MenuData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/menus`, {
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

  async getAllMenus(): Promise<MenuData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/menus`);

    if (!response.ok) {
      throw new Error('Failed to fetch menus');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getMenusByStore(storeId: string): Promise<MenuData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/menus/store/${storeId}`, {
      storeId
    });

    if (!response.ok) {
      throw new Error('Failed to fetch menus');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getMenusByCategory(categoryId: string): Promise<MenuData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/menus/category/${categoryId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch menus');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getMenuById(id: string): Promise<MenuData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/menus/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch menu');
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateMenu(id: string, updates: Partial<MenuData>): Promise<MenuData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/menus/${id}`, {
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
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/menus/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete menu');
    }
  }

  // Update menu order
  async updateMenuOrder(menuOrders: { id: string; sortOrder: number }[]): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/menus/reorder`, {
      method: 'PUT',
      body: { orders: menuOrders },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update menu order');
    }
  }
}

export const menuService = new MenuService();