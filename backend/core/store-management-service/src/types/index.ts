import { Category, Menu, Place, Table, Store, Prisma } from '@shared/database';
import { Request } from 'express';

// JWT Payload (Auth Service에서 전달받음)
export interface IJwtPayload {
  userId: string;
  storeId: string;
  role: 'owner' | 'staff';
}

// Request with Auth
export interface IAuthRequest extends Request {
  user?: IJwtPayload;
  store?: Store;
}

// Category Types
export interface ICategoryCreateRequest {
  name: string;
  color?: string;
  sortOrder?: number;
}

export interface ICategoryUpdateRequest {
  name?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// Menu Types
export interface IMenuCreateRequest {
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags?: string[];
  allergens?: string[];
  isAvailable?: boolean;
  stockQuantity?: number;
  prepTime?: number;
  calories?: number;
  sortOrder?: number;
}

export interface IMenuUpdateRequest extends Partial<IMenuCreateRequest> {}

export interface IMenuAvailabilityRequest {
  isAvailable: boolean;
  reason?: string;
}

// Place Types
export interface IPlaceCreateRequest {
  name: string;
  color?: string;
}

export interface IPlaceUpdateRequest {
  name?: string;
  color?: string;
}

// Table Types
export interface ITableCreateRequest {
  placeId?: string;
  name: string;
  capacity?: number;
}

export interface ITableUpdateRequest {
  placeId?: string;
  name?: string;
  capacity?: number;
  status?: 'empty' | 'seated' | 'ordered';
}

// API Response Types
export interface IApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    totalPages?: number;
  };
}

export interface IApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Pagination
export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filters
export interface IMenuFilters {
  categoryId?: string;
  available?: boolean;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface ITableFilters {
  placeId?: string;
  status?: 'empty' | 'seated' | 'ordered';
  minCapacity?: number;
}