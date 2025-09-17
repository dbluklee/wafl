// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth Types
export interface LoginRequest {
  storeCode: string;
  pin: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  store: Store;
}

export interface User {
  id: string;
  name: string;
  role: 'owner' | 'staff';
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

// Table Types
export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  placeId: string;
  place?: Place;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export enum TableStatus {
  Available = 'available',
  Occupied = 'occupied',
  Reserved = 'reserved',
  Cleaning = 'cleaning'
}

export interface Place {
  id: string;
  name: string;
  description?: string;
  floor: number;
  color: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

// Category & Menu Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  tableId: string;
  table?: Table;
  customerId?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  InProgress = 'in_progress',
  Ready = 'ready',
  Served = 'served',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  menuItemId: string;
  menuItem?: MenuItem;
  orderId: string;
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  orderId: string;
  order?: Order;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentMethod {
  Cash = 'cash',
  Card = 'card',
  Mobile = 'mobile'
}

export enum PaymentStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled'
}

// Dashboard Types
export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  occupiedTables: number;
  totalTables: number;
  kitchenQueue: number;
}

export interface POSLog {
  id: string;
  action: string;
  description: string;
  userId: string;
  user?: User;
  createdAt: string;
}

// AI Agent Types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AISession {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface QuickQuestion {
  id: string;
  question: string;
  category: string;
}

// Analytics Types
export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface MenuPerformance {
  menuItemId: string;
  name: string;
  sales: number;
  revenue: number;
}

export interface AISuggestion {
  id: string;
  type: 'revenue' | 'menu' | 'operation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  createdAt: string;
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface TableStatusEvent extends WebSocketEvent {
  type: 'table.status.changed';
  data: {
    tableId: string;
    oldStatus: TableStatus;
    newStatus: TableStatus;
  };
}

export interface OrderEvent extends WebSocketEvent {
  type: 'order.created' | 'order.updated' | 'order.completed';
  data: {
    order: Order;
  };
}

export interface PaymentEvent extends WebSocketEvent {
  type: 'payment.completed' | 'payment.failed';
  data: {
    payment: Payment;
  };
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TableProps {
  data: any[];
  columns: TableColumn[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
  roles?: ('owner' | 'staff')[];
}