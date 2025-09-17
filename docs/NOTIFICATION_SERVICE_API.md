# Notification Service API 명세서

**포트**: 4008
**상태**: ⚠️ 계획 중
**목적**: 실시간 알림, WebSocket 관리, 푸시 알림

## 개요

Notification Service는 WAFL 시스템의 실시간 알림을 담당하는 서비스입니다. WebSocket 연결 관리, 푸시 알림, 이메일/SMS 알림을 통합 관리합니다.

## 주요 기능

### 1. 실시간 알림
- WebSocket 기반 실시간 알림
- 사용자별 맞춤 알림
- 알림 우선순위 관리
- 알림 필터링

### 2. 다채널 알림
- 웹 푸시 알림
- 이메일 알림
- SMS 알림
- 앱 푸시 알림

### 3. 알림 관리
- 읽음/안읽음 상태 관리
- 알림 히스토리
- 알림 설정 관리

## API 엔드포인트

### 헬스체크
```http
GET /health
```

### 1. WebSocket 연결
```javascript
const ws = new WebSocket('ws://localhost:4008/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'subscribe',
    storeId: 'uuid',
    topics: ['orders', 'tables', 'payments']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data.type, data.payload);
};
```

### 2. 알림 목록 조회
```http
GET /api/v1/notifications?unread=true&limit=20
Authorization: Bearer {jwt_token}
```

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "order.new",
      "title": "새 주문",
      "message": "Table 5에서 새 주문이 들어왔습니다",
      "data": {
        "orderId": "uuid",
        "tableId": "uuid",
        "amount": 35000
      },
      "priority": "high",
      "isRead": false,
      "createdAt": "2024-01-01T12:30:00Z"
    }
  ],
  "meta": {
    "unreadCount": 5,
    "total": 23
  }
}
```

### 3. 알림 읽음 처리
```http
PATCH /api/v1/notifications/{notificationId}/read
Authorization: Bearer {jwt_token}
```

### 4. 알림 설정 관리
```http
PUT /api/v1/notifications/settings
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**요청 본문**:
```json
{
  "webPush": true,
  "email": false,
  "sms": true,
  "sound": true,
  "vibration": false,
  "topics": {
    "orders": true,
    "payments": true,
    "tables": false,
    "system": true
  }
}
```

---

**연관 서비스**: Dashboard Service, Order Service, Payment Service
**예상 구현 기간**: 2-3주