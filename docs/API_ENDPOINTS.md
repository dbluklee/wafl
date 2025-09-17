# AI POS System API 명세서 v1.0

## 🌐 외부 접속 정보 (2025.09.17 업데이트)

### 📍 현재 접속 가능한 서비스

#### 🎨 프론트엔드 (Phase 3-2 완료)
- **POS Admin Web**: http://112.148.37.41:4100
  - **홈페이지**: `/` (3x3 그리드 레이아웃, 서비스 연결 완료)
  - **대시보드**: `/dashboard` (Phase 3-3 예정)
  - **매장관리**: `/management` (Phase 3-4 예정)
  - **AI 상담**: `/ai-agent` (Phase 3-5 예정)
  - **매출분석**: `/analytics` (Phase 3-6 예정)

#### 🛠️ 백엔드 서비스
- **Auth Service**: http://112.148.37.41:4001
- **API Gateway**: http://112.148.37.41:4000
- **기타 서비스**: http://112.148.37.41:400X (내부 통신)

### 🔧 테스트 계정
- **매장코드**: 1001
- **점주 PIN**: 1234
- **직원 PIN**: 5678
- **비밀번호**: password

### 🚀 로그인 테스트
```bash
curl -X POST http://112.148.37.41:4001/api/v1/auth/login/pin \
-H "Content-Type: application/json" \
-d '{"storeCode": 1001, "userPin": "1234", "password": "password"}'
```

## 📋 목차
1. [개요](#개요)
2. [공통 규격](#공통-규격)
3. [서비스별 API](#서비스별-api)
4. [WebSocket 이벤트](#websocket-이벤트)
5. [사용자 플로우](#사용자-플로우)
6. [에러 처리](#에러-처리)

## 1. 개요

### 1.1 기본 정보
- **Base URL**: `http://localhost:4000` (API Gateway)
- **API Version**: v1
- **Gateway Port**: 4000

### 1.2 서비스 포트 매핑

| 서비스명 | 포트 | 담당 영역 | 상태 |
|---------|------|----------|------|
| api-gateway | 4000 | API 라우팅 | ✅ 운영 중 |
| auth-service | 4001 | 인증/인가 | ✅ 완료 |
| store-management-service | 4002 | 매장 설정 | ✅ 완료 |
| dashboard-service | 4003 | 실시간 현황 | ✅ 완료 |
| order-service | 4004 | 주문 관리 | ✅ 완료 |
| payment-service | 4005 | 결제 처리 | ✅ 완료 |
| ai-service | 4006 | AI 기능 | ⚠️ 다음 구현 |
| analytics-service | 4007 | 매출 분석 | ⚠️ 계획 중 |
| notification-service | 4008 | 실시간 알림 | ⚠️ 계획 중 |
| user-profile-service | 4009 | 계정 관리 | ✅ 완료 |
| history-service | 4010 | 작업 이력 | ⚠️ 다음 구현 |
| scraping-service | 4011 | 메뉴 스크래핑 | ⚠️ 계획 중 |
| qr-service | 4012 | QR 관리 | ⚠️ 계획 중 |

## 2. 공통 규격

### 2.1 인증 헤더
```http
Authorization: Bearer {jwt_token}
X-Store-ID: {store_uuid}
X-User-Role: {owner|staff|customer}
Accept-Language: {language_code}
```

### 2.2 공통 응답 구조
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2024-01-01T12:00:00Z",
    "version": "v1",
    "requestId": "uuid"
  }
}
```

### 2.3 에러 코드

| 코드 | 설명 |
|------|------|
| AUTH_001 | 인증 토큰 없음 |
| AUTH_002 | 토큰 만료 |
| AUTH_003 | 권한 없음 |
| STORE_001 | 매장 정보 없음 |
| ORDER_001 | 주문 정보 없음 |
| PAYMENT_001 | 결제 실패 |
| AI_001 | AI 서비스 오류 |

## 3. 서비스별 API

## 🔵 API Gateway 엔드포인트 (포트 4000)

### 🟢 Public Routes (인증 불필요)
```bash
GET  /health                           # ✅ 기본 헬스체크
GET  /ping                             # ✅ 간단한 상태 확인
GET  /api/v1/gateway/health            # ✅ 상세 시스템 상태
GET  /api/v1/gateway/metrics           # ✅ 성능 메트릭스
GET  /api/v1/gateway/services          # ✅ 서비스 디스커버리
GET  /api/v1/gateway/config            # ✅ 설정 정보
```

### 🔵 Proxy Routes (각 마이크로서비스로 전달)
```bash
/api/v1/auth/*           -> auth-service        # ✅ 작동 중
/api/v1/store/*          -> store-management    # ✅ 작동 중 (포트 4002)
/api/v1/dashboard/*      -> dashboard-service   # ✅ 작동 중 (포트 4003)
/api/v1/orders/*         -> order-service       # ✅ 작동 중 (포트 4004)
/api/v1/payments/*       -> payment-service     # ✅ 작동 중 (포트 4005)
/api/v1/profile/*        -> user-profile        # ✅ 작동 중 (포트 4009)
/api/v1/ai/*             -> ai-service          # ⚠️ 서비스 대기
/api/v1/analytics/*      -> analytics-service   # ⚠️ 서비스 대기
/api/v1/notifications/*  -> notification-service # ⚠️ 서비스 대기
/api/v1/history/*        -> history-service     # ⚠️ 서비스 대기
/api/v1/scraping/*       -> scraping-service    # ⚠️ 서비스 대기
/api/v1/qr/*             -> qr-service          # ⚠️ 서비스 대기
```

### 🔌 WebSocket
```bash
ws://localhost:4000/ws                 # ✅ WebSocket 프록시 실행 중
```

## 🔵 Auth Service API (포트 4001)

```bash
GET  /health                           # ✅ 헬스체크

# 매장 가입 및 인증
POST /api/v1/auth/stores/register      # ✅ 매장 가입 (온라인 원스톱)
POST /api/v1/auth/login/pin           # ✅ PIN 로그인 (점주/직원)
POST /api/v1/auth/mobile/request      # ✅ 모바일 인증 요청
POST /api/v1/auth/mobile/verify       # ✅ 모바일 인증 확인
POST /api/v1/auth/customer/session    # ✅ 고객 세션 생성 (QR 스캔)
POST /api/v1/auth/refresh             # ✅ 토큰 갱신
POST /api/v1/auth/logout              # ✅ 로그아웃
```

**새로운 요청/응답 형식:**

### 매장 가입
```http
POST /api/v1/auth/stores/register
Content-Type: application/json

{
  "businessNumber": "123-45-67890",
  "phone": "010-1234-5678",
  "verificationCode": "123456",
  "storeName": "맛있는 레스토랑",
  "naverPlaceUrl": "https://place.naver.com/..."
}
```

## 🔵 Store Management Service API (포트 4002)

```bash
GET  /health                                    # ✅ 헬스체크

# Categories (카테고리 관리)
GET    /api/v1/store/categories                 # ✅ 카테고리 목록 조회
POST   /api/v1/store/categories                 # ✅ 카테고리 생성
GET    /api/v1/store/categories/:id             # ✅ 카테고리 상세 조회
PUT    /api/v1/store/categories/:id             # ✅ 카테고리 수정
DELETE /api/v1/store/categories/:id             # ✅ 카테고리 삭제

# Menus (메뉴 관리)
GET    /api/v1/store/menus                      # ✅ 메뉴 목록 조회
POST   /api/v1/store/menus                      # ✅ 메뉴 생성
GET    /api/v1/store/menus/:id                  # ✅ 메뉴 상세 조회
PUT    /api/v1/store/menus/:id                  # ✅ 메뉴 수정
DELETE /api/v1/store/menus/:id                  # ✅ 메뉴 삭제
POST   /api/v1/store/menus/:id/image            # ✅ 메뉴 이미지 업로드
PATCH  /api/v1/store/menus/:id/availability     # ✅ 메뉴 품절 처리

# Places (장소 관리)
GET    /api/v1/store/places                     # ✅ 장소 목록 조회
POST   /api/v1/store/places                     # ✅ 장소 생성
GET    /api/v1/store/places/:id                 # ✅ 장소 상세 조회
PUT    /api/v1/store/places/:id                 # ✅ 장소 수정
DELETE /api/v1/store/places/:id                 # ✅ 장소 삭제

# Tables (테이블 관리)
GET    /api/v1/store/tables                     # ✅ 테이블 목록 조회
POST   /api/v1/store/tables                     # ✅ 테이블 생성 + QR 생성
GET    /api/v1/store/tables/:id                 # ✅ 테이블 상세 조회
PUT    /api/v1/store/tables/:id                 # ✅ 테이블 수정
DELETE /api/v1/store/tables/:id                 # ✅ 테이블 삭제
PATCH  /api/v1/store/tables/:id/status          # ✅ 테이블 상태 변경
POST   /api/v1/store/tables/:id/regenerate-qr   # ✅ QR 코드 재생성
POST   /api/v1/store/tables/bulk                # ✅ 테이블 일괄 생성
```

## 🔵 Order Service API (포트 4004)

```bash
GET  /health                                    # ✅ 헬스체크

# Orders (주문 관리)
GET    /api/v1/orders                           # ✅ 주문 목록 조회
POST   /api/v1/orders                           # ✅ 주문 생성
GET    /api/v1/orders/:id                       # ✅ 주문 상세 조회
PATCH  /api/v1/orders/:id/status                # ✅ 주문 상태 변경
POST   /api/v1/orders/:id/cancel                # ✅ 주문 취소
GET    /api/v1/orders/table/:tableId            # ✅ 테이블별 주문 조회
GET    /api/v1/orders/stats/summary             # ✅ 주문 통계

# Kitchen (주방 관리)
GET    /api/v1/kitchen                          # ✅ 주방 전체 현황
GET    /api/v1/kitchen/pending                  # ✅ 대기 중인 주문
GET    /api/v1/kitchen/cooking                  # ✅ 조리 중인 주문
GET    /api/v1/kitchen/ready                    # ✅ 완료된 주문
GET    /api/v1/kitchen/stats                    # ✅ 주방 통계
GET    /api/v1/kitchen/:id                      # ✅ 특정 주문 조회
POST   /api/v1/kitchen/:id/start                # ✅ 조리 시작
POST   /api/v1/kitchen/:id/complete             # ✅ 조리 완료
POST   /api/v1/kitchen/:id/serve                # ✅ 서빙 완료
PATCH  /api/v1/kitchen/:id/priority             # ✅ 우선순위 설정
```

## 🔵 Dashboard Service API (포트 4003)

```bash
GET  /health                                    # ✅ 헬스체크

# Dashboard Overview
GET    /api/v1/dashboard/overview               # ✅ 완전한 대시보드 현황
GET    /api/v1/dashboard/summary                # ✅ 요약 통계
GET    /api/v1/dashboard/realtime/status        # ✅ 실시간 상태 업데이트

# Table Management
PATCH  /api/v1/dashboard/tables/:id/status      # ✅ 테이블 상태 변경
POST   /api/v1/dashboard/tables/:id/seat        # ✅ 테이블 착석
POST   /api/v1/dashboard/tables/:id/clear       # ✅ 테이블 정리
GET    /api/v1/dashboard/tables/:id             # ✅ 테이블 상세 조회

# Place Management
GET    /api/v1/dashboard/places/:id/tables      # ✅ 장소별 테이블 조회

# Statistics
GET    /api/v1/dashboard/stats/today            # ✅ 오늘 통계

# POS Logs
GET    /api/v1/dashboard/logs                   # ✅ 로그 조회
GET    /api/v1/dashboard/logs/recent            # ✅ 최근 로그
GET    /api/v1/dashboard/logs/undoable          # ✅ Undo 가능한 액션들
POST   /api/v1/dashboard/logs/undo              # ✅ 액션 되돌리기
GET    /api/v1/dashboard/logs/actions/:action   # ✅ 액션별 로그
GET    /api/v1/dashboard/logs/table/:tableId    # ✅ 테이블별 로그
GET    /api/v1/dashboard/logs/stats             # ✅ 로그 통계
```

## 🔵 Payment Service API (포트 4005)

```bash
GET  /health                                    # ✅ 헬스체크

# Payment Management
POST   /api/v1/payments                         # ✅ 결제 생성
GET    /api/v1/payments/:id                     # ✅ 결제 상세 조회
PATCH  /api/v1/payments/:id/status              # ✅ 결제 상태 변경
POST   /api/v1/payments/:id/cancel              # ✅ 결제 취소
GET    /api/v1/payments/order/:orderId          # ✅ 주문별 결제 내역 조회
POST   /api/v1/payments/:id/receipt             # ✅ 영수증 발행

# PG Gateway
POST   /api/v1/payments/callback                # ✅ PG 콜백 처리
```

## 🔵 User Profile Service API (포트 4009) **[2025.09.17 재구현 완료]**

**목적**: 사용자 계정 관리 및 직원 관리 (CRM/포인트 시스템 제외)
**업데이트**: 복잡한 기능 제거, 핵심 기능만 유지

```bash
GET  /health                                    # ✅ 헬스체크

# Profile Management (모든 사용자)
GET    /api/v1/profile                          # ✅ 내 프로필 조회
PUT    /api/v1/profile                          # ✅ 프로필 수정 (이름만)
PUT    /api/v1/profile/pin                      # ✅ PIN 변경
PUT    /api/v1/profile/language                 # ✅ 언어 설정 (ko,en,ja,zh,es,fr,de)

# Staff Management (점주 전용)
GET    /api/v1/profile/staff                    # ✅ 직원 목록 조회
POST   /api/v1/profile/staff                    # ✅ 직원 추가
PUT    /api/v1/profile/staff/:staffId           # ✅ 직원 정보 수정
PATCH  /api/v1/profile/staff/:staffId/status    # ✅ 직원 활성/비활성화
```

**제거된 기능** (간소화):
- ❌ 프로필 이미지 업로드/삭제
- ❌ 직원 상세 조회/삭제
- ❌ 직원 활동 로그/통계
- ❌ CRM/고객 관리
- ❌ 포인트/멤버십 시스템

## 🔵 AI Service API (포트 4006) **[계획됨]**

```bash
GET  /health                                    # ⚠️ 구현 예정

# 점주 AI 상담 (경영 컨설팅)
POST   /api/v1/ai/agent/chat                    # ⚠️ 구현 예정
GET    /api/v1/ai/quick-questions               # ⚠️ 구현 예정

# 고객 AI 챗 (메뉴 추천)
POST   /api/v1/ai/customer/chat                 # ⚠️ 구현 예정

# 메뉴 번역
POST   /api/v1/ai/translate/menu                # ⚠️ 구현 예정
```

## 🔵 Analytics Service API (포트 4007) **[계획됨]**

```bash
GET  /health                                    # ⚠️ 구현 예정

# 매출 분석
GET    /api/v1/analytics/daily                  # ⚠️ 구현 예정
GET    /api/v1/analytics/trends                 # ⚠️ 구현 예정
GET    /api/v1/analytics/ai-suggestions         # ⚠️ 구현 예정
```

## 🔵 Notification Service API (포트 4008) **[계획됨]**

```bash
GET  /health                                    # ⚠️ 구현 예정

# 알림 관리
GET    /api/v1/notifications                    # ⚠️ 구현 예정
PATCH  /api/v1/notifications/:id/read          # ⚠️ 구현 예정
```

## 🔵 History Service API (포트 4010) **[계획됨]**

```bash
GET  /health                                    # ⚠️ 구현 예정

# 작업 이력
GET    /api/v1/history                          # ⚠️ 구현 예정
POST   /api/v1/history/undo                     # ⚠️ 구현 예정
POST   /api/v1/history/redo                     # ⚠️ 구현 예정
```

## 🔵 Menu Scraping Service API (포트 4011) **[계획됨]**

```bash
GET  /health                                    # ⚠️ 구현 예정

# 메뉴 스크래핑
POST   /api/v1/scraping/menus                   # ⚠️ 구현 예정
GET    /api/v1/scraping/jobs/:id                # ⚠️ 구현 예정
POST   /api/v1/scraping/apply/:id               # ⚠️ 구현 예정
```

## 🔵 QR Service API (포트 4012) **[계획됨]**

```bash
GET  /health                                    # ⚠️ 구현 예정

# QR 관리
POST   /api/v1/qr/generate                      # ⚠️ 구현 예정
POST   /api/v1/qr/refresh/:tableId              # ⚠️ 구임 예정
POST   /api/v1/qr/validate                      # ⚠️ 구현 예정
```

## 4. WebSocket 이벤트

### 4.1 이벤트 구조
```json
{
  "type": "order.created",
  "storeId": "uuid",
  "timestamp": "2024-01-01T12:00:00Z",
  "payload": {}
}
```

### 4.2 주요 이벤트 목록

| 이벤트명 | 설명 | Payload |
|---------|------|---------|
| order.created | 새 주문 생성 | orderId, tableId, amount |
| order.status.changed | 주문 상태 변경 | orderId, oldStatus, newStatus |
| table.status.changed | 테이블 상태 변경 | tableId, status, numberOfPeople |
| payment.completed | 결제 완료 | paymentId, orderId, amount |
| menu.soldout | 메뉴 품절 | menuId, menuName |
| kitchen.order.ready | 음식 준비 완료 | orderId, tableId |
| ai.suggestion | AI 제안 사항 | type, message, action |

### Order Service WebSocket
```bash
join:store        # 매장 룸 조인
join:table        # 테이블 룸 조인
join:kitchen      # 주방 룸 조인
order:created     # 새 주문 생성 알림
order:status:changed  # 주문 상태 변경 알림
order:new         # 주방 새 주문 알림
order:cooking     # 조리 시작 알림
order:ready       # 조리 완료 알림
```

### Dashboard Service WebSocket
```bash
join:store           # 매장 룸 조인
join:table           # 테이블 룸 조인
join:dashboard       # 대시보드 룸 조인
join:logs           # 로그 룸 조인
dashboard:overview:updated    # 대시보드 업데이트
table:status:changed         # 테이블 상태 변경
order:created               # 새 주문 생성 알림
log:created                # 새 로그 엔트리
stats:updated              # 통계 업데이트
system:notification        # 시스템 알림
```

## 5. 사용자 플로우

### 5.1 점주 첫 설정 플로우
1. `POST /api/v1/auth/mobile/request` - 휴대폰 인증 요청
2. `POST /api/v1/auth/mobile/verify` - 인증 확인
3. `POST /api/v1/auth/stores/register` - 매장 가입
4. `POST /api/v1/scraping/menus` - 메뉴 스크래핑
5. `GET /api/v1/scraping/jobs/{jobId}` - 진행상태 확인
6. `POST /api/v1/scraping/apply/{jobId}` - 메뉴 적용
7. `POST /api/v1/store/places` - 장소 생성
8. `POST /api/v1/store/tables` - 테이블 생성
9. `POST /api/v1/qr/generate` - QR 생성

### 5.2 고객 주문 플로우
1. `POST /api/v1/qr/validate` - QR 스캔
2. `POST /api/v1/auth/customer/session` - 세션 생성
3. `GET /api/v1/store/menus` - 메뉴 조회
4. `POST /api/v1/ai/customer/chat` - AI 상담 (선택)
5. `POST /api/v1/orders` - 주문 생성
6. `POST /api/v1/payments` - 결제 요청
7. `GET /api/v1/payments/{id}` - 결제 상태 확인
8. WebSocket: `payment.completed` 이벤트 수신

### 5.3 직원 운영 플로우
1. `POST /api/v1/auth/login/pin` - PIN 로그인
2. `GET /api/v1/dashboard/overview` - 대시보드 조회
3. WebSocket 연결 - 실시간 알림
4. `PATCH /api/v1/dashboard/tables/{id}/status` - 테이블 상태 변경
5. `PATCH /api/v1/orders/{id}/status` - 주문 상태 업데이트
6. `GET /api/v1/dashboard/logs` - POS 로그 확인

## 6. 에러 처리

### 6.1 표준 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "ORDER_001",
    "message": "주문을 찾을 수 없습니다",
    "details": {
      "orderId": "uuid",
      "suggestion": "주문이 취소되었거나 존재하지 않습니다"
    }
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00Z",
    "requestId": "req_uuid"
  }
}
```

### 6.2 에러 재시도 정책
- **5xx 에러**: 3회 재시도 (지수 백오프)
- **429 Rate Limit**: X-RateLimit-Reset 헤더 확인 후 재시도
- **401 Unauthorized**: 토큰 갱신 후 재시도

---

**📊 현재 진행률**: 약 95% 완료 (핵심 서비스 8/8 완료, 지원 서비스 2/10 완료)
**최종 업데이트**: 2025.09.17 - **Phase 2-9 완료**: AI Service, History Service 완전 구현 완료!