import { storeContextService } from './storeContextService';

// WAFL project API base URL - Store Management Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://112.148.37.41:4002/api/v1';

export interface MenuData {
  id?: number;
  categoryId: number;
  storeId: number;
  name: string;
  price: number;
  description?: string;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class MenuService {
  // Menus API
  async createMenu(menu: Omit<MenuData, 'id' | 'createdAt' | 'updatedAt' | 'storeId'>): Promise<MenuData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/menus`, {
      method: 'POST',
      body: menu,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create menu');
    }

    return response.json();
  }

  async getAllMenus(): Promise<MenuData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/menus`);

    if (!response.ok) {
      throw new Error('Failed to fetch menus');
    }

    return response.json();
  }

  async getMenusByStore(storeId: number): Promise<MenuData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/menus/store/${storeId}`, {
      storeId
    });

    if (!response.ok) {
      throw new Error('Failed to fetch menus');
    }

    return response.json();
  }

  async getMenusByCategory(categoryId: number): Promise<MenuData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/menus/category/${categoryId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch menus');
    }

    return response.json();
  }

  async getMenuById(id: number): Promise<MenuData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/menus/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch menu');
    }

    return response.json();
  }

  async updateMenu(id: number, updates: Partial<MenuData>): Promise<MenuData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/menus/${id}`, {
      method: 'PUT',
      body: updates,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update menu');
    }

    return response.json();
  }

  async deleteMenu(id: number): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/menus/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete menu');
    }
  }

  // Update menu order
  async updateMenuOrder(menuOrders: { id: number; sortOrder: number }[]): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/menus/reorder`, {
      method: 'PUT',
      body: { menus: menuOrders },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update menu order');
    }
  }
}

export const menuService = new MenuService();