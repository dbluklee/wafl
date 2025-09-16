import { Request } from 'express';

export interface IAuthenticatedRequest extends Request {
  user?: {
    userId: string;
    storeId: string;
    role: string;
    email?: string;
  };
}

export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface IPaymentRequest {
  orderId: string;
  method: TPaymentMethod;
  amount: number;
  cardNumber?: string;
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardCvv?: string;
  cardHolderName?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface IPaymentResponse {
  id: string;
  orderId: string;
  transactionId: string;
  method: TPaymentMethod;
  amount: number;
  status: TPaymentStatus;
  pgResponse?: IPGResponse;
  createdAt: Date;
  completedAt?: Date;
}

export interface IPGResponse {
  success: boolean;
  transactionId?: string;
  approvalNumber?: string;
  message?: string;
  errorCode?: string;
  rawResponse?: any;
}

export interface IRefundRequest {
  paymentId: string;
  amount?: number;
  reason: string;
  metadata?: Record<string, any>;
}

export interface IRefundResponse {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: TRefundStatus;
  processedAt?: Date;
}

export interface IReceiptRequest {
  paymentId: string;
  type: TReceiptType;
  recipient: string;
  additionalInfo?: Record<string, any>;
}

export interface IReceiptResponse {
  id: string;
  paymentId: string;
  type: TReceiptType;
  recipient: string;
  content: string;
  sentAt: Date;
}

export interface ISettlementSummary {
  date: string;
  totalAmount: number;
  totalCount: number;
  byMethod: Record<TPaymentMethod, {
    amount: number;
    count: number;
  }>;
  byStatus: Record<TPaymentStatus, {
    amount: number;
    count: number;
  }>;
  refunds: {
    totalAmount: number;
    totalCount: number;
  };
}

export interface ICardReaderInfo {
  id: string;
  name: string;
  status: TCardReaderStatus;
  lastSeen?: Date;
  serialNumber?: string;
  batteryLevel?: number;
}

export interface IOrderInfo {
  id: string;
  storeId: string;
  tableId?: string;
  customerId?: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  items: Array<{
    menuId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  createdAt: Date;
}

export type TPaymentMethod = 'card' | 'cash' | 'mobile';

export type TPaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type TRefundStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export type TReceiptType = 'email' | 'sms' | 'print';

export type TCardReaderStatus = 'online' | 'offline' | 'error' | 'pairing';

export interface IPaymentCacheData {
  payment: IPaymentResponse;
  cachedAt: number;
  ttl: number;
}

export interface IValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface IServiceError extends Error {
  statusCode: number;
  code: string;
  details?: any;
}

export class PaymentServiceError extends Error implements IServiceError {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_SERVER_ERROR', details?: any) {
    super(message);
    this.name = 'PaymentServiceError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export interface IHealthCheckResponse {
  status: 'UP' | 'DOWN';
  service: string;
  version?: string;
  timestamp: string;
  dependencies?: Record<string, {
    status: 'UP' | 'DOWN';
    latency?: number;
    error?: string;
  }>;
}

export interface ITransactionLog {
  id: string;
  paymentId: string;
  action: string;
  data: any;
  timestamp: Date;
  userId?: string;
}

export interface IMockPGRequest {
  merchantId: string;
  transactionId: string;
  amount: number;
  cardNumber: string;
  cardExpiryMonth: string;
  cardExpiryYear: string;
  cardCvv: string;
  cardHolderName?: string;
  description?: string;
}

export interface IMockPGResponse {
  success: boolean;
  transactionId: string;
  approvalNumber?: string;
  message: string;
  errorCode?: string;
  timestamp: Date;
}