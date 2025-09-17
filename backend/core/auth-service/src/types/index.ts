import { User, Store } from '@prisma/client';
import { Request } from 'express';

// JWT Payload
export interface IJwtPayload {
  userId: string;
  storeId: string;
  role: 'owner' | 'staff';
  iat?: number;
  exp?: number;
}

// Request with Auth
export interface IAuthRequest extends Request {
  user?: IJwtPayload;
  store?: Store;
}

// Login Types
export interface IPinLoginRequest {
  storeCode: string;
  userPin: string;
  password?: string;
}

export interface IMobileLoginRequest {
  phone: string;
  verificationCode: string;
}

// Register Types
export interface IStoreRegisterRequest {
  businessNumber: string;
  phone: string;
  verificationCode: string;
  storeName: string;
  naverPlaceUrl?: string;
  email?: string;
  address?: string;
}

// SMS Types
export interface ISmsVerificationRequest {
  phone: string;
}

// Customer Session
export interface ICustomerSessionRequest {
  qrCode: string;
  language?: string;
}

// API Responses
export interface IAuthResponse {
  success: true;
  data: {
    userId?: string;
    storeId?: string;
    role?: string;
    name?: string;
    storeCode?: number;
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
  };
}

export interface IVerificationResponse {
  success: true;
  data: {
    message: string;
    expiresIn: number;
  };
}

export interface ICustomerSessionResponse {
  success: true;
  data: {
    sessionId: string;
    customerId: string;
    tableId: string;
    tableName: string;
    storeId: string;
  };
}

// Error Response
export interface IErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Generic API Response
export type TApiResponse<T = any> = IAuthResponse | IVerificationResponse | ICustomerSessionResponse | IErrorResponse | {
  success: true;
  data: T;
};

// Session Data
export interface ISessionData {
  userId?: string;
  storeId?: string;
  role?: string;
  name?: string;
  customerId?: string;
  tableId?: string;
  language?: string;
}

// Business Verification
export interface IBusinessVerification {
  valid: boolean;
  businessName?: string;
}