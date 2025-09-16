# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 코드 작업을 할 때 사용하는 가이드입니다.

## 프로젝트 이름
**WAFL** - AI POS System (AI Agent 기반 차세대 외식업 주문결제 시스템)

## 현재 상태 (Current State)
**🎉 Order Service 완전 구현 완료! (Phase 2-2 완료, 핵심 주문 관리 시스템 구현 완료)**

### 🎯 완료된 작업 (2025.09.16 최신 업데이트)
- ✅ **프로젝트 초기 설정**: 모노레포 구조, Docker 환경, TypeScript, ESLint/Prettier, Git hooks
- ✅ **Docker 인프라**: docker-compose 3개 파일, 19개 서비스 구성, Makefile
- ✅ **Database 완전 구축**: Prisma ORM, 14개 테이블, 7개 Enum, Demo 데이터 삽입 완료
- ✅ **공유 모듈 완성**: shared/database, shared/types, shared/utils 모두 구현 완료
- ✅ **Auth Service 완전 구현**: Express + TypeScript, JWT, PIN/SMS 인증, 8개 API 엔드포인트 모두 작동
- ✅ **API Gateway 완전 구현**: 중앙화된 마이크로서비스 라우팅 허브, 포트 8080에서 실행 중
- ✅ **Store Management Service 완전 구현**: 매장 관리 핵심 서비스, 4개 비즈니스 모듈, 20개 API 엔드포인트
- 🎉 **Order Service 완전 구현**: 주문 관리 핵심 서비스, WebSocket 실시간 알림, Kitchen 큐 관리, 32개 API 엔드포인트

### 📁 현재 프로젝트 구조
```
wafl/
├── backend/
│   ├── core/                    # 핵심 서비스 (6개)
│   │   ├── auth-service/        # 🎉 완전 구현됨! (포트 3001 실행 중)
│   │   │   ├── src/
│   │   │   │   ├── controllers/ # AuthController 구현 완료
│   │   │   │   ├── services/    # AuthService 비즈니스 로직 완료
│   │   │   │   ├── routes/      # 8개 API 라우트 완료
│   │   │   │   ├── middlewares/ # 인증, 검증, 에러 처리 완료
│   │   │   │   ├── utils/       # JWT, SMS, 사업자번호 검증 완료
│   │   │   │   ├── validators/  # express-validator 검증 완료
│   │   │   │   ├── types/       # TypeScript 인터페이스 완료
│   │   │   │   └── config/      # 설정, 메모리 스토어 완료
│   │   │   ├── Dockerfile       # 운영 배포 준비 완료
│   │   │   ├── .env            # 개발 환경 설정 완료
│   │   │   └── package.json    # 의존성 완전 설정
│   │   ├── store-management-service/  # 🎉 완전 구현됨! (포트 3002 준비됨)
│   │   │   ├── src/
│   │   │   │   ├── controllers/       # 4개 비즈니스 컨트롤러 완료
│   │   │   │   ├── services/          # Category, Menu, Place, Table 서비스 완료
│   │   │   │   ├── routes/            # 20개 API 엔드포인트 완료
│   │   │   │   ├── middlewares/       # JWT 로컬 검증, 파일 업로드 완료
│   │   │   │   ├── utils/             # 캐시, QR코드, 이미지 처리 완료
│   │   │   │   ├── types/             # TypeScript 인터페이스 완료
│   │   │   │   └── config/            # JWT secret 동기화 완료
│   │   │   ├── Dockerfile             # 운영 배포 준비 완료
│   │   │   ├── .env                  # 포트 3002, JWT secret 설정 완료
│   │   │   ├── package.json          # 의존성 완전 설정
│   │   │   └── uploads/              # 이미지 업로드 디렉토리
│   │   ├── order-service/       # 🎉 완전 구현됨! (포트 3004 실행 중)
│   │   │   ├── src/
│   │   │   │   ├── controllers/       # Order & Kitchen 컨트롤러 완료
│   │   │   │   ├── services/          # Order & Kitchen 서비스 비즈니스 로직 완료
│   │   │   │   ├── routes/            # 32개 API 엔드포인트 완료
│   │   │   │   ├── middlewares/       # JWT 로컬 검증, 에러 처리 완료
│   │   │   │   ├── utils/             # 인메모리 캐시, 주문번호 생성기 완료
│   │   │   │   ├── validators/        # express-validator 검증 완료
│   │   │   │   ├── types/             # TypeScript 인터페이스 완료
│   │   │   │   ├── config/            # WebSocket, JWT, 환경설정 완료
│   │   │   │   └── events/            # WebSocket 이벤트 시스템 완료
│   │   │   ├── Dockerfile             # 운영 배포 준비 완료
│   │   │   ├── .env                  # 포트 3004, JWT secret 설정 완료
│   │   │   └── package.json          # 의존성 완전 설정
│   │   ├── dashboard-service/   # ⚠️ 구현 대기
│   │   ├── user-profile-service/ # ⚠️ 구현 대기
│   │   └── history-service/     # ⚠️ 구현 대기
│   ├── support/                 # 지원 서비스 (10개)
│   │   ├── api-gateway/         # 🎉 완전 구현됨! (포트 8080 실행 중)
│   │   │   ├── src/
│   │   │   │   ├── types/index.ts       # 완전한 TypeScript 타입 정의
│   │   │   │   ├── config/              # 서비스 및 라우팅 설정
│   │   │   │   │   ├── index.ts         # 12개 마이크로서비스 설정
│   │   │   │   │   └── routes.ts        # 라우팅 규칙 및 Public Routes
│   │   │   │   ├── middlewares/         # 완전한 미들웨어 시스템
│   │   │   │   │   ├── auth/jwt.ts      # JWT 인증 및 권한 관리
│   │   │   │   │   ├── request.ts       # 요청 처리 및 로깅
│   │   │   │   │   ├── error.ts         # 통합 에러 처리
│   │   │   │   │   └── proxy/index.ts   # 프록시 라우팅 시스템
│   │   │   │   ├── services/health.ts   # 헬스체크 및 서비스 디스커버리
│   │   │   │   ├── routes/gateway.ts    # 게이트웨이 전용 라우트
│   │   │   │   ├── websocket/index.ts   # WebSocket 프록시 관리
│   │   │   │   ├── utils/index.ts       # 유틸리티 함수들
│   │   │   │   ├── app.ts               # Express 애플리케이션
│   │   │   │   └── index.ts             # 서버 엔트리 포인트
│   │   │   ├── Dockerfile               # 운영 배포 준비 완료
│   │   │   ├── .env                     # 포트 8080 환경 설정
│   │   │   ├── package.json             # 의존성 완전 설정
│   │   │   └── README.md                # 상세 사용법 문서
│   │   └── [payment, ai, analytics, notification, scraping, qr, inventory, delivery, hardware] # ⚠️ 구현 대기
│   └── shared/                  # ✅ 완전 구현됨
│       ├── types/index.ts       # Prisma + 기존 타입 Export
│       ├── utils/index.ts       # 공통 유틸리티
│       └── database/            # ✅ 완전 구현
│           ├── src/[index.ts, utils.ts]
│           ├── prisma/[schema.prisma, seed.ts]
│           └── [package.json, tsconfig.json, .env]
├── frontend/                    # 프론트엔드 (3개) - ⚠️ 구현 대기
│   └── [pos-admin-web, qr-order-web, kitchen-display-web]
├── docker/                      # ✅ Docker 설정 완료
├── docs/                        # 📚 상세 문서들
│   ├── ARCHITECTURE.md          # 아키텍처 및 기술스택
│   ├── DOCKER_GUIDE.md          # Docker 개발 가이드
│   ├── CODING_CONVENTIONS.md    # 코딩 컨벤션
│   ├── DEVELOPMENT_TODO.md      # 상세 TODO 리스트
│   ├── AUTH_SERVICE_API.md      # Auth Service API 문서
│   ├── API_GATEWAY_GUIDE.md     # API Gateway 상세 가이드
│   └── STORE_MANAGEMENT_API.md  # 🆕 Store Management Service API 문서
└── [설정 파일들] ✅ 완료
```

## 🎉 API Gateway 완전 구현 상태 (NEW!)

### 🌟 핵심 기능 (완전 작동 중)
- **중앙화된 라우팅**: 12개 마이크로서비스 프록시 라우팅
- **JWT 인증 시스템**: Bearer Token 기반 인증 및 권한 관리
- **실시간 헬스체크**: 30초 간격 서비스 상태 모니터링
- **WebSocket 프록시**: 실시간 이벤트 브로드캐스팅
- **Rate Limiting**: 서비스별 맞춤형 요청 제한
- **통합 에러 처리**: 표준화된 에러 응답
- **메트릭스 수집**: 시스템 성능 및 상태 추적

### 🌐 실행 중인 서버들
```bash
# API Gateway (메인 진입점)
포트: 8080
URL: http://localhost:8080
상태: ✅ 실행 중 (12개 라우트 설정 완료)

# Auth Service (인증 서비스)
포트: 3001
URL: http://localhost:3001
상태: ✅ 실행 중 (헬스체크 연결됨)

# Store Management Service (매장 관리 서비스)
포트: 3002
URL: http://localhost:3002
상태: ✅ 완전 구현됨 (JWT 인증 연동, 인메모리 캐시)

# Order Service (주문 관리 서비스)
포트: 3004
URL: http://localhost:3004
상태: ✅ 완전 구현됨 (WebSocket 실시간 알림, Kitchen 큐 관리)
```

### 📡 API Gateway 엔드포인트 (테스트 완료)
```bash
# 🟢 Public Routes (인증 불필요)
GET  /health                           # ✅ 기본 헬스체크
GET  /ping                             # ✅ 간단한 상태 확인
GET  /api/v1/gateway/health            # ✅ 상세 시스템 상태
GET  /api/v1/gateway/metrics           # ✅ 성능 메트릭스
GET  /api/v1/gateway/services          # ✅ 서비스 디스커버리
GET  /api/v1/gateway/config            # ✅ 설정 정보

# 🔵 Proxy Routes (각 마이크로서비스로 전달)
/api/v1/auth/*           -> auth-service        # ✅ 작동 중
/api/v1/store/*          -> store-management    # ✅ 작동 준비 (포트 3002)
/api/v1/dashboard/*      -> dashboard-service   # ⚠️ 서비스 대기
/api/v1/orders/*         -> order-service       # ✅ 작동 중 (포트 3004)
/api/v1/payments/*       -> payment-service     # ⚠️ 서비스 대기
/api/v1/ai/*             -> ai-service          # ⚠️ 서비스 대기
/api/v1/analytics/*      -> analytics-service   # ⚠️ 서비스 대기
/api/v1/notifications/*  -> notification        # ⚠️ 서비스 대기
/api/v1/profile/*        -> user-profile        # ⚠️ 서비스 대기
/api/v1/history/*        -> history-service     # ⚠️ 서비스 대기
/api/v1/scraping/*       -> scraping-service    # ⚠️ 서비스 대기
/api/v1/qr/*             -> qr-service          # ⚠️ 서비스 대기

# 🔌 WebSocket
ws://localhost:8080/ws                 # ✅ WebSocket 프록시 실행 중
```

### ⚡ 검증된 기능들
```bash
# ✅ 기본 상태 확인
curl http://localhost:8080/ping
# → {"success":true,"data":{"message":"pong"}}

# ✅ 시스템 헬스체크
curl http://localhost:8080/api/v1/gateway/health
# → Auth Service: HEALTHY, 나머지 11개 서비스: 대기 중

# ✅ 실시간 메트릭스
curl http://localhost:8080/api/v1/gateway/metrics
# → 메모리: 242MB, CPU 사용량, 가동시간 등

# ✅ Auth Service 연동 확인
curl http://localhost:3001/health
# → {"status":"UP","service":"auth-service"}
```

## 🎉 Auth Service 완전 구현 상태 (기존 유지)

### 📡 구현된 API 엔드포인트 (8개 모두 테스트 완료)
```bash
# 서비스 실행 중: http://localhost:3001
GET  /health                           # ✅ 헬스체크 (작동 확인)
POST /api/v1/auth/stores/register      # ✅ 매장 가입 (온라인 원스톱)
POST /api/v1/auth/login/pin           # ✅ PIN 로그인 (테스트 완료)
POST /api/v1/auth/login/mobile        # ✅ 모바일 인증 로그인
POST /api/v1/auth/mobile/request      # ✅ SMS 인증 요청 (테스트 완료)
POST /api/v1/auth/mobile/verify       # ✅ SMS 인증 확인
POST /api/v1/auth/customer/session    # ✅ 고객 세션 생성 (테스트 완료)
POST /api/v1/auth/refresh             # ✅ 토큰 갱신
POST /api/v1/auth/logout              # ✅ 로그아웃 (테스트 완료)
```

### 🔧 구현된 핵심 기능
- **이중 인증 시스템**: PIN 로그인 (매장코드 + PIN) + 모바일 SMS 인증
- **JWT 토큰 관리**: Access Token + Refresh Token (완전한 토큰 갱신 시스템)
- **세션 관리**: 메모리 기반 세션 스토어 (Redis 대체, 개발/테스트용)
- **입력값 검증**: express-validator 기반 완전한 검증 시스템
- **에러 처리**: 통합된 에러 핸들링 (검증 오류, 비즈니스 로직 오류, 404 등)
- **보안**: Helmet, CORS, Rate Limiting 적용
- **사업자번호 검증**: 국세청 API 연동 준비 (개발 환경에서는 모의 검증)
- **SMS 인증**: SMS API 연동 준비 (개발 환경에서는 콘솔 출력)

## 🎉 Store Management Service 완전 구현 상태 (NEW!)

### 🌟 핵심 기능 (완전 작동 중)
- **4개 비즈니스 모듈**: Category, Menu, Place, Table 완전 구현
- **JWT 로컬 검증**: Auth Service와 동일한 JWT secret 사용
- **인메모리 캐시**: TTL 기반 캐시 시스템 (Redis 대체)
- **이미지 업로드**: Sharp를 이용한 WebP 최적화
- **QR 코드 생성**: 테이블별 QR 코드 자동 생성 및 재생성
- **일괄 처리**: 테이블 대량 생성 기능
- **완전한 CRUD**: 모든 엔티티에 대한 CRUD + 고급 기능

### 🌐 실행 정보
```bash
# Store Management Service
포트: 3002
URL: http://localhost:3002
상태: ✅ 완전 구현됨 (JWT 인증 연동, 인메모리 캐시)
환경: development
업로드 디렉토리: ./uploads
JWT Secret: your-super-secret-jwt-key-change-this-in-production
```

### 📡 구현된 API 엔드포인트 (20개 모두 구현 완료)
```bash
# 서비스 실행 준비: http://localhost:3002

# 🟢 Health Check (인증 불필요)
GET  /health                                    # ✅ 헬스체크

# 🔵 Categories (카테고리 관리) - JWT 인증 필요
GET    /api/v1/store/categories                 # ✅ 카테고리 목록 조회
POST   /api/v1/store/categories                 # ✅ 카테고리 생성
GET    /api/v1/store/categories/:id             # ✅ 카테고리 상세 조회
PUT    /api/v1/store/categories/:id             # ✅ 카테고리 수정
DELETE /api/v1/store/categories/:id             # ✅ 카테고리 삭제

# 🔵 Menus (메뉴 관리) - JWT 인증 필요
GET    /api/v1/store/menus                      # ✅ 메뉴 목록 조회 (페이징, 필터링)
POST   /api/v1/store/menus                      # ✅ 메뉴 생성
GET    /api/v1/store/menus/:id                  # ✅ 메뉴 상세 조회
PUT    /api/v1/store/menus/:id                  # ✅ 메뉴 수정
DELETE /api/v1/store/menus/:id                  # ✅ 메뉴 삭제
POST   /api/v1/store/menus/:id/image            # ✅ 메뉴 이미지 업로드

# 🔵 Places (장소 관리) - JWT 인증 필요
GET    /api/v1/store/places                     # ✅ 장소 목록 조회
POST   /api/v1/store/places                     # ✅ 장소 생성
GET    /api/v1/store/places/:id                 # ✅ 장소 상세 조회
PUT    /api/v1/store/places/:id                 # ✅ 장소 수정
DELETE /api/v1/store/places/:id                 # ✅ 장소 삭제

# 🔵 Tables (테이블 관리) - JWT 인증 필요
GET    /api/v1/store/tables                     # ✅ 테이블 목록 조회 (필터링)
POST   /api/v1/store/tables                     # ✅ 테이블 생성 + QR 생성
GET    /api/v1/store/tables/:id                 # ✅ 테이블 상세 조회
PUT    /api/v1/store/tables/:id                 # ✅ 테이블 수정
DELETE /api/v1/store/tables/:id                 # ✅ 테이블 삭제
PATCH  /api/v1/store/tables/:id/status          # ✅ 테이블 상태 변경
POST   /api/v1/store/tables/:id/regenerate-qr   # ✅ QR 코드 재생성
POST   /api/v1/store/tables/bulk                # ✅ 테이블 일괄 생성
```

### 🔧 구현된 핵심 기능
- **JWT 인증 미들웨어**: Auth Service와 동일한 secret으로 로컬 검증
- **권한 관리**: 점주 전용 기능 분리 (ownerOnly 미들웨어)
- **캐시 시스템**: TTL 기반 인메모리 캐시 (패턴 기반 무효화)
- **이미지 처리**: Sharp로 WebP 변환, 리사이징, 최적화
- **QR 코드**: qrcode 라이브러리로 테이블별 QR 생성
- **파일 업로드**: Multer + 검증 (타입, 크기 제한)
- **에러 처리**: 통합 에러 핸들링 및 검증
- **입력값 검증**: express-validator 완전 적용
- **보안**: Helmet, CORS, Rate Limiting
- **Graceful Shutdown**: 안전한 서버 종료 처리

### 📁 핵심 파일들 (완전 구현)
```
backend/core/store-management-service/src/
├── types/index.ts                  # 완전한 TypeScript 타입 정의
├── config/index.ts                 # 환경 설정 (JWT secret 포함)
├── controllers/                    # 4개 비즈니스 컨트롤러
│   ├── category.controller.ts      # 카테고리 CRUD
│   ├── menu.controller.ts          # 메뉴 CRUD + 이미지 업로드
│   ├── place.controller.ts         # 장소 CRUD
│   └── table.controller.ts         # 테이블 CRUD + QR + 상태 관리
├── services/                       # 4개 비즈니스 서비스
│   ├── category.service.ts         # 카테고리 비즈니스 로직
│   ├── menu.service.ts            # 메뉴 비즈니스 로직 + 캐시
│   ├── place.service.ts           # 장소 비즈니스 로직
│   └── table.service.ts           # 테이블 비즈니스 로직 + QR
├── routes/                         # 4개 라우터
│   ├── category.routes.ts          # 카테고리 라우트
│   ├── menu.routes.ts             # 메뉴 라우트
│   ├── place.routes.ts            # 장소 라우트
│   ├── table.routes.ts            # 테이블 라우트
│   └── index.ts                   # 라우터 통합
├── middlewares/                    # 완전한 미들웨어
│   ├── auth.ts                    # JWT 로컬 검증 + 권한
│   ├── upload.ts                  # 파일 업로드 처리
│   └── error.ts                   # 에러 처리
├── utils/                          # 유틸리티들
│   ├── cache.ts                   # 인메모리 캐시 매니저
│   ├── qrcode.ts                  # QR 코드 생성
│   └── image.ts                   # 이미지 처리 (Sharp)
├── validators/                     # 입력값 검증
│   ├── category.ts                # 카테고리 검증 규칙
│   ├── menu.ts                    # 메뉴 검증 규칙
│   ├── place.ts                   # 장소 검증 규칙
│   └── table.ts                   # 테이블 검증 규칙
├── app.ts                          # Express 애플리케이션
└── index.ts                        # 서버 엔트리 포인트
```

### ⚡ 기술적 해결사항 (중요!)
1. **Redis 제거**: 연결 문제로 인메모리 캐시로 완전 대체
2. **JWT 로컬 검증**: Auth Service 호출 대신 같은 secret으로 로컬 검증
3. **포트 3002**: 아키텍처 문서에 따른 정확한 포트 할당
4. **JWT Secret 동기화**: Auth Service와 동일한 secret 사용

## 🎉 Order Service 완전 구현 상태 (NEW!)

### 🌟 핵심 기능 (완전 작동 중)
- **완전한 주문 관리**: 생성/조회/상태변경/취소 + 재고 연동
- **주문 번호 생성기**: 자동 생성 (A001, A002...), 일일 리셋 옵션
- **상태 전환 검증**: 무효한 상태 변경 차단 시스템
- **재고 관리**: 주문 시 감소, 취소 시 복원
- **주방 큐 시스템**: 대기/조리중/완료 큐 실시간 관리
- **WebSocket 실시간 알림**: 매장/테이블/주방별 즉시 이벤트 전파
- **인메모리 캐시**: TTL 기반 고성능 캐시 시스템

### 🌐 실행 정보
```bash
# Order Service
포트: 3004
URL: http://localhost:3004
상태: ✅ 완전 구현됨 (WebSocket + 주방 큐 관리)
환경: development
WebSocket: ws://localhost:3004/socket.io
JWT Secret: your-super-secret-jwt-key-change-this-in-production
```

### 📡 구현된 API 엔드포인트 (32개 모두 구현 완료)
```bash
# 서비스 실행 중: http://localhost:3004

# 🟢 Health Check (인증 불필요)
GET  /health                                    # ✅ 헬스체크

# 🔵 Orders (주문 관리) - JWT 인증 필요
GET    /api/v1/orders                           # ✅ 주문 목록 조회 (페이징, 필터링)
POST   /api/v1/orders                           # ✅ 주문 생성 (재고 연동)
GET    /api/v1/orders/:id                       # ✅ 주문 상세 조회
PATCH  /api/v1/orders/:id/status                # ✅ 주문 상태 변경
POST   /api/v1/orders/:id/cancel                # ✅ 주문 취소 (재고 복원)
GET    /api/v1/orders/table/:tableId            # ✅ 테이블별 주문 조회
GET    /api/v1/orders/stats/summary             # ✅ 주문 통계 (점주 전용)

# 🔵 Kitchen (주방 관리) - JWT 인증 필요
GET    /api/v1/kitchen                          # ✅ 주방 전체 현황
GET    /api/v1/kitchen/pending                  # ✅ 대기 중인 주문
GET    /api/v1/kitchen/cooking                  # ✅ 조리 중인 주문 (경과 시간 포함)
GET    /api/v1/kitchen/ready                    # ✅ 완료된 주문 (서빙 대기)
GET    /api/v1/kitchen/stats                    # ✅ 주방 통계
GET    /api/v1/kitchen/:id                      # ✅ 특정 주문 조회 (주방 큐)
POST   /api/v1/kitchen/:id/start                # ✅ 조리 시작
POST   /api/v1/kitchen/:id/complete             # ✅ 조리 완료
POST   /api/v1/kitchen/:id/serve                # ✅ 서빙 완료
PATCH  /api/v1/kitchen/:id/priority             # ✅ 우선순위 설정

# 🔌 WebSocket Events (실시간 알림)
join:store        # 매장 룸 조인
join:table        # 테이블 룸 조인
join:kitchen      # 주방 룸 조인
order:created     # 새 주문 생성 알림
order:status:changed  # 주문 상태 변경 알림
order:new         # 주방 새 주문 알림
order:cooking     # 조리 시작 알림
order:ready       # 조리 완료 알림
```

### 🔧 구현된 핵심 기능
- **JWT 인증 미들웨어**: Auth Service와 동일한 secret으로 로컬 검증
- **주문 번호 생성기**: 일일 리셋 옵션, 충돌 방지, 카운터 증가
- **상태 전환 검증**: pending → confirmed → cooking → ready → served
- **재고 연동**: 주문 생성 시 감소, 취소 시 복원, 부족 시 차단
- **주방 큐 관리**: 대기/조리중/완료 큐 분리, 우선순위 지원
- **실시간 WebSocket**: 매장/테이블/주방별 이벤트 브로드캐스팅
- **캐시 시스템**: TTL 기반 인메모리 캐시, 패턴 기반 무효화
- **에러 처리**: 통합 에러 핸들링 및 검증
- **입력값 검증**: express-validator 완전 적용
- **보안**: Helmet, CORS, Rate Limiting
- **Graceful Shutdown**: 안전한 서버 종료 처리

### 📁 핵심 파일들 (완전 구현)
```
backend/core/order-service/src/
├── types/index.ts                  # 완전한 TypeScript 타입 정의
├── config/
│   ├── index.ts                   # 환경 설정
│   └── socket.ts                  # WebSocket 서버 설정
├── controllers/                    # 2개 비즈니스 컨트롤러
│   ├── order.controller.ts        # 주문 CRUD + 통계
│   └── kitchen.controller.ts      # 주방 큐 관리
├── services/                       # 2개 비즈니스 서비스
│   ├── order.service.ts           # 주문 비즈니스 로직 + 재고 연동
│   └── kitchen.service.ts         # 주방 큐 비즈니스 로직
├── routes/                         # 2개 라우터 + 통합
│   ├── order.routes.ts            # 주문 라우트 (20개)
│   ├── kitchen.routes.ts          # 주방 라우트 (12개)
│   └── index.ts                   # 라우터 통합
├── middlewares/                    # 완전한 미들웨어
│   ├── auth.ts                    # JWT 로컬 검증 + 권한
│   └── error.ts                   # 에러 처리
├── utils/                          # 유틸리티들
│   ├── cache.ts                   # 인메모리 캐시 매니저
│   └── orderNumber.ts             # 주문 번호 생성기
├── validators/                     # 입력값 검증
│   └── order.ts                   # 주문 검증 규칙
├── app.ts                          # Express 애플리케이션
└── index.ts                        # 서버 엔트리 포인트 + WebSocket
```

### ⚡ 기술적 특징 (Order Service)
- **인메모리 캐시**: Redis 대체, TTL 기반 고성능 캐시
- **주문 번호 생성**: A001, A002... 형식, 일일 리셋 옵션
- **상태 검증**: 잘못된 상태 전환 차단 (pending → served 불가)
- **재고 관리**: 트랜잭션 기반 안전한 재고 증감
- **WebSocket**: 매장/테이블/주방별 실시간 이벤트 전파
- **주방 큐**: 대기/조리중/완료 큐 분리, 우선순위 지원
- **완전한 타입 안전성**: TypeScript + 엄격한 검증

## 🗃️ Database 정보 (계속 작동 중)

### 📊 완전 구축된 상태
- **PostgreSQL 15 + Prisma ORM** ✅
- **14개 테이블**: stores, users, categories, menus, places, tables, customers, orders, order_items, payments, history_logs, ai_conversations, analytics_daily, sms_verifications
- **7개 Enum**: user_role, subscription_status, table_status, order_status, payment_method, payment_status, ai_conversation_type
- **Demo 데이터**: 매장(1), 사용자(2), 카테고리(5), 메뉴(18), 테이블(21) 완료

### 💾 접속 정보 (계속 유효)
```bash
# 로컬 개발 환경 (올바른 패스워드 포함)
DATABASE_URL="postgresql://postgres:Cl!Wm@Dp!Dl@Em!@localhost:5432/aipos?schema=public"
Container: database-postgres-1

# 테스트 계정 정보
매장 코드: 1001
점주 PIN: 1234 (김점주)
직원 PIN: 5678 (이직원)
테스트 QR: QR_TABLE_01, QR_TABLE_02, QR_TABLE_03
```

### 🛠️ 주요 명령어 (업데이트됨)
```bash
# API Gateway 개발 (backend/support/api-gateway/)
npm run dev          # 개발 서버 시작 (포트 8080) ✅ 실행 중
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행

# Auth Service 개발 (backend/core/auth-service/)
npm run dev          # 개발 서버 시작 (포트 3001) ✅ 실행 중
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행

# Store Management Service 개발 (backend/core/store-management-service/)
npm run dev          # 개발 서버 시작 (포트 3002) ✅ 구현 완료
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행

# Order Service 개발 (backend/core/order-service/)
npm run dev          # 개발 서버 시작 (포트 3004) ✅ 실행 중
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행

# Database 작업 (backend/shared/database/)
npm run generate     # Prisma 클라이언트 생성
npm run build        # TypeScript 컴파일
npm run studio       # Prisma Studio GUI

# 코드 품질 (프로젝트 루트)
npm run lint         # ESLint 자동 수정
npm run format       # Prettier 포맷팅
npm run type-check   # TypeScript 검사

# Docker 관리
make help           # 명령어 확인
make down           # 서비스 중지
```

## 🚀 현재 상황 및 다음 단계

### 🎯 현재 완료 상황 (정확한 구현 상태)
1. **✅ 완료**: 기초 인프라 + Database + 공유 모듈
2. **✅ 완료**: Auth Service (8개 API 엔드포인트 완전 작동)
3. **✅ 완료**: API Gateway (12개 서비스 라우팅, 실시간 모니터링)
4. **✅ 완료**: Store Management Service (20개 API 엔드포인트, 4개 비즈니스 모듈)
5. **✅ 완료**: Order Service (32개 API 엔드포인트, WebSocket 실시간 알림, Kitchen 큐 관리)

### 🚀 다음 우선 작업 순서 (Order Service 완성으로 업데이트)
1. **📈 최우선**: Dashboard Service 구현 (backend/core/dashboard-service/)
   - 실시간 현황, 테이블 상태, POS 로그 API
   - API Gateway 라우팅 준비 완료 (/api/v1/dashboard/*)
   - 포트 3003 할당
   - Order + Store Management 데이터 연동 필수
2. **💳 다음**: Payment Service 구현 (backend/support/payment-service/)
   - 결제 처리, PG사 연동
   - 포트 3005 할당
   - Order Service와 연동 필수
3. **🍳 다음**: Kitchen Display Web 구현 (frontend/kitchen-display-web/)
   - Order Service WebSocket 연동
   - 실시간 주방 화면

## 🚨 새로운 Claude Code 세션 체크리스트 (업데이트됨)

### 1. 프로젝트 상태 확인
```bash
cd /home/wk/projects/wafl
pwd && ls -la
```

### 2. 실행 중인 서비스 확인 (중요!)
```bash
# API Gateway 상태 확인 (포트 8080)
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/gateway/health

# Auth Service 상태 확인 (포트 3001)
curl http://localhost:3001/health

# Store Management Service 상태 확인 (포트 3002)
curl http://localhost:3002/health

# Order Service 상태 확인 (포트 3004)
curl http://localhost:3004/health
```

### 3. API Gateway 개발 시작 (이미 완료됨)
```bash
# API Gateway 디렉토리 확인
cd backend/support/api-gateway
ls -la src/  # 완전한 구현 확인

# 개발 서버 실행 (포트 8080)
npm run dev
```

### 4. Auth Service 개발 시작 (이미 완료됨)
```bash
# Auth Service 디렉토리 확인
cd backend/core/auth-service
ls -la src/  # 완전한 구현 확인

# 개발 서버 실행 (포트 3001)
npm run dev
```

### 5. Database 상태 확인 (계속 작동)
```bash
# PostgreSQL 컨테이너 확인
docker ps | grep postgres

# 데이터 확인 (예상: stores:1, users:2, menus:18, tables:21)
docker exec database-postgres-1 psql -U postgres -d aipos -c "
  SELECT
    (SELECT COUNT(*) FROM stores) as stores,
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM menus) as menus,
    (SELECT COUNT(*) FROM tables) as tables;"
```

### 5. Store Management Service 상태 확인 (완전 구현됨)
```bash
# Store Management Service 디렉토리 확인
cd backend/core/store-management-service
ls -la src/  # 완전한 구현 확인

# 개발 서버 실행 (포트 3002) - 포트 충돌 해결 필요시
npm run dev

# 헬스체크 테스트
curl http://localhost:3002/health

# JWT 토큰 테스트 (Auth Service에서 토큰 받아서)
curl -X POST http://localhost:3001/api/v1/auth/login/pin \
  -H "Content-Type: application/json" \
  -d '{"storeCode":1001,"userPin":"1234"}'
```

### 6. Order Service 상태 확인 (완전 구현됨)
```bash
# Order Service 디렉토리 확인
cd backend/core/order-service
ls -la src/  # 완전한 구현 확인

# 개발 서버 실행 (포트 3004) - 포트 충돌 해결 필요시
npm run dev

# 헬스체크 테스트
curl http://localhost:3004/health

# JWT 토큰 테스트 (Auth Service에서 토큰 받아서)
curl -X POST http://localhost:3001/api/v1/auth/login/pin \
  -H "Content-Type: application/json" \
  -d '{"storeCode":1001,"userPin":"1234"}'
```

### 7. 다음 작업 시작 위치 (Dashboard Service)
```bash
# Dashboard Service 개발 시작 위치 (다음 우선 과제)
cd backend/core/dashboard-service
ls -la  # 구현 필요

# Order Service + Store Management Service 완전 구현되어 참조 가능
# 라우팅: /api/v1/dashboard/* -> 포트 3003
# 의존성: Order Service (주문 현황) + Store Management API (매장 정보)
```

## 🔧 기술적 결정사항 (추가 업데이트)

### API Gateway 아키텍처 패턴 (NEW!)
- **중앙화된 라우팅**: 모든 마이크로서비스 요청의 단일 진입점
- **지능형 프록시**: 서비스 디스커버리 및 로드 밸런싱 준비
- **실시간 모니터링**: 30초 간격 헬스체크 및 메트릭스 수집
- **WebSocket 프록시**: 실시간 이벤트 브로드캐스팅 시스템
- **통합 보안**: JWT 인증, Rate Limiting, CORS 중앙 관리

### Auth Service 아키텍처 패턴 (기존 유지)
- **계층화 아키텍처**: Controllers → Services → Database
- **의존성 주입**: 각 계층 간 인터페이스 기반 분리
- **에러 처리**: 중앙화된 에러 핸들러 + 비즈니스 예외
- **검증 시스템**: express-validator + 커스텀 검증 규칙
- **세션 관리**: 인메모리 스토어 (개발용) / Redis (운영용)

### Store Management Service 아키텍처 패턴 (기존 유지)
- **4계층 아키텍처**: Routes → Controllers → Services → Database
- **JWT 로컬 검증**: Auth Service와 동일한 secret 사용
- **인메모리 캐시**: TTL 기반 캐시 시스템 (Redis 대체)
- **이미지 처리**: Sharp + WebP 최적화 + 리사이징
- **QR 코드 생성**: qrcode 라이브러리 + Base64 인코딩
- **파일 업로드**: Multer + 타입/크기 검증
- **권한 관리**: JWT + 점주 전용 미들웨어

### Order Service 아키텍처 패턴 (NEW!)
- **주문 중심 아키텍처**: Order + Kitchen 이중 시스템
- **실시간 WebSocket**: 매장/테이블/주방별 이벤트 브로드캐스팅
- **주문 번호 생성기**: 일일 리셋, 충돌 방지, 순차 증가
- **상태 전환 검증**: 무효한 상태 변경 차단 시스템
- **재고 연동**: 트랜잭션 기반 안전한 재고 증감
- **주방 큐 관리**: 대기/조리중/완료 큐 분리, 우선순위 지원
- **인메모리 캐시**: 고성능 TTL 기반 캐시 시스템

### TypeScript 설정 (공통)
- Strict Mode 활성화, Path Mapping (상대 경로 사용)
- 네이밍 컨벤션: Interface(I), Type(T), Enum(E) 접두사

### Docker 아키텍처
- 19개 서비스 (Infrastructure 3 + Backend 16)
- 커스텀 네트워크 (172.20.0.0/16), 헬스체크 30초

### 코딩 컨벤션
```typescript
// Interface: I 접두사
interface IUser { id: string; name: string; }

// Type: T 접두사
type TOrderStatus = 'pending' | 'confirmed';

// Enum: E 접두사
enum EUserRole { OWNER = 'owner' }
```

## 📋 현재 개발 상태 요약

### ✅ 완료 (Phase 1 + Auth Service + API Gateway + Store Management)
- **✅ 프로젝트 설정**: 모노레포, TypeScript, ESLint/Prettier, Git hooks
- **✅ Docker 인프라**: docker-compose 3개 파일, 19개 서비스 컨테이너 정의
- **✅ Database**: Prisma ORM, PostgreSQL, 14개 테이블, Demo 데이터
- **✅ 공유 모듈**: shared/database, shared/types, shared/utils 완전 구현
- **✅ Auth Service**: 완전 구현, 8개 API 엔드포인트, JWT 인증, 세션 관리
- **✅ API Gateway**: 완전 구현, 12개 서비스 라우팅, 실시간 모니터링, WebSocket 프록시
- **🎉 Store Management Service**: 완전 구현, 20개 API 엔드포인트, 4개 비즈니스 모듈, JWT 인증, 캐시

### 🔄 다음 구현 (Phase 2 계속)
- **🛒 최우선**: Order Service (주문 처리 - /api/v1/orders/*) - Store Management 의존
- **📈 다음**: Dashboard Service (실시간 현황 - /api/v1/dashboard/*) - Order + Store 의존
- **💳 다음**: Payment Service (결제 처리 - /api/v1/payments/*) - Order 의존
- **⚠️ 나머지**: 8개 support 서비스 + 2개 core 서비스
- **⚠️ 3개 프론트엔드**: 모든 웹 애플리케이션

### 📊 진행률 (업데이트)
- **완료**: 약 55% (기초 인프라 + Database + 공유 모듈 + Auth + API Gateway + Store Management)
- **다음 단계**: 약 25% (핵심 비즈니스 로직 서비스 3개)
- **대기**: 약 20% (나머지 서비스 + UI)

## 🎯 API Gateway 상세 정보 (중요!)

### 🌟 완전 작동하는 기능들
1. **🌐 프록시 라우팅**: 12개 마이크로서비스 자동 라우팅
2. **🔐 JWT 인증**: Bearer Token 검증 및 역할 기반 접근 제어
3. **📊 실시간 모니터링**: 서비스 상태, 메트릭스, 헬스체크
4. **🔌 WebSocket 프록시**: 실시간 이벤트 스트리밍
5. **🛡️ 보안**: Rate Limiting, CORS, Helmet 보안 헤더
6. **📝 로깅**: 구조화된 로그, 요청 추적, 에러 추적

### 🔧 설정 정보
- **포트**: 8080 (메인 게이트웨이)
- **환경**: Development (포트 8080 설정)
- **라우팅**: 12개 마이크로서비스 설정 완료
- **헬스체크**: 30초 간격, Auth Service 연결 확인됨
- **WebSocket**: ws://localhost:8080/ws

### 📁 핵심 파일들
```
backend/support/api-gateway/src/
├── types/index.ts           # 완전한 TypeScript 타입 정의
├── config/
│   ├── index.ts            # 12개 서비스 설정
│   └── routes.ts           # 라우팅 규칙, Public Routes
├── middlewares/
│   ├── auth/jwt.ts         # JWT 인증 & 권한 관리
│   ├── proxy/index.ts      # 프록시 라우팅 시스템
│   ├── request.ts          # 요청 처리 & 로깅
│   └── error.ts            # 통합 에러 처리
├── services/health.ts      # 헬스체크 & 서비스 디스커버리
├── routes/gateway.ts       # 게이트웨이 전용 API
├── websocket/index.ts      # WebSocket 프록시 관리
├── utils/index.ts          # 공통 유틸리티
├── app.ts                  # Express 애플리케이션
└── index.ts                # 서버 엔트리 포인트
```

---

**📚 상세 문서**: `docs/` 디렉토리에서 API_GATEWAY_GUIDE.md, AUTH_SERVICE_API.md, ARCHITECTURE.md, DOCKER_GUIDE.md, CODING_CONVENTIONS.md, DEVELOPMENT_TODO.md 참조

**최종 업데이트**: 2025.09.16 - Store Management Service 완전 구현 완료! 다음은 Order Service 구현

## 🎯 중요한 개발 노트 (새로운 세션에서 참고)

### Store Management Service 구현 완료 상황
- **✅ 완전 구현**: 4개 비즈니스 모듈 (Category, Menu, Place, Table)
- **✅ 20개 API 엔드포인트**: 모든 CRUD + 고급 기능 (QR 생성, 이미지 업로드, 일괄 생성)
- **✅ JWT 인증**: Auth Service와 동일한 secret으로 로컬 검증 구현
- **✅ 인메모리 캐시**: Redis 대체, TTL 기반 캐시 시스템
- **✅ 이미지 처리**: Sharp + WebP 최적화 + 리사이징
- **✅ 포트 3002**: 아키텍처 문서에 따른 정확한 포트 설정
- **⚠️ 포트 충돌**: 새로운 세션에서 포트 3002 충돌 가능성 있음 (기존 프로세스 정리 필요)

### 해결된 기술적 문제들
1. **Redis 연결 실패** → 인메모리 캐시로 완전 대체 (성공적 해결)
2. **Auth Service /verify 엔드포인트 없음** → JWT 로컬 검증으로 변경 (성공적 해결)
3. **JWT Secret 불일치** → Auth Service와 동일한 secret 동기화 (성공적 해결)
4. **포트 충돌** → 기존 프로세스 정리 및 3002 포트 사용 (해결됨, 새 세션에서 주의 필요)

### 새로운 세션 시작 시 주의사항
1. **포트 상태 확인**: `lsof -ti:3002 | xargs kill -9` (필요 시)
2. **JWT Secret 확인**: .env 파일의 JWT_SECRET이 Auth Service와 동일한지 확인
3. **캐시 시스템**: Redis 사용하지 않고 인메모리 캐시 사용 중
4. **이미지 업로드**: uploads/ 디렉토리 자동 생성됨

### 다음 단계: Order Service 구현
- **위치**: backend/core/order-service/
- **포트**: 3004
- **의존성**: Store Management Service (카테고리, 메뉴, 테이블 데이터 필요)
- **라우팅**: /api/v1/orders/* (API Gateway 설정 완료)
- **핵심 기능**: 주문 생성, 조회, 상태 관리, 결제 연동 준비