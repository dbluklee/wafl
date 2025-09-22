import { Place, PlaceCreateRequest, PlaceUpdateRequest } from '@wafl/store-info';

// HTTP 클라이언트 인터페이스 (categoryService와 동일)
export interface HttpClient {
  fetchWithStoreContext(url: string, options?: {
    method?: string;
    body?: any;
    storeId?: string;
  }): Promise<Response>;
}

export class PlaceService {
  constructor(
    private httpClient: HttpClient,
    private apiBaseUrl: string
  ) {}

  // Place API
  async createPlace(place: PlaceCreateRequest): Promise<Place> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/places`, {
      method: 'POST',
      body: place,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create place');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getAllPlaces(): Promise<Place[]> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/places`);

    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getPlacesByStore(storeId: string): Promise<Place[]> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/places/store/${storeId}`, {
      storeId
    });

    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getPlaceById(id: string): Promise<Place> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/places/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch place');
    }

    const result = await response.json();
    return result.data || result;
  }

  async updatePlace(id: string, updates: PlaceUpdateRequest): Promise<Place> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/places/${id}`, {
      method: 'PUT',
      body: updates,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update place');
    }

    const result = await response.json();
    return result.data || result;
  }

  async deletePlace(id: string): Promise<void> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/places/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete place');
    }
  }


  // Update place order
  async updatePlaceOrder(placeOrders: { id: string; sortOrder: number }[]): Promise<void> {
    const response = await this.httpClient.fetchWithStoreContext(`${this.apiBaseUrl}/api/v1/store/places/reorder`, {
      method: 'PUT',
      body: { orders: placeOrders },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update place order');
    }
  }
}