import { storeContextService } from './storeContextService';

// WAFL project API base URL - via API Gateway
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://112.148.37.41:4000';

export interface CategoryData {
  id?: string;
  storeId?: string;
  name: string;
  color: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    menus: number;
  };
}

class CategoryService {
  // Categories API
  async createCategory(category: Omit<CategoryData, 'id' | 'createdAt' | 'updatedAt' | 'storeId' | '_count'>): Promise<CategoryData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/categories`, {
      method: 'POST',
      body: category,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }

    const result = await response.json();
    return result.data || result; // Handle both wrapped and unwrapped responses
  }

  async getAllCategories(): Promise<CategoryData[]> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/categories`);

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const result = await response.json();
    return result.data || result; // Handle both wrapped and unwrapped responses
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

  async getCategoryById(id: string): Promise<CategoryData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/categories/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch category');
    }

    const result = await response.json();
    return result.data || result; // Handle both wrapped and unwrapped responses
  }

  async updateCategory(id: string, updates: Partial<CategoryData>): Promise<CategoryData> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/categories/${id}`, {
      method: 'PUT',
      body: updates,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update category');
    }

    const result = await response.json();
    return result.data || result; // Handle both wrapped and unwrapped responses
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/categories/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete category');
    }
  }

  // Update category order
  async updateCategoryOrder(categoryOrders: { id: number; sortOrder: number }[]): Promise<void> {
    const response = await storeContextService.fetchWithStoreContext(`${API_BASE_URL}/api/v1/store/categories/reorder`, {
      method: 'PUT',
      body: { orders: categoryOrders },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update category order');
    }
  }
}

export const categoryService = new CategoryService();