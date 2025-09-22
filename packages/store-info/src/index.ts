// Base Types
export type TId = string;
export type TTimestamp = Date;

// Category Types
export interface Category {
  id: TId;
  name: string;
  color: string;
  sortOrder: number;
  storeId: TId;
  isActive: boolean;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

// Category API 요청/응답 타입들
export interface CategoryCreateRequest {
  name: string;
  color: string;
  sortOrder?: number;
}

export interface CategoryUpdateRequest {
  name?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CategoryResponse extends Category {}

// Menu Types
export interface Menu {
  id: TId;
  name: string;
  description?: string;
  price: number;
  categoryId: TId;
  storeId: TId;
  imageUrl?: string;
  tags?: string[];
  allergens?: string[];
  isAvailable: boolean;
  stockQuantity?: number;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

// Menu API 요청/응답 타입들
export interface MenuCreateRequest {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags?: string[];
  allergens?: string[];
  isAvailable?: boolean;
  stockQuantity?: number;
}

export interface MenuUpdateRequest extends Partial<MenuCreateRequest> {}

export interface MenuResponse extends Menu {}

// Place Types
export interface Place {
  id: TId;
  name: string;
  color: string;
  storeId: TId;
  isActive: boolean;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

// Place API 요청/응답 타입들
export interface PlaceCreateRequest {
  name: string;
  color: string;
}

export interface PlaceUpdateRequest {
  name?: string;
  color?: string;
  isActive?: boolean;
}

export interface PlaceResponse extends Place {}

// Table Types
export interface Table {
  id: TId;
  name: string;
  placeId: TId;
  storeId: TId;
  color: string;
  diningCapacity: number;
  status: 'available' | 'occupied' | 'reserved';
  isActive: boolean;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

// Table API 요청/응답 타입들
export interface TableCreateRequest {
  name: string;
  placeId: string;
  color: string;
  diningCapacity: number;
  status?: 'available' | 'occupied' | 'reserved';
}

export interface TableUpdateRequest {
  name?: string;
  placeId?: string;
  color?: string;
  diningCapacity?: number;
  status?: 'available' | 'occupied' | 'reserved';
  isActive?: boolean;
}

export interface TableResponse extends Table {}