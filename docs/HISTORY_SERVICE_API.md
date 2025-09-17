# History Service API 명세서

**포트**: 3010
**상태**: ⚠️ 다음 구현 대상 (최우선)
**목적**: 모든 서비스 로그 통합, 분석 리포트, 감사 추적, Undo/Redo 기능

## 개요

History Service는 WAFL 시스템의 모든 사용자 액션과 시스템 이벤트를 기록하고 관리하는 서비스입니다. 감사 추적, 작업 되돌리기, 활동 분석 기능을 제공합니다.

## 주요 기능

### 1. 활동 이력 관리
- 모든 사용자 액션 기록
- 시스템 이벤트 로깅
- 데이터 변경 추적
- 실시간 활동 모니터링

### 2. Undo/Redo 시스템
- 되돌리기 가능한 액션 식별
- 안전한 데이터 복원
- 연쇄 액션 처리
- 권한 기반 되돌리기

### 3. 감사 및 리포트
- 직원 활동 리포트
- 시스템 사용 패턴 분석
- 보안 이벤트 추적
- 규정 준수 리포트

### 4. 데이터 백업 및 복구
- 중요 데이터 변경점 저장
- 시점 복구 지원
- 데이터 무결성 검증

## API 엔드포인트

### 헬스체크
```http
GET /health
```

**응답**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "logProcessor": "operational",
    "storageUsage": "45%",
    "lastBackup": "2024-01-01T06:00:00Z"
  }
}
```

### 1. 작업 이력 조회

```http
GET /api/v1/history?entityType=menu&limit=20&offset=0
Authorization: Bearer {jwt_token}
```

**쿼리 파라미터**:
- `entityType`: menu, order, table, user, payment 등
- `entityId`: 특정 엔티티 ID
- `action`: create, update, delete, status_change 등
- `userId`: 특정 사용자 액션만
- `startDate`, `endDate`: 날짜 범위
- `limit`, `offset`: 페이지네이션

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "action": "update",
      "entityType": "menu",
      "entityId": "menu_uuid",
      "entityName": "김치찌개",
      "oldData": {
        "price": 8000,
        "isAvailable": true
      },
      "newData": {
        "price": 9000,
        "isAvailable": true
      },
      "changedFields": ["price"],
      "user": {
        "id": "user_uuid",
        "name": "김점주",
        "role": "owner"
      },
      "metadata": {
        "ip": "192.168.1.100",
        "userAgent": "POS-Terminal/1.0",
        "reason": "원가 상승"
      },
      "isUndoable": true,
      "undoDeadline": "2024-01-01T23:59:59Z",
      "createdAt": "2024-01-01T14:30:00Z"
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

### 2. 작업 되돌리기 (Undo)

```http
POST /api/v1/history/undo
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**요청 본문**:
```json
{
  "actionId": "uuid",
  "reason": "실수로 잘못 변경함"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "message": "메뉴 가격이 8,000원으로 복원되었습니다",
    "restoredEntity": {
      "type": "menu",
      "id": "menu_uuid",
      "name": "김치찌개",
      "restoredData": {
        "price": 8000
      }
    },
    "undoActionId": "undo_uuid",
    "canRedo": true,
    "redoDeadline": "2024-01-01T23:59:59Z"
  }
}
```

### 3. 작업 다시 실행 (Redo)

```http
POST /api/v1/history/redo
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**요청 본문**:
```json
{
  "undoActionId": "undo_uuid"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "message": "메뉴 가격 변경이 다시 적용되었습니다",
    "reappliedData": {
      "price": 9000
    }
  }
}
```

### 4. 사용자별 활동 이력

```http
GET /api/v1/history/users/{userId}/activities?period=7d
Authorization: Bearer {jwt_token}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_uuid",
      "name": "이직원",
      "role": "staff"
    },
    "summary": {
      "totalActions": 45,
      "loginSessions": 8,
      "avgSessionTime": 240,
      "mostActiveHours": ["14:00", "19:00"]
    },
    "activities": [
      {
        "date": "2024-01-01",
        "actions": [
          {
            "time": "14:30:00",
            "action": "order_created",
            "details": "Table 5 주문 생성",
            "amount": 25000
          }
        ]
      }
    ],
    "patterns": {
      "preferredActions": ["order_management", "table_status"],
      "errorRate": 2.1,
      "efficiency": "high"
    }
  }
}
```

### 5. 시스템 이벤트 로그

```http
GET /api/v1/history/system/events?level=error&limit=50
Authorization: Bearer {jwt_token}
```

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": "event_uuid",
      "level": "error",
      "service": "payment-service",
      "event": "payment_failed",
      "message": "PG 연동 오류로 결제 실패",
      "details": {
        "paymentId": "payment_uuid",
        "errorCode": "PG_CONNECTION_TIMEOUT",
        "orderId": "order_uuid"
      },
      "timestamp": "2024-01-01T15:45:00Z",
      "resolved": false
    }
  ]
}
```

### 6. 데이터 백업 이력

```http
GET /api/v1/history/backups?type=automatic
Authorization: Bearer {jwt_token}
```

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": "backup_uuid",
      "type": "automatic",
      "scope": "full",
      "size": "125MB",
      "status": "completed",
      "startTime": "2024-01-01T06:00:00Z",
      "endTime": "2024-01-01T06:15:00Z",
      "checksum": "sha256:abc123...",
      "retentionUntil": "2024-01-31T23:59:59Z"
    }
  ]
}
```

### 7. 감사 리포트 생성

```http
POST /api/v1/history/audit-report
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**요청 본문**:
```json
{
  "reportType": "user_activity",
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "filters": {
    "userRole": "staff",
    "includeSystemEvents": false
  },
  "format": "pdf"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "reportId": "report_uuid",
    "status": "generating",
    "estimatedTime": 120,
    "downloadUrl": null
  }
}
```

### 8. 실시간 활동 모니터링

```http
GET /api/v1/history/realtime/activities
Authorization: Bearer {jwt_token}
```

**WebSocket 연결을 통한 실시간 스트리밍**:
```json
{
  "type": "activity",
  "data": {
    "userId": "user_uuid",
    "userName": "김점주",
    "action": "menu_updated",
    "entityName": "불고기정식",
    "timestamp": "2024-01-01T16:30:00Z"
  }
}
```

## 데이터 모델

### History Entry
```typescript
interface HistoryEntry {
  id: string;
  storeId: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  changedFields: string[];
  userId: string;
  userRole: string;
  metadata: {
    ip?: string;
    userAgent?: string;
    reason?: string;
    sessionId?: string;
  };
  isUndoable: boolean;
  undoDeadline?: Date;
  undoActionId?: string;
  createdAt: Date;
}
```

### System Event
```typescript
interface SystemEvent {
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
```

### Backup Record
```typescript
interface BackupRecord {
  id: string;
  type: 'automatic' | 'manual' | 'point_in_time';
  scope: 'full' | 'incremental' | 'differential';
  size: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  checksum: string;
  retentionUntil: Date;
  metadata: {
    triggerEvent?: string;
    dataTypes: string[];
    compression: boolean;
  };
}
```

## 성능 요구사항

### 로그 처리
- 실시간 로그 처리: < 100ms
- 배치 로그 처리: 10,000건/초
- 검색 응답: < 2초
- Undo/Redo 처리: < 1초

### 저장소 관리
- 일일 로그 볼륨: ~1GB
- 압축률: 70%
- 보관 기간: 2년 (상세), 5년 (요약)
- 자동 아카이빙: 월 1회

### 가용성
- 로그 손실률: < 0.01%
- 백업 성공률: > 99.9%
- 복구 목표 시간: < 1시간

## 보안 및 규정 준수

### 데이터 보호
- 개인정보 암호화 저장
- 민감 데이터 마스킹
- 접근 로그 별도 보관
- GDPR 준수 (개인정보 삭제)

### 감사 요구사항
- 모든 데이터 변경 추적
- 관리자 액션 별도 로깅
- 무결성 검증 체크섬
- 위변조 방지 해시

## 에러 코드

| 코드 | 설명 |
|------|------|
| HISTORY_001 | 이력 조회 실패 |
| HISTORY_002 | Undo 불가능한 액션 |
| HISTORY_003 | Undo 시간 만료 |
| HISTORY_004 | 데이터 복원 실패 |
| HISTORY_005 | 백업 생성 실패 |
| HISTORY_006 | 감사 리포트 생성 실패 |

## 구현 계획

### Phase 1: 기본 이력 관리 (우선순위 1)
- 기본 CRUD 액션 로깅
- 이력 조회 API
- 간단한 Undo 기능

### Phase 2: 고급 기능
- 복잡한 Undo/Redo 체인
- 실시간 모니터링
- 사용자 활동 분석

### Phase 3: 감사 및 리포트
- 자동 백업 시스템
- 감사 리포트 생성
- 규정 준수 도구

## 연관 서비스

### 데이터 수집 대상
- **User Profile Service**: 직원 활동 로그
- **Order Service**: 주문 생성/변경 이력
- **Store Management**: 메뉴/테이블 변경 이력
- **Payment Service**: 결제 이력
- **Dashboard Service**: POS 작업 로그

### 데이터 제공 대상
- **Analytics Service**: 활동 패턴 분석
- **AI Service**: 사용자 행동 학습
- **Dashboard Service**: 실시간 활동 표시

---

**📌 구현 순서**: History Service → AI Service → Analytics Service
**예상 구현 기간**: 2-3주
**연동 우선순위**: User Profile Service와 최우선 연동 필요