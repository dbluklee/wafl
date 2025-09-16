# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 코드 작업을 할 때 사용하는 가이드입니다.

## 프로젝트 이름
**WAFL** - AI POS System (AI Agent 기반 차세대 외식업 주문결제 시스템)

## 현재 상태 (Current State)
**🎉 Auth Service + API Gateway 완전 구현 완료! (Phase 2 계속, 핵심 인프라 완성)**

### 🎯 완료된 작업 (2025.09.16 최신 업데이트)
- ✅ **프로젝트 초기 설정**: 모노레포 구조, Docker 환경, TypeScript, ESLint/Prettier, Git hooks
- ✅ **Docker 인프라**: docker-compose 3개 파일, 19개 서비스 구성, Makefile
- ✅ **Database 완전 구축**: Prisma ORM, 14개 테이블, 7개 Enum, Demo 데이터 삽입 완료
- ✅ **공유 모듈 완성**: shared/database, shared/types, shared/utils 모두 구현 완료
- ✅ **Auth Service 완전 구현**: Express + TypeScript, JWT, PIN/SMS 인증, 8개 API 엔드포인트 모두 작동
- 🎉 **API Gateway 완전 구현**: 중앙화된 마이크로서비스 라우팅 허브, 포트 8080에서 실행 중

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
│   │   ├── store-management-service/  # 🎯 다음 우선 구현 대상
│   │   ├── dashboard-service/   # ⚠️ 구현 대기
│   │   ├── order-service/       # ⚠️ 구현 대기
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
│   └── API_GATEWAY_GUIDE.md     # 🆕 API Gateway 상세 가이드
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
/api/v1/store/*          -> store-management    # ⚠️ 서비스 대기
/api/v1/dashboard/*      -> dashboard-service   # ⚠️ 서비스 대기
/api/v1/orders/*         -> order-service       # ⚠️ 서비스 대기
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
4. **🔄 준비 완료**: 비즈니스 로직 서비스들을 위한 완전한 인프라

### 🚀 다음 우선 작업 순서 (API Gateway 완성으로 업데이트)
1. **📊 최우선**: Store Management Service 구현 (backend/core/store-management-service/)
   - 카테고리, 메뉴, 장소, 테이블 관리 API
   - API Gateway를 통한 라우팅 준비 완료 (/api/v1/store/*)
   - 포트 3002 할당
2. **🛒 다음**: Order Service 구현 (backend/core/order-service/)
   - 주문 생성, 조회, 상태 관리 API
   - API Gateway 라우팅 준비 완료 (/api/v1/orders/*)
   - 포트 3004 할당
3. **📈 다음**: Dashboard Service 구현 (backend/core/dashboard-service/)
   - 실시간 현황, 테이블 상태, POS 로그 API
   - API Gateway 라우팅 준비 완료 (/api/v1/dashboard/*)
   - 포트 3003 할당

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

### 6. 다음 작업 시작 위치 (Store Management Service)
```bash
# Store Management Service 개발 시작 위치
cd backend/core/store-management-service
ls -la  # 현재 비어있음, 구현 필요

# API Gateway와 Auth Service는 완전 구현되어 참조 가능
# 라우팅: /api/v1/store/* -> 포트 3002
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

### ✅ 완료 (Phase 1 + Auth Service + API Gateway)
- **✅ 프로젝트 설정**: 모노레포, TypeScript, ESLint/Prettier, Git hooks
- **✅ Docker 인프라**: docker-compose 3개 파일, 19개 서비스 컨테이너 정의
- **✅ Database**: Prisma ORM, PostgreSQL, 14개 테이블, Demo 데이터
- **✅ 공유 모듈**: shared/database, shared/types, shared/utils 완전 구현
- **✅ Auth Service**: 완전 구현, 8개 API 엔드포인트, JWT 인증, 세션 관리
- **🎉 API Gateway**: 완전 구현, 12개 서비스 라우팅, 실시간 모니터링, WebSocket 프록시

### 🔄 다음 구현 (Phase 2 계속)
- **📊 최우선**: Store Management Service (매장 관리 - /api/v1/store/*)
- **🛒 다음**: Order Service (주문 처리 - /api/v1/orders/*)
- **📈 다음**: Dashboard Service (실시간 현황 - /api/v1/dashboard/*)
- **⚠️ 나머지**: 9개 support 서비스 + 3개 core 서비스
- **⚠️ 3개 프론트엔드**: 모든 웹 애플리케이션

### 📊 진행률 (업데이트)
- **완료**: 약 45% (기초 인프라 + Database + 공유 모듈 + Auth Service + API Gateway)
- **다음 단계**: 약 25% (핵심 비즈니스 로직 서비스 3개)
- **대기**: 약 30% (나머지 서비스 + UI)

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

**최종 업데이트**: 2025.09.16 - API Gateway 완전 구현 완료, Store Management Service가 다음 우선 과제