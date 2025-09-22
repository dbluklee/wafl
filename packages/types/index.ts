// WAFL AI POS System - Shared Types
// 모든 서비스에서 공통으로 사용하는 TypeScript 타입 정의

// Database types
export * from '../database/src';

// Re-export Prisma types
export type {
  Store,
  User,
  Category,
  Menu,
  Place,
  Table,
  Customer,
  Order,
  OrderItem,
  Payment,
  HistoryLog,
  AiConversation,
  AnalyticsDaily,
  SmsVerification,
  UserRole,
  SubscriptionStatus,
  TableStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  AiConversationType,
  Prisma
} from '@prisma/client';

// Base Types
export type TId = string;
export type TTimestamp = Date;

// User & Authentication
export interface IUser {
  id: TId;
  name: string;
  email?: string;
  phone?: string;
  role: EUserRole;
  storeId: TId;
  pin: string;
  isActive: boolean;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

export enum EUserRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  STAFF = 'staff',
  ADMIN = 'admin'
}

export interface IAuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ILoginRequest {
  storeCode: number;
  pin: string;
}

// Store Management
export interface IStore {
  id: TId;
  name: string;
  storeCode: number;
  businessNumber: string;
  phone: string;
  address: string;
  ownerId: TId;
  isActive: boolean;
  settings: IStoreSettings;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

export interface IStoreSettings {
  language: string;
  currency: string;
  timezone: string;
  theme: IThemeSettings;
  pos: IPosSettings;
}

export interface IThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkMode: boolean;
}

export interface IPosSettings {
  autoLogout: number;
  printReceipt: boolean;
  soundEnabled: boolean;
  orderTimeout: number;
}

// Menu & Categories
// Note: Category 타입들은 @wafl/store-info 패키지로 이동됨

// Note: Menu 타입들은 @wafl/store-info 패키지로 이동됨

export interface IMenuOption {
  id: TId;
  name: string;
  nameKo: string;
  price: number;
  isRequired: boolean;
  maxSelections: number;
  choices: IMenuChoice[];
}

export interface IMenuChoice {
  id: TId;
  name: string;
  nameKo: string;
  price: number;
}

// Tables & Places
export interface IPlace {
  id: TId;
  name: string;
  nameKo: string;
  color: string;
  floor: number;
  storeId: TId;
  isActive: boolean;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

export interface ITable {
  id: TId;
  number: string;
  seats: number;
  placeId: TId;
  storeId: TId;
  qrCode: string;
  status: ETableStatus;
  currentOrderId?: TId;
  isActive: boolean;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

export enum ETableStatus {
  EMPTY = 'empty',
  OCCUPIED = 'occupied',
  CLEANING = 'cleaning',
  RESERVED = 'reserved',
  OUT_OF_ORDER = 'out_of_order'
}

// Orders
export interface IOrder {
  id: TId;
  orderNumber: string;
  tableId?: TId;
  customerId?: TId;
  items: IOrderItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: EOrderStatus;
  type: EOrderType;
  notes?: string;
  storeId: TId;
  createdBy: TId;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

export interface IOrderItem {
  id: TId;
  menuId: TId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options: IOrderItemOption[];
  notes?: string;
}

export interface IOrderItemOption {
  optionId: TId;
  choiceIds: TId[];
  additionalPrice: number;
}

export enum EOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum EOrderType {
  DINE_IN = 'dine_in',
  TAKEOUT = 'takeout',
  DELIVERY = 'delivery'
}

// Payments
export interface IPayment {
  id: TId;
  orderId: TId;
  amount: number;
  method: EPaymentMethod;
  status: EPaymentStatus;
  transactionId?: string;
  pgResponse?: any;
  storeId: TId;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

export enum EPaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE = 'mobile',
  ACCOUNT_TRANSFER = 'account_transfer'
}

export enum EPaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Customers (for QR orders)
export interface ICustomer {
  id: TId;
  sessionId: string;
  tableId?: TId;
  language: string;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

// History & Logs
export interface IHistoryLog {
  id: TId;
  action: string;
  entity: string;
  entityId: TId;
  oldData?: any;
  newData?: any;
  userId: TId;
  storeId: TId;
  canUndo: boolean;
  createdAt: TTimestamp;
}

// AI & Analytics
export interface IAiConversation {
  id: TId;
  userId: TId;
  storeId: TId;
  messages: IAiMessage[];
  context: any;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

export interface IAiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: TTimestamp;
}

export interface IAnalyticsDaily {
  id: TId;
  date: string;
  storeId: TId;
  totalSales: number;
  orderCount: number;
  customerCount: number;
  averageOrderValue: number;
  popularMenus: IPopularMenu[];
  hourlyData: IHourlyData[];
  createdAt: TTimestamp;
}

export interface IPopularMenu {
  menuId: TId;
  menuName: string;
  quantity: number;
  revenue: number;
}

export interface IHourlyData {
  hour: number;
  sales: number;
  orders: number;
  customers: number;
}

// API Response Types
export interface IApiResponse<T = any> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    version: string;
    requestId: string;
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

export interface IPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: IPaginationMeta;
}

// WebSocket Events
export type TSocketEvent =
  | 'order.created'
  | 'order.status.changed'
  | 'table.status.changed'
  | 'payment.completed'
  | 'notification.sent'
  | 'user.login'
  | 'user.logout';

export interface ISocketEventData {
  event: TSocketEvent;
  data: any;
  storeId: TId;
  timestamp: TTimestamp;
}

// Common Utility Types
export type TPartial<T> = {
  [P in keyof T]?: T[P];
};

export type TRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type TOmit<T, K extends keyof T> = Omit<T, K>;

export type TPick<T, K extends keyof T> = Pick<T, K>;