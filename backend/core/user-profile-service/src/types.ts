import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    storeId: string;
    role: string;
    name: string;
  };
}

export interface JWTPayload {
  id: string;
  storeId: string;
  role: string;
  name: string;
  iat?: number;
  exp?: number;
}