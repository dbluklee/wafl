import { storeContextService } from './storeContextService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

export interface MenuData {
  id?: number;
  category_id: number;
  store_id: number;
  name: string;
  price: number;
  description?: string;
  sort_order?: number;
  created_at?: Date;
  updated_at?: Date;
}

class MenuService {
  // Menus API
  async createMenu(menu: Omit<MenuData, 'id' | 'created_at' | 'updated_at' | 'store_id'>): Promise<MenuData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/menus`, {
      method: 'POST',
      body: menu,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create menu');
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
      throw new Error(error.error || 'Failed to fetch menu');
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
      throw new Error(error.error || 'Failed to update menu');
    }

    return response.json();
  }

  async deleteMenu(id: number): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/menus/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete menu');
    }
  }

  // Update menu order
  async updateMenuOrder(menuOrders: { id: number; sort_order: number }[]): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/menus/order`, {
      method: 'PUT',
      body: { menuOrders },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update menu order');
    }
  }
}

export const menuService = new MenuService();