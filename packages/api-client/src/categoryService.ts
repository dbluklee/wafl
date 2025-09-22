import { Category, CategoryCreateRequest, CategoryUpdateRequest } from '@wafl/store-info';

// HTTP 클라이언트 인터페이스 정의
export interface HttpClient {
  fetchWithStoreContext(url: string, options?: {
    method?: string;
    body?: any;
    storeId?: string;
  }): Promise<Response>;
}

export class CategoryService {
  constructor(
    private httpClient: HttpClient,
    private apiBaseUrl: string
  ) {}

  // Categories API
  async createCategory(category: CategoryCreateRequest): Promise<Category> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/categories`, {
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

  async getAllCategories(): Promise<Category[]> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/categories`);

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const result = await response.json();
    return result.data || result; // Handle both wrapped and unwrapped responses
  }

  async getCategoriesByStore(storeId: string): Promise<Category[]> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/categories/store/${storeId}`, {
      storeId
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/categories/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch category');
    }

    const result = await response.json();
    return result.data || result; // Handle both wrapped and unwrapped responses
  }

  async updateCategory(id: string, updates: CategoryUpdateRequest): Promise<Category> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/categories/${id}`, {
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
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/categories/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete category');
    }
  }

  // Update category order
  async updateCategoryOrder(categoryOrders: { id: number; sortOrder: number }[]): Promise<void> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/categories/reorder`, {
      method: 'PUT',
      body: { orders: categoryOrders },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update category order');
    }
  }
}