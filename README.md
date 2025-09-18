# WAFL - AI POS System

**AI Agent 기반 차세대 외식업 주문결제 시스템**

## 📊 현재 개발 상태

### ✅ 완료된 단계 (40%)
- **✅ Phase 1: 기초 인프라 구축** (2024.09.16 완료)
  - Docker 환경 + PostgreSQL/Redis/RabbitMQ 설정
  - TypeScript + ESLint/Prettier + Git hooks
  - Prisma ORM + 14개 테이블 + Demo 데이터
  - 공유 모듈 (database, types, utils)

- **✅ Phase 2: Auth Service 완전 구현** (2025.09.16 완료)
  - JWT 기반 이중 인증 (PIN + SMS)
  - 8개 API 엔드포인트 구현 및 테스트 완료
  - 매장 가입, 로그인, 고객 세션 관리
  - **포트 3001에서 실행 중** 🚀

- **🎉 Phase 3: API Gateway Service 완전 구현** (2025.09.16 완료) **NEW!**
  - 12개 서비스 중앙 라우팅 허브
  - JWT 인증 미들웨어 및 권한 관리
  - 서비스별 Rate Limiting 및 헬스체크
  - WebSocket 프록시 및 실시간 모니터링
  - **포트 4000에서 실행 중** 🚀

### 🔄 진행 중 (다음 우선순위)
- **📊 Store Management Service** (포트 3002) - 매장 관리 시스템 **최우선**
- **🛒 Order Service** (포트 3004) - 주문 처리 시스템
- **📈 Dashboard Service** (포트 3003) - 실시간 대시보드

### ⏳ 대기 중 (60%)
- 12개 추가 백엔드 서비스
- 3개 프론트엔드 애플리케이션

## 🚀 시작하기

### 시스템 요구사항
- Node.js 20 LTS 이상
- Docker 24.0 이상
- Docker Compose 2.20 이상

### 개발 환경 설정

1. **프로젝트 클론 및 의존성 설치**
```bash
git clone [repository-url]
cd wafl
npm install
```

2. **Docker 환경 시작**
```bash
# 인프라 서비스 시작 (PostgreSQL, Redis, RabbitMQ)
make up

# Database 상태 확인
docker ps | grep postgres
```

3. **Auth Service 실행** ✅
```bash
cd backend/core/auth-service
npm install
npm run dev

# 헬스체크 확인
curl http://localhost:3001/health
```

4. **API Gateway 실행** ✅ **NEW!**
```bash
cd backend/support/api-gateway
npm install
npm run dev

# 헬스체크 확인
curl http://localhost:4000/health
curl http://localhost:4000/api/v1/gateway/health
```

### 주요 명령어

```bash
# 전체 서비스 시작
make up

# 개발 모드 시작 (hot-reload)
make dev

# 서비스 중지
make down

# 전체 빌드
make build

# 로그 확인
make logs

# 헬스체크
make health
```

## 🏗️ 아키텍처

### 마이크로서비스 구조
19개의 독립적인 Docker 서비스로 구성:

```
📦 Infrastructure (3개) ✅
├── PostgreSQL (5200) - 메인 데이터베이스
├── Redis (6379) - 세션 저장소
└── RabbitMQ (5672) - 메시지 브로커

🔧 Core Services (6개)
├── ✅ auth-service (3001) - 인증 및 권한 관리
├── 📈 store-management-service (3002) - 매장 관리 (다음 우선 구현)
├── ⚠️ dashboard-service (3003) - 실시간 대시보드
├── ⚠️ order-service (3004) - 주문 처리
├── ⚠️ user-profile-service (3009) - 사용자 프로필
└── ⚠️ history-service (3010) - 작업 이력

🔧 Support Services (10개)
├── ✅ api-gateway (8080) - 중앙 라우팅 허브
├── ⚠️ payment-service (3005) - 결제 처리
├── ⚠️ ai-service (3006) - AI Agent
└── [7개 추가 서비스...]

🌐 Frontend (3개) - ⚠️ 모두 구현 대기
├── pos-admin-web (4000) - POS 관리자 화면
├── qr-order-web (4001) - 고객 주문 화면
└── kitchen-display-web (4002) - 주방 디스플레이
```

### 데이터베이스
- **PostgreSQL 15** + **Prisma ORM**
- **14개 테이블**: stores, users, categories, menus, tables, orders 등
- **Demo 데이터**: 매장(1), 사용자(2), 메뉴(18), 테이블(21) 삽입 완료

## 🧪 테스트 및 API

### Auth Service 테스트 ✅
```bash
# 헬스체크
curl http://localhost:3001/health

# PIN 로그인 테스트
curl -X POST http://localhost:3001/api/v1/auth/login/pin \
  -H "Content-Type: application/json" \
  -d '{"storeCode": 1001, "userPin": "1234"}'
```

### 테스트 계정 정보
```
매장 코드: 1001
점주 PIN: 1234 (김점주)
직원 PIN: 5678 (이직원)
테스트 QR: QR_TABLE_01, QR_TABLE_02, QR_TABLE_03
```

## 📚 문서

### 개발 가이드
- **[CLAUDE.md](./CLAUDE.md)** - 전체 프로젝트 가이드 및 현재 상태
- **[docs/DEVELOPMENT_TODO.md](./docs/DEVELOPMENT_TODO.md)** - 상세 개발 TODO 리스트
- **[docs/AUTH_SERVICE_API.md](./docs/AUTH_SERVICE_API.md)** - Auth Service API 문서
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - 아키텍처 설계 문서
- **[docs/DOCKER_GUIDE.md](./docs/DOCKER_GUIDE.md)** - Docker 개발 가이드
- **[docs/CODING_CONVENTIONS.md](./docs/CODING_CONVENTIONS.md)** - 코딩 컨벤션

### 기술 스택
- **Backend**: Node.js, TypeScript, Express.js, Prisma ORM
- **Database**: PostgreSQL 15
- **Authentication**: JWT (Access + Refresh Token)
- **Container**: Docker + Docker Compose
- **Code Quality**: ESLint, Prettier, Husky Git hooks

## 🎯 다음 개발 단계

1. **API Gateway Service 구현** (포트 8080)
   - 중앙 라우팅 허브
   - Auth Service 연동
   - Rate Limiting 및 보안

2. **Store Management Service 구현** (포트 3002)
   - 매장 설정 관리
   - 메뉴/카테고리 CRUD
   - 테이블 관리

3. **Order Service 구현** (포트 3004)
   - 주문 생성/처리
   - 상태 관리
   - 실시간 알림

## 📈 진행률 요약

| 단계 | 상태 | 진행률 | 완료일 |
|------|------|--------|--------|
| Phase 1: 기초 인프라 | ✅ 완료 | 100% | 2024.09.16 |
| Phase 2: Auth Service | ✅ 완료 | 100% | 2025.09.16 |
| Phase 3: API Gateway | 🔄 다음 | 0% | - |
| Phase 4: 핵심 서비스 | ⏳ 대기 | 0% | - |
| Phase 5: 프론트엔드 | ⏳ 대기 | 0% | - |

**전체 진행률**: 35% 완료

---

**🎯 현재 목표**: API Gateway Service 구현으로 마이크로서비스 아키텍처의 중앙 허브 완성
**🔗 참고**: Auth Service가 완전한 구현 사례로 활용 가능
**📅 최종 업데이트**: 2025.09.16

## 라이센스

Private Repository