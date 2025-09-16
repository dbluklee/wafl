import { storeContextService } from './storeContextService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

export interface CategoryData {
  id?: number;
  store_id: number;
  name: string;
  color: string;
  menu_count: number;
  sort_order?: number;
  created_at?: Date;
  updated_at?: Date;
}

class CategoryService {
  // Categories API
  async createCategory(category: Omit<CategoryData, 'id' | 'created_at' | 'updated_at' | 'store_id'>): Promise<CategoryData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/categories`, {
      method: 'POST',
      body: category,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create category');
    }

    return response.json();
  }

  async getAllCategories(): Promise<CategoryData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  }

  async getCategoriesByStore(storeId: number): Promise<CategoryData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/categories/store/${storeId}`, {
      storeId
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  }

  async getCategoryById(id: number): Promise<CategoryData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/categories/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch category');
    }

    return response.json();
  }

  async updateCategory(id: number, updates: Partial<CategoryData>): Promise<CategoryData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      body: updates,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update category');
    }

    return response.json();
  }

  async deleteCategory(id: number): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete category');
    }
  }

  // Update category order
  async updateCategoryOrder(categoryOrders: { id: number; sort_order: number }[]): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/categories/order`, {
      method: 'PUT',
      body: { categoryOrders },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update category order');
    }
  }
}

export const categoryService = new CategoryService();