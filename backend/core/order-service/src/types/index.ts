import { Order, OrderItem, Menu, Table, Customer, Prisma } from '@shared/database';
import { Request } from 'express';

// JWT Payload
export interface IJwtPayload {
  userId: string;
  storeId: string;
  role: 'owner' | 'staff';
}

// Request 확장
export interface IAuthRequest extends Request {
  user?: IJwtPayload;
}

// Extended Types
export interface IOrderWithItems extends Order {
  orderItems: (OrderItem & {
    menu: Menu;
  })[];
  table?: Table;
  customer?: Customer | null;
}

// Request Types
export interface ICreateOrderRequest {
  tableId: string;
  customerId?: string;
  items: IOrderItemRequest[];
  specialRequests?: string;
  customerLanguage?: string;
  aiInteraction?: boolean;
}

export interface IOrderItemRequest {
  menuId: string;
  quantity: number;
  options?: Record<string, any>;
  notes?: string;
}

export interface IUpdateOrderStatusRequest {
  status: 'pending' | 'confirmed' | 'cooking' | 'ready' | 'served' | 'cancelled';
  reason?: string;
}

// Kitchen Types
export interface IKitchenOrder {
  id: string;
  orderNumber: string;
  tableName: string;
  items: IKitchenOrderItem[];
  specialRequests?: string;
  status: string;
  createdAt: Date;
  estimatedTime: number;
  priority: number;
  startedAt?: Date;
  completedAt?: Date;
  elapsedTime?: number;
}

export interface IKitchenOrderItem {
  id: string;
  menuName: string;
  quantity: number;
  options?: Record<string, any>;
  notes?: string;
  prepTime: number;
}

// WebSocket Events
export interface IOrderEvent {
  type: 'order.created' | 'order.updated' | 'order.cancelled' | 'order.status.changed';
  storeId: string;
  orderId: string;
  tableId?: string;
  data: any;
  timestamp: Date;
}

// Response Types
export interface IOrderResponse {
  success: true;
  data: IOrderWithItems;
}

export interface IOrdersResponse {
  success: true;
  data: IOrderWithItems[];
  meta?: {
    total: number;
    page: number;
    totalPages: number;
  };
}

// Filters
export interface IOrderFilters {
  status?: string;
  tableId?: string;
  startDate?: Date;
  endDate?: Date;
  orderNumber?: string;
}

// Statistics
export interface IOrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  cookingOrders: number;
  readyOrders: number;
  averagePrepTime: number;
  totalRevenue: number;
}