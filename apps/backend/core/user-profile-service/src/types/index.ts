import { Request } from 'express';

// 공유 타입들을 직접 정의 (shared 모듈 의존성 제거)

// User Profile Service 전용 타입
export interface IAuthUser {
  id: string;
  storeId: string;
  phone: string;
  name: string;
  role: 'owner' | 'staff';
  userPin: string;
  isMobileVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  exp: number;
  iat: number;
}

export interface AuthRequest extends Request {
  user?: IAuthUser;
}

// 프로필 관련 타입
export interface IUserProfile {
  userId: string;
  storeId: string;
  name: string;
  phone: string;
  role: 'owner' | 'staff';
  userPin: string;
  email?: string;
  profileImage?: string;
  language: string;
  timezone: string;
  settings: IUserSettings;
  stats: IUserStats;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSettings {
  notifications: boolean;
  soundAlert: boolean;
  autoLogout: number; // minutes
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
}

export interface IUserStats {
  lastLogin: Date;
  totalOrders: number;
  totalSales: number;
  loginCount: number;
}

// 직원 관리 타입
export interface IStaffCreateRequest {
  name: string;
  phone: string;
  userPin: string;
  email?: string;
  role: 'staff';
}

export interface IStaffUpdateRequest {
  name?: string;
  phone?: string;
  email?: string;
  userPin?: string;
  isActive?: boolean;
}

export interface IStaffActivityLog {
  id: string;
  staffId: string;
  storeId: string;
  action: 'login' | 'logout' | 'order_create' | 'order_cancel' | 'payment_process' | 'menu_update' | 'table_status_change';
  details: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// 고객 관리 타입
export interface ICustomerProfile {
  customerId: string;
  storeId: string;
  name?: string;
  phone?: string;
  email?: string;
  birthday?: Date;
  membershipLevel: 'bronze' | 'silver' | 'gold' | 'vip';
  points: number;
  totalSpent: number;
  firstVisit: Date;
  lastVisit: Date;
  visitCount: number;
  averageSpending: number;
  favoriteMenus: string[];
  dietaryRestrictions: string[];
  preferredLanguage: string;
  notes: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerCreateRequest {
  name?: string;
  phone?: string;
  email?: string;
  birthday?: Date;
  notes?: string;
  tags?: string[];
}

export interface ICustomerUpdateRequest {
  name?: string;
  phone?: string;
  email?: string;
  birthday?: Date;
  notes?: string;
  tags?: string[];
  preferredLanguage?: string;
  dietaryRestrictions?: string[];
}

export interface ICustomerVisit {
  id: string;
  customerId: string;
  storeId: string;
  visitDate: Date;
  tableId?: string;
  orderCount: number;
  totalSpent: number;
  duration?: number; // minutes
  notes?: string;
}

// 포인트 시스템 타입
export interface IPointTransaction {
  id: string;
  customerId: string;
  storeId: string;
  type: 'earn' | 'use' | 'expire' | 'adjust';
  amount: number;
  balance: number;
  orderId?: string;
  description: string;
  expiryDate?: Date;
  createdAt: Date;
}

export interface IPointEarnRequest {
  customerId: string;
  orderId: string;
  orderAmount: number;
  description?: string;
}

export interface IPointUseRequest {
  customerId: string;
  amount: number;
  orderId?: string;
  description: string;
}

export interface IMembershipLevel {
  level: 'bronze' | 'silver' | 'gold' | 'vip';
  minSpent: number;
  earnRate: number;
  benefits: string[];
}

// 고객 분석 타입
export interface ICustomerAnalytics {
  customerId: string;
  period: string;
  totalVisits: number;
  totalSpent: number;
  averageSpending: number;
  favoriteMenus: { menuId: string; menuName: string; orderCount: number }[];
  visitPattern: { hour: number; visitCount: number }[];
  tags: string[];
  riskLevel: 'low' | 'medium' | 'high'; // 이탈 위험도
  lastVisitDays: number;
}

// API 응답 타입
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 에러 타입
export class UserProfileServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'UserProfileServiceError';
  }
}

// 설정 업데이트 타입
export interface IProfileUpdateRequest {
  name?: string;
  email?: string;
  profileImage?: string;
  settings?: Partial<IUserSettings>;
}

export interface IPasswordChangeRequest {
  currentPin: string;
  newPin: string;
}

// 검색 및 필터링 타입
export interface ICustomerFilters {
  search?: string;
  membershipLevel?: 'bronze' | 'silver' | 'gold' | 'vip';
  tags?: string[];
  minSpent?: number;
  maxSpent?: number;
  lastVisitFrom?: Date;
  lastVisitTo?: Date;
  isActive?: boolean;
}

export interface IStaffFilters {
  search?: string;
  role?: 'owner' | 'staff';
  isActive?: boolean;
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 캐시 키 타입
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user_profile:${userId}`,
  CUSTOMER_PROFILE: (customerId: string) => `customer_profile:${customerId}`,
  CUSTOMER_LIST: (storeId: string, filters: string) => `customer_list:${storeId}:${filters}`,
  STAFF_LIST: (storeId: string) => `staff_list:${storeId}`,
  POINT_BALANCE: (customerId: string) => `point_balance:${customerId}`,
  MEMBERSHIP_LEVELS: 'membership_levels',
  CUSTOMER_ANALYTICS: (customerId: string) => `customer_analytics:${customerId}`,
} as const;

// 상수
export const MEMBERSHIP_LEVELS: Record<string, IMembershipLevel> = {
  BRONZE: { level: 'bronze', minSpent: 0, earnRate: 0.03, benefits: ['기본 포인트 적립'] },
  SILVER: { level: 'silver', minSpent: 500000, earnRate: 0.05, benefits: ['포인트 적립률 향상', '생일 쿠폰'] },
  GOLD: { level: 'gold', minSpent: 1000000, earnRate: 0.07, benefits: ['포인트 적립률 향상', '생일 쿠폰', '우선 예약'] },
  VIP: { level: 'vip', minSpent: 3000000, earnRate: 0.10, benefits: ['최고 포인트 적립률', '생일 쿠폰', '우선 예약', 'VIP 이벤트'] },
};

export const POINT_RULES = {
  EARN_RATE: 0.05,        // 기본 적립률 5%
  MIN_AMOUNT: 10000,      // 최소 적립 금액
  MAX_POINTS: 1000000,    // 최대 보유 포인트
  EXPIRY_DAYS: 365,       // 포인트 유효기간
  MIN_USE_AMOUNT: 1000,   // 최소 사용 포인트
};

// 파일 업로드 타입
export interface IFileUploadOptions {
  allowedTypes: string[];
  maxSize: number;
  destination: string;
}

export const UPLOAD_OPTIONS = {
  PROFILE_IMAGE: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    destination: 'uploads/profiles/',
  },
} as const;