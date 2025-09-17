// ============================================
// API 응답 타입
// ============================================

export interface IApiResponse<T> {
  success: true;
  data: T;
  meta?: {
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

export type TApiResult<T> = IApiResponse<T> | IApiError;

// ============================================
// 페이지네이션 타입
// ============================================

export interface IPaginationParams {
  limit: number;
  offset: number;
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface IPaginatedResponse<T> {
  items: T[];
  meta: IPaginationMeta;
}

// ============================================
// 히스토리 관련 타입
// ============================================

export interface IHistoryEntry {
  id: string;
  userId: string;
  storeId: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  metadata?: IHistoryMetadata;
  isUndoable: boolean;
  undoDeadline?: Date;
  undoneAt?: Date;
  createdAt: Date;
  user?: IHistoryUser;
}

export interface IHistoryMetadata {
  ip?: string;
  userAgent?: string;
  reason?: string;
  sessionId?: string;
  source?: string;
  changedFields?: string[];
}

export interface IHistoryUser {
  id: string;
  name: string;
  role: 'owner' | 'staff';
}

export interface IHistoryCreateRequest {
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  metadata?: IHistoryMetadata;
  isUndoable?: boolean;
  undoDeadlineMinutes?: number;
}

export interface IHistoryQueryParams extends IPaginationParams {
  entityType?: string;
  entityId?: string;
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================
// Undo/Redo 관련 타입
// ============================================

export interface IUndoRequest {
  actionId: string;
  reason?: string;
}

export interface IRedoRequest {
  undoActionId: string;
}

export interface IUndoResponse {
  message: string;
  restoredEntity: {
    type: string;
    id: string;
    name?: string;
    restoredData: Record<string, any>;
  };
  undoActionId: string;
  canRedo: boolean;
  redoDeadline?: Date;
}

export interface IRedoResponse {
  message: string;
  reappliedData: Record<string, any>;
}

export interface IUndoStack {
  id: string;
  historyLogId: string;
  userId: string;
  redoneAt?: Date;
  createdAt: Date;
}

// ============================================
// 사용자 활동 관련 타입
// ============================================

export interface IUserActivitySummary {
  totalActions: number;
  loginSessions: number;
  avgSessionTime: number;
  mostActiveHours: string[];
}

export interface IUserActivityEntry {
  time: string;
  action: string;
  details: string;
  amount?: number;
}

export interface IUserActivityDay {
  date: string;
  actions: IUserActivityEntry[];
}

export interface IUserActivityPatterns {
  preferredActions: string[];
  errorRate: number;
  efficiency: 'low' | 'medium' | 'high';
}

export interface IUserActivityResponse {
  user: IHistoryUser;
  summary: IUserActivitySummary;
  activities: IUserActivityDay[];
  patterns: IUserActivityPatterns;
}

// ============================================
// 시스템 이벤트 관련 타입
// ============================================

export interface ISystemEvent {
  id: string;
  level: 'info' | 'warn' | 'error' | 'critical';
  service: string;
  event: string;
  message: string;
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

// ============================================
// 백업 관련 타입
// ============================================

export interface IBackupRecord {
  id: string;
  type: 'automatic' | 'manual' | 'point_in_time';
  scope: 'full' | 'incremental' | 'differential';
  size: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  checksum: string;
  retentionUntil: Date;
  metadata?: {
    triggerEvent?: string;
    dataTypes: string[];
    compression: boolean;
  };
}

// ============================================
// 감사 리포트 관련 타입
// ============================================

export interface IAuditReportRequest {
  reportType: 'user_activity' | 'system_events' | 'data_changes' | 'security_events';
  period: {
    start: string;
    end: string;
  };
  filters?: {
    userRole?: 'owner' | 'staff';
    includeSystemEvents?: boolean;
    entityTypes?: string[];
    actions?: string[];
  };
  format: 'pdf' | 'excel' | 'csv' | 'json';
}

export interface IAuditReportResponse {
  reportId: string;
  status: 'generating' | 'completed' | 'failed';
  estimatedTime?: number;
  downloadUrl?: string;
  error?: string;
}

// ============================================
// 실시간 이벤트 타입
// ============================================

export interface IRealtimeActivity {
  type: 'activity' | 'undo' | 'redo' | 'system_event';
  data: {
    userId?: string;
    userName?: string;
    action: string;
    entityName?: string;
    entityType?: string;
    timestamp: string;
    metadata?: any;
  };
}

// ============================================
// 헬스체크 타입
// ============================================

export interface IHealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  logProcessor: 'operational' | 'degraded' | 'down';
  storageUsage: string;
  lastBackup?: string;
  cacheStats: {
    hits: number;
    misses: number;
    hitRate: number;
    memoryUsage: string;
  };
  uptime: number;
}

// ============================================
// JWT 토큰 타입
// ============================================

export interface IJwtPayload {
  userId: string;
  storeId: string;
  role: 'owner' | 'staff';
  name?: string;
  iat: number;
  exp: number;
}

// ============================================
// 서비스 통신 타입
// ============================================

export interface IServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface IExternalServiceConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

// ============================================
// 에러 코드 타입
// ============================================

export enum EHistoryErrorCode {
  HISTORY_001 = 'HISTORY_001', // 이력 조회 실패
  HISTORY_002 = 'HISTORY_002', // Undo 불가능한 액션
  HISTORY_003 = 'HISTORY_003', // Undo 시간 만료
  HISTORY_004 = 'HISTORY_004', // 데이터 복원 실패
  HISTORY_005 = 'HISTORY_005', // 백업 생성 실패
  HISTORY_006 = 'HISTORY_006', // 감사 리포트 생성 실패
  HISTORY_007 = 'HISTORY_007', // 권한 없음
  HISTORY_008 = 'HISTORY_008', // 유효하지 않은 요청
  HISTORY_009 = 'HISTORY_009', // 서비스 연결 실패
  HISTORY_010 = 'HISTORY_010'  // 내부 서버 오류
}