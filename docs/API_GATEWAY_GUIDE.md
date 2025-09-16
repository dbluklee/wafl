# API Gateway Service - 상세 가이드 📚

## 📋 개요

**WAFL API Gateway**는 마이크로서비스 아키텍처의 중앙 허브로, 모든 클라이언트 요청을 적절한 백엔드 서비스로 라우팅하는 핵심 컴포넌트입니다.

- **포트**: 8080 (메인 엔트리 포인트)
- **위치**: `backend/support/api-gateway/`
- **상태**: ✅ 완전 구현 및 실행 중
- **완료일**: 2025.09.16

## 🏗️ 아키텍처

### 핵심 구성 요소

```
api-gateway/
├── src/
│   ├── app.ts                    # Express 애플리케이션 메인
│   ├── index.ts                  # 서버 엔트리 포인트
│   ├── config/
│   │   ├── index.ts             # 환경 설정
│   │   └── routes.ts            # 라우트 설정 (12개 서비스)
│   ├── types/index.ts           # TypeScript 타입 정의
│   ├── middlewares/
│   │   ├── auth/jwt.ts          # JWT 인증 미들웨어
│   │   ├── error/index.ts       # 에러 처리 미들웨어
│   │   ├── proxy/index.ts       # 프록시 라우팅
│   │   └── request/index.ts     # 요청 처리 미들웨어
│   ├── services/health.ts       # 헬스체크 서비스
│   ├── routes/gateway.ts        # Gateway 전용 라우트
│   └── websocket/index.ts       # WebSocket 프록시
├── package.json                 # 26개 의존성
├── tsconfig.json               # TypeScript 설정
├── Dockerfile                  # 컨테이너 빌드
└── .env                        # 환경 변수
```

## 🚀 주요 기능

### 1. 중앙 라우팅 허브
12개 마이크로서비스로 프록시 라우팅:

| 서비스 | 경로 | 포트 | 권한 | 설명 |
|--------|------|------|------|------|
| Auth Service | `/api/v1/auth` | 3001 | Public | 인증 및 권한 관리 |
| Store Management | `/api/v1/store` | 3002 | Owner/Staff | 매장/메뉴 관리 |
| Dashboard Service | `/api/v1/dashboard` | 3003 | Owner/Staff | 실시간 대시보드 |
| Order Service | `/api/v1/orders` | 3004 | All | 주문 처리 |
| Payment Service | `/api/v1/payments` | 3005 | All | 결제 처리 |
| AI Service | `/api/v1/ai` | 3006 | All | AI Agent |
| Analytics Service | `/api/v1/analytics` | 3007 | Owner/Staff | 매출 분석 |
| Notification Service | `/api/v1/notifications` | 3008 | All | 알림 관리 |
| User Profile Service | `/api/v1/profile` | 3009 | Owner/Staff | 직원 관리 |
| History Service | `/api/v1/history` | 3010 | Owner/Staff | 작업 로그 |
| Scraping Service | `/api/v1/scraping` | 3011 | Owner | 데이터 수집 |
| QR Service | `/api/v1/qr` | 3012 | Owner/Staff | QR 코드 관리 |

### 2. 인증 및 권한 관리
- **JWT 토큰 검증**: Auth Service와 연동
- **역할 기반 접근 제어**: owner, staff, customer
- **공개 라우트 관리**: 인증 없이 접근 가능한 엔드포인트

### 3. 보안 기능
- **Rate Limiting**: 글로벌 + 서비스별 제한
- **CORS 설정**: 크로스 오리진 요청 관리
- **보안 헤더**: Helmet.js 적용
- **요청 검증**: 헤더 및 입력값 검증

### 4. 모니터링 및 로깅
- **서비스 헬스체크**: 30초 간격 자동 체크
- **메트릭 수집**: 요청/응답 통계
- **로깅**: Morgan + 커스텀 로깅

### 5. WebSocket 프록시
- **실시간 통신**: WebSocket 연결 프록시
- **클라이언트 관리**: 구독/해제 시스템
- **이벤트 브로드캐스트**: 서비스 간 실시간 이벤트

## 🔧 API 엔드포인트

### Gateway 전용 API

```bash
# 헬스체크
GET /health
GET /api/health

# 서비스 상태
GET /api/v1/gateway/health      # 전체 서비스 헬스체크
GET /api/v1/gateway/services    # 서비스 목록
GET /api/v1/gateway/metrics     # 메트릭 정보
GET /api/v1/gateway/config      # 설정 정보

# 기타
GET /ping                       # Ping/Pong
```

### 프록시 라우트
모든 `/api/v1/*` 요청을 해당 서비스로 자동 라우팅

## 🛠️ 개발 및 실행

### 로컬 개발 실행

```bash
cd /home/wk/projects/wafl/backend/support/api-gateway

# 의존성 설치
npm install

# 개발 서버 시작 (포트 8080)
npm run dev

# TypeScript 컴파일
npm run build

# 프로덕션 실행
npm start
```

### 헬스체크 테스트

```bash
# 기본 헬스체크
curl http://localhost:8080/health

# 전체 서비스 상태
curl http://localhost:8080/api/v1/gateway/health

# 서비스 목록
curl http://localhost:8080/api/v1/gateway/services

# 메트릭 정보
curl http://localhost:8080/api/v1/gateway/metrics
```

### Auth Service 연동 테스트

```bash
# Auth Service를 통한 PIN 로그인 (API Gateway 경유)
curl -X POST http://localhost:8080/api/v1/auth/login/pin \
  -H "Content-Type: application/json" \
  -d '{"storeCode": 1001, "userPin": "1234"}'

# JWT 토큰으로 인증된 요청 (향후 다른 서비스들)
curl -X GET http://localhost:8080/api/v1/store/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 구현 상태

### ✅ 완료된 기능
- [x] Express + TypeScript 프로젝트 설정
- [x] 12개 서비스 프록시 라우팅
- [x] JWT 인증 미들웨어 (Auth Service 연동)
- [x] 역할 기반 접근 제어
- [x] Rate Limiting (글로벌 + 서비스별)
- [x] CORS 및 보안 헤더
- [x] 서비스 헬스체크 자동화
- [x] WebSocket 프록시
- [x] 에러 처리 및 로깅
- [x] 메트릭 수집 및 모니터링
- [x] Docker 컨테이너 설정

### 🔍 테스트 검증 완료
- [x] 서버 실행 확인 (포트 8080)
- [x] Health Check API 동작 확인
- [x] Auth Service 연동 확인
- [x] 프록시 라우팅 테스트
- [x] JWT 토큰 검증 테스트
- [x] Rate Limiting 동작 확인

## 🔧 설정

### 환경 변수 (.env)
```bash
# API Gateway 설정
NODE_ENV=development
PORT=8080
API_VERSION=v1

# JWT 설정 (Auth Service와 동일)
JWT_SECRET=your-super-secret-jwt-key-for-api-gateway-2024
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS 설정
CORS_ORIGIN=http://localhost:8080,http://localhost:3001,http://localhost:3002

# 12개 서비스 URL 설정
AUTH_SERVICE_URL=http://localhost:3001
STORE_MANAGEMENT_SERVICE_URL=http://localhost:3002
DASHBOARD_SERVICE_URL=http://localhost:3003
ORDER_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
AI_SERVICE_URL=http://localhost:3006
ANALYTICS_SERVICE_URL=http://localhost:3007
NOTIFICATION_SERVICE_URL=http://localhost:3008
USER_PROFILE_SERVICE_URL=http://localhost:3009
HISTORY_SERVICE_URL=http://localhost:3010
SCRAPING_SERVICE_URL=http://localhost:3011
QR_SERVICE_URL=http://localhost:3012

# WebSocket 설정
WS_PORT=8080
WS_PATH=/ws

# Health Check
HEALTH_CHECK_INTERVAL=30000
SERVICE_TIMEOUT=5000
```

## 🎯 다음 단계

API Gateway가 완전히 구현되었으므로, 이제 다음 서비스들을 개발할 수 있습니다:

### 1. Store Management Service (최우선)
- 매장/메뉴/카테고리 관리
- API Gateway를 통한 라우팅
- JWT 인증 적용

### 2. Order Service
- 주문 생성/관리
- 실시간 주문 상태 업데이트
- WebSocket 연동

### 3. Dashboard Service
- 실시간 매장 현황
- 통계 대시보드
- POS 화면 데이터 제공

## 🔗 관련 문서

- [전체 아키텍처 가이드](./ARCHITECTURE.md)
- [Auth Service API 문서](./AUTH_SERVICE_API.md)
- [Docker 개발 가이드](./DOCKER_GUIDE.md)
- [개발 TODO 리스트](./DEVELOPMENT_TODO.md)
- [코딩 컨벤션](./CODING_CONVENTIONS.md)

## 🚨 중요 참고사항

1. **Auth Service 의존성**: API Gateway는 Auth Service와 긴밀하게 연동되므로 Auth Service가 반드시 실행 중이어야 합니다.

2. **서비스별 구현 순서**: Store Management → Order → Dashboard 순으로 구현하는 것이 권장됩니다.

3. **JWT 토큰 공유**: 모든 서비스는 동일한 JWT_SECRET을 사용해야 합니다.

4. **포트 관리**: 각 서비스는 지정된 포트를 사용하며, API Gateway 설정과 일치해야 합니다.

---

**최종 업데이트**: 2025.09.16 - API Gateway 완전 구현 및 테스트 완료
**다음 목표**: Store Management Service 구현