import { Table, Store, Prisma } from '@shared/database';
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
export interface CategoryCreateRequest {
  name: string;
  color: string;
  sortOrder: number;
}

export interface CategoryUpdateRequest {
  name?: string;
  color?: string;
  sortOrder?: number;
}

// Menu Types
export interface MenuCreateRequest {
  categoryId: string;
  name: string;
  price: number;
  description?: string;
}

export interface MenuUpdateRequest {
  categoryId?: string;
  name?: string;
  price?: number;
  description?: string;
}

// Place Types
export interface PlaceCreateRequest {
  name: string;
  color: string;
}

export interface PlaceUpdateRequest {
  name?: string;
  color?: string;
}

// Table Types
export interface TableCreateRequest {
  placeId: string;
  name: string;
  diningCapacity: number;
  color?: string;
}

export interface TableUpdateRequest {
  placeId?: string;
  name?: string;
  diningCapacity?: number;
  color?: string;
}

// Legacy aliases for backward compatibility
export interface ITableCreateRequest extends TableCreateRequest {}
export interface ITableUpdateRequest extends TableUpdateRequest {}

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