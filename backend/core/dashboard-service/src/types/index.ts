import { Request } from 'express';

// Enums
export enum ETableStatus {
  EMPTY = 'empty',
  SEATED = 'seated',
  ORDERED = 'ordered'
}

export enum ELogAction {
  ORDER_CREATED = 'order_created',
  TABLE_STATUS_CHANGED = 'table_status_changed',
  PAYMENT_COMPLETED = 'payment_completed',
  TABLE_SEATED = 'table_seated',
  TABLE_CLEARED = 'table_cleared',
  ORDER_CANCELLED = 'order_cancelled',
  MENU_ADDED = 'menu_added',
  MENU_REMOVED = 'menu_removed'
}

// Base Interfaces
export interface IAuthenticatedRequest extends Request {
  user?: {
    id: string;
    storeId: string;
    role: string;
    name: string;
  };
  storeId?: string;
}

// Dashboard Overview Types
export interface ITableOverview {
  id: string;
  name: string;
  status: ETableStatus;
  numberOfPeople: number;
  currentOrderAmount: number;
  stayingTime: number; // minutes since last activity
  lastActivity: Date;
  placeId: string;
  placeName: string;
  qrCode?: string;
  activeOrderId?: string;
}

export interface IPlaceOverview {
  id: string;
  name: string;
  color: string;
  tables: ITableOverview[];
  totalTables: number;
  emptyTables: number;
  seatedTables: number;
  orderedTables: number;
}

export interface IDashboardSummary {
  totalTables: number;
  emptyTables: number;
  seatedTables: number;
  orderedTables: number;
  todayRevenue: number;
  todayOrders: number;
  avgOrderValue: number;
  peakHour: string;
  totalCustomers: number;
}

// POS Log Types
export interface IPOSLog {
  id: string;
  timestamp: Date;
  action: ELogAction;
  userId: string;
  userName: string;
  storeId: string;
  tableId?: string;
  tableName?: string;
  orderId?: string;
  orderNumber?: string;
  amount?: number;
  details: string;
  oldData?: any;
  newData?: any;
  isUndoable: boolean;
  undoAt?: Date;
}

export interface ICreateLogParams {
  action: ELogAction;
  userId: string;
  userName: string;
  storeId: string;
  tableId?: string;
  tableName?: string;
  orderId?: string;
  orderNumber?: string;
  amount?: number;
  details: string;
  oldData?: any;
  newData?: any;
  isUndoable?: boolean;
}

// Statistics Types
export interface ITodayStats {
  revenue: number;
  orders: number;
  avgOrderValue: number;
  totalCustomers: number;
  peakHour: string;
  peakHourRevenue: number;
  hourlySales: { [hour: string]: number };
  hourlyOrders: { [hour: string]: number };
  popularItems: Array<{
    menuId: string;
    menuName: string;
    quantity: number;
    revenue: number;
  }>;
  tableUtilization: {
    totalTables: number;
    avgOccupancyTime: number; // minutes
    turnoverRate: number;
  };
}

// Request/Response Types
export interface IUpdateTableStatusRequest {
  status: ETableStatus;
  numberOfPeople?: number;
  notes?: string;
}

export interface IUndoActionRequest {
  logId: string;
}

// WebSocket Event Types
export interface ISocketEvents {
  // Room management
  'join:store': (storeId: string) => void;
  'join:table': (tableId: string) => void;
  'leave:store': (storeId: string) => void;
  'leave:table': (tableId: string) => void;

  // Dashboard updates
  'dashboard:overview:updated': (data: {
    places: IPlaceOverview[];
    summary: IDashboardSummary;
  }) => void;

  // Table events
  'table:status:changed': (data: {
    tableId: string;
    oldStatus: ETableStatus;
    newStatus: ETableStatus;
    table: ITableOverview;
  }) => void;

  // Order events
  'order:created': (data: {
    orderId: string;
    tableId: string;
    amount: number;
    orderNumber: string;
  }) => void;

  'order:updated': (data: {
    orderId: string;
    tableId: string;
    status: string;
    amount: number;
  }) => void;

  // Log events
  'log:created': (data: IPOSLog) => void;

  // Stats updates
  'stats:updated': (data: ITodayStats) => void;
}

// Cache Types
export interface ICacheItem<T> {
  data: T;
  expiresAt: number;
}

export interface ICacheManager {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, ttlSeconds?: number): void;
  delete(key: string): void;
  clear(pattern?: string): void;
  has(key: string): boolean;
}

// Error Types
export interface IApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;
}

// Service Response Types
export interface IServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Export commonly used types from Prisma
export type {
  stores,
  users,
  places,
  tables,
  orders,
  order_items,
  menus,
  history_logs,
  table_status,
  order_status,
  user_role
} from '@wafl/shared/types';