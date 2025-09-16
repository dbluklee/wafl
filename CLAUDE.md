# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 이름
**WAFL**

## 프로젝트 개요
**AI POS System** - AI Agent 기반 차세대 외식업 주문결제 시스템

## 현재 상태 (Current State)
**✅ Database 구축 완료! (Phase 1 - Week 1-2 완료, Week 3 시작 준비)**

### 🎯 완료된 작업 (2024.09.16 업데이트)

#### ✅ 1. 프로젝트 초기 설정 완료
- [x] Git 레포지토리 연결 (사용자가 완료)
- [x] 모노레포 구조 설정 완료
- [x] Docker 환경 구성 완료
- [x] TypeScript 설정 완료
- [x] ESLint/Prettier 설정 완료
- [x] Git hooks (Husky) 설정 완료

#### ✅ 2. Database 구축 완료 (NEW! 2024.09.16)
- [x] Prisma ORM 완전 설정 (backend/shared/database/)
- [x] 완전한 스키마 작성 (14개 테이블, 7개 Enum)
- [x] Database Client 싱글톤 패턴 구현
- [x] 유틸리티 함수 작성 (트랜잭션, 페이지네이션, 히스토리)
- [x] Demo 매장 및 테스트 데이터 삽입 완료
- [x] TypeScript 타입 완전 통합
- [x] 데이터베이스 연결 및 기능 검증 완료

### 📁 현재 프로젝트 구조 (업데이트됨)
```
wafl/
├── backend/
│   ├── core/                    # 핵심 서비스 (6개) - 디렉토리만 생성됨
│   │   ├── auth-service/        # 🎯 다음 구현 대상
│   │   ├── store-management-service/
│   │   ├── dashboard-service/
│   │   ├── order-service/
│   │   ├── user-profile-service/
│   │   └── history-service/
│   ├── support/                 # 지원 서비스 (10개) - 디렉토리만 생성됨
│   │   ├── api-gateway/
│   │   ├── payment-service/
│   │   ├── ai-service/
│   │   ├── analytics-service/
│   │   ├── notification-service/
│   │   ├── scraping-service/
│   │   ├── qr-service/
│   │   ├── inventory-service/
│   │   ├── delivery-service/
│   │   └── hardware-service/
│   └── shared/                  # 공유 모듈 - 완전 구현됨 ✅
│       ├── types/
│       │   └── index.ts         # Prisma + 기존 타입 Export
│       ├── utils/
│       │   └── index.ts         # 공통 유틸리티 완료
│       └── database/            # ✅ 완전 구현됨 (NEW!)
│           ├── src/
│           │   ├── index.ts     # Prisma Client 싱글톤
│           │   └── utils.ts     # DB 유틸리티 함수
│           ├── prisma/
│           │   ├── schema.prisma # 완전한 스키마 (14 테이블)
│           │   └── seed.ts      # 시드 데이터
│           ├── dist/            # 컴파일된 파일
│           ├── package.json     # @shared/database
│           ├── tsconfig.json
│           ├── .env/.env.docker
│           └── manual-migration.sql
├── frontend/                    # 프론트엔드 서비스 (3개) - 디렉토리만 생성됨
│   ├── pos-admin-web/
│   ├── qr-order-web/
│   └── kitchen-display-web/
├── docker/                      # Docker 설정 - 완료 ✅
│   ├── docker-compose.yml       # 19개 서비스 전체 구성
│   ├── docker-compose.dev.yml   # 개발환경 오버라이드
│   ├── docker-compose.prod.yml  # 프로덕션 오버라이드
│   └── .env.example             # 환경변수 템플릿
├── scripts/                     # 스크립트 - 일부 완료 ✅
│   ├── init-db.sh              # DB 초기화 스크립트
│   └── health-check.sh         # 헬스체크 스크립트
├── nginx/                       # Nginx 설정 - 빈 디렉토리
├── .husky/                      # Git hooks - 완료 ✅
│   ├── pre-commit              # lint-staged 실행
│   ├── commit-msg              # 커밋 메시지 형식 검증
│   └── pre-push                # 타입체크 & 테스트
├── 설정 파일들 - 완료 ✅
│   ├── package.json            # 모노레포 워크스페이스 설정
│   ├── tsconfig.json           # TypeScript 기본 설정
│   ├── tsconfig.backend.json   # 백엔드용 TS 설정
│   ├── tsconfig.frontend.json  # 프론트엔드용 TS 설정
│   ├── .eslintrc.js            # ESLint 설정 (네이밍 컨벤션 포함)
│   ├── .prettierrc.js          # Prettier 설정
│   ├── .lintstagedrc.js        # lint-staged 설정
│   ├── Makefile                # Docker 관리 명령어
│   └── README.md               # 프로젝트 README
```

## 🗃️ Database 상세 정보 (NEW!)

### 📊 데이터베이스 구조
```
✅ PostgreSQL 15 + Prisma ORM
├── 14개 테이블 완전 구현
│   ├── stores (매장 정보)
│   ├── users (점주/직원, PIN 로그인)
│   ├── categories (메뉴 카테고리)
│   ├── menus (메뉴 정보)
│   ├── places (층/구역)
│   ├── tables (테이블, QR 코드)
│   ├── customers (고객 세션)
│   ├── orders (주문)
│   ├── order_items (주문 상세)
│   ├── payments (결제)
│   ├── history_logs (Undo/Redo용 로그)
│   ├── ai_conversations (AI 대화 기록)
│   ├── analytics_daily (일일 매출 분석)
│   └── sms_verifications (SMS 인증)
├── 7개 Enum 타입
│   ├── user_role (owner, staff)
│   ├── subscription_status (trial, active, suspended)
│   ├── table_status (empty, seated, ordered)
│   ├── order_status (pending, confirmed, cooking, ready, served, cancelled)
│   ├── payment_method (mobile, card, cash)
│   ├── payment_status (pending, completed, failed, refunded)
│   └── ai_conversation_type (customer, owner)
└── Demo 데이터 완료
    ├── 1개 매장 (store_code: 1001)
    ├── 2명 사용자 (PIN: 1234, 5678)
    ├── 5개 카테고리 (메인요리, 사이드, 음료, 디저트, 주류)
    ├── 18개 메뉴 (각 카테고리별 3-6개)
    ├── 3개 장소 (1층, 2층, 테라스)
    └── 21개 테이블 (QR 코드 포함)
```

### 🛠️ Database 사용 가능한 명령어
```bash
# Database 작업 (backend/shared/database/)
cd backend/shared/database

npm run generate     # Prisma 클라이언트 생성
npm run build        # TypeScript 컴파일
npm run studio       # Prisma Studio (GUI)
npm run migrate      # 마이그레이션 실행 (향후)
npm run seed         # 시드 데이터 삽입 (향후)
npm run reset        # 데이터베이스 초기화 (향후)

# 검증용 스크립트
npx ts-node verify-database.ts  # 연결 및 기능 테스트

# 코드 품질 도구 (프로젝트 루트)
npm run lint          # ESLint 검사 및 자동 수정
npm run lint:check    # ESLint 검사만
npm run format        # Prettier 포맷팅
npm run format:check  # Prettier 검사만
npm run type-check    # TypeScript 타입 검사

# Docker 관리 (아직 서비스 구현 전이므로 실행 불가)
make help            # 사용 가능한 명령어 확인
make build           # 전체 이미지 빌드 (서비스 구현 후)
make dev             # 개발 모드 시작 (서비스 구현 후)
make up              # 전체 서비스 시작 (서비스 구현 후)
make down            # 전체 서비스 중지
make health          # 헬스체크 (서비스 구현 후)
```

### 💾 Database 접속 정보
```bash
# 로컬 개발 환경
DATABASE_URL="postgresql://postgres@localhost:5432/aipos?schema=public"

# Docker 환경 (향후)
DATABASE_URL="postgresql://postgres:password@postgres:5432/aipos?schema=public"

# 현재 사용 중인 PostgreSQL 컨테이너
Container: database-postgres-1 (포트 5432)
Database: aipos (생성 완료)
User: postgres (패스워드 없음)
```

### 🔧 개발 환경 설정 상태 (업데이트)
- ✅ Node.js 워크스페이스 설정 완료
- ✅ TypeScript strict 모드 활성화
- ✅ ESLint 네이밍 컨벤션 적용 (I/T/E 접두사)
- ✅ Git hooks 자동화 설정
- ✅ 공유 타입 시스템 구축 + Prisma 타입 통합
- ✅ Docker 전체 서비스 구성 완료
- ✅ **Database 완전 구축 완료** (NEW!)
- ✅ **Prisma ORM 완전 통합** (NEW!)

### ⚠️ 현재 상황 및 다음 단계
1. **✅ Database 구축 완료** - Prisma + PostgreSQL 완전 작동
2. **🎯 다음 우선 작업**: Auth Service 구현 (backend/core/auth-service/)
3. **Docker 서비스 실행**: 아직 개별 서비스 Dockerfile 미구현
4. **API Gateway**: Auth Service 완료 후 구현 예정

### 📊 진행률 (업데이트)
- **Phase 1 (Week 1-2)**: 100% 완료 ✅
  - 프로젝트 초기 설정: ✅ 완료
  - Docker 인프라 구축: ✅ 완료
  - Database 구축: ✅ 완료 (NEW!)
- **Phase 2 (Week 3 시작)**: 준비 완료 🚀
  - Auth Service 구현: 🎯 다음 작업
  - Store Management Service: ⏳ 대기중
  - API Gateway 구현: ⏳ 대기중

## 🔍 개발 과정에서 주요 기술적 결정사항

### TypeScript 설정
- **Strict Mode 활성화**: 모든 서비스에서 타입 안정성 보장
- **Path Mapping 설정**: `@shared/*` 경로로 공유 모듈 접근
- **서비스별 tsconfig 분리**: backend/frontend 각각 최적화된 설정
- **빌드 타겟**: Backend ES2022/CommonJS, Frontend ES2020/ESNext

### 네이밍 컨벤션 적용 (강제 규칙)
```typescript
// Interface: I 접두사
interface IUser { id: string; name: string; }

// Type Alias: T 접두사
type TOrderStatus = 'pending' | 'confirmed';

// Enum: E 접두사
enum EUserRole { OWNER = 'owner' }

// 상수: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
```

### Docker 아키텍처 결정사항
- **네트워크**: 커스텀 브리지 네트워크 (172.20.0.0/16)
- **볼륨**: 데이터 영속성을 위한 named volumes
- **헬스체크**: 모든 서비스에 30초 간격 헬스체크 적용
- **개발환경**: hot-reload용 볼륨 마운트 설정
- **프로덕션**: 리소스 제한 및 복제 설정

### 공유 모듈 구조
- **types/**: 전체 시스템 타입 정의 (완료)
- **utils/**: 공통 유틸리티 함수 (완료)
- **database/**: Prisma 스키마 및 DB 유틸리티 (미구현)

### Git 워크플로우 설정
- **pre-commit**: ESLint + Prettier 자동 실행
- **commit-msg**: 커밋 메시지 형식 강제 (type(scope): description)
- **pre-push**: TypeScript 검사 + 테스트 실행

## 🚨 신규 Claude Code 인스턴스를 위한 체크리스트

새로운 Claude Code 세션이 시작될 때 반드시 확인해야 할 사항들:

### 1. 프로젝트 상태 파악
```bash
# 현재 디렉토리 구조 확인
tree -d -L 3

# 설치된 의존성 확인
npm list --depth=0

# Git 상태 확인
git status
```

### 2. 개발 도구 작동 확인
```bash
# 코드 품질 도구 테스트
npm run lint:check
npm run format:check
npm run type-check

# Make 명령어 확인
make help
```

### 3. 현재 구현 상태 확인 (업데이트됨)
- [x] `backend/shared/types/index.ts` - ✅ 타입 정의 완료 + Prisma 타입 통합
- [x] `backend/shared/utils/index.ts` - ✅ 유틸리티 함수 완료
- [x] `backend/shared/database/` - ✅ **완전 구현됨** (NEW!)
  - [x] Prisma 스키마 (14 테이블, 7 Enum)
  - [x] Database Client 싱글톤
  - [x] 유틸리티 함수
  - [x] Demo 데이터 삽입 완료
- [x] `docker/` 디렉토리 - ✅ Docker 설정 파일들 존재
- [ ] 개별 서비스 디렉토리들 - 아직 구현되지 않음 (디렉토리만 존재)

### 4. Database 상태 확인 (NEW!)
```bash
# Database 연결 확인
cd backend/shared/database
npx ts-node verify-database.ts

# 데이터 확인 (PostgreSQL 컨테이너 내부)
docker exec database-postgres-1 psql -U postgres -d aipos -c "
  SELECT
    (SELECT COUNT(*) FROM stores) as stores,
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM menus) as menus,
    (SELECT COUNT(*) FROM tables) as tables;"

# 예상 결과: stores: 1, users: 2, menus: 18, tables: 21
```

### 5. 다음 작업 우선순위 (업데이트됨)
1. **✅ Database 구축** - 완료!
2. **🎯 Auth Service 구현** - 다음 우선 작업 (backend/core/auth-service/)
   - JWT 인증 시스템
   - PIN 로그인 (매장코드 + PIN)
   - 모바일 SMS 인증
3. **API Gateway 구현** - Auth Service 완료 후
4. **Store Management Service** - 매장 관리 기능

## 즉시 필요한 작업 (Immediate Tasks) - ⚠️ 업데이트됨

### ~~1. 프로젝트 초기 설정~~ ✅ 완료 (2024.09.16)

### 2. 다음 우선 작업: Database 구축
```bash
# Prisma 설치 및 초기화
cd backend/shared/database
npm init -y
npm install prisma @prisma/client
npx prisma init

# 스키마 작성 후 마이그레이션
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Auth Service 구현 시작
```bash
# Auth Service 디렉토리로 이동
cd backend/core/auth-service

# 기본 설정
npm init -y
npm install express cors helmet morgan bcrypt jsonwebtoken
npm install -D @types/express @types/cors @types/bcrypt @types/jsonwebtoken

# Dockerfile 및 기본 구조 생성
touch Dockerfile package.json src/index.ts src/routes/auth.ts
```

## 🔧 현재 사용 가능한 개발 명령어

### 코드 품질 관리
```bash
# 전체 프로젝트 린트 및 포맷
npm run lint           # ESLint 자동 수정
npm run format         # Prettier 포맷팅
npm run type-check     # TypeScript 검사

# 개발 도구 상태 확인
npm run lint:check     # 린트 오류만 확인
npm run format:check   # 포맷 오류만 확인
```

### Git 작업 흐름
```bash
# 커밋 전 자동 검증 (Husky가 자동 실행)
git add .
git commit -m "feat(auth): JWT 인증 구현"  # 형식 자동 검증
git push  # 타입체크 및 테스트 자동 실행
```

### Docker 환경 (서비스 구현 후 사용 가능)
```bash
# Docker 명령어 확인
make help

# 인프라만 시작 (PostgreSQL, Redis, RabbitMQ)
docker-compose -f docker/docker-compose.yml up postgres redis rabbitmq

# 전체 환경 시작 (서비스 구현 완료 후)
make dev    # 개발 모드
make up     # 전체 서비스
make down   # 서비스 중지
make health # 헬스체크
```

### 프로젝트 상태 확인
```bash
# 구조 확인
tree -d -L 3

# 의존성 확인
npm list --depth=0

# Git 상태
git status

# 파일 존재 확인
ls -la backend/shared/types/
ls -la backend/shared/utils/
ls -la docker/
```
mkdir -p backend/{core,support,shared}
mkdir -p backend/shared/{types,utils,database}

# Git 초기화 (아직 안 되어있다면)
git init
git add .
git commit -m "Initial commit with project planning"

# 기본 환경 파일 생성
touch docker/.env.example
touch docker/docker-compose.yml
touch docker/docker-compose.dev.yml
touch Makefile
touch .gitignore
```

### 2. 개발 환경 체크
```bash
# 필수 도구 확인
docker --version          # Docker 24.0+ 필요
docker-compose --version  # Docker Compose 2.20+ 필요
node --version            # Node.js 20 LTS 필요
```

### 핵심 가치
- B2B2C 서비스: 점주와 고객 모두를 위한 AI 기반 POS
- 온라인 원스톱 가입: 3일 내 서비스 시작
- 메뉴 자동 스크래핑: 네이버 플레이스 URL만으로 메뉴 자동 등록
- AI 경영 컨설팅: GPT-4 기반 매출 분석 및 경영 조언
- 다국어 지원: 30개 언어 실시간 번역

## 아키텍처 - 완전한 Docker 마이크로서비스

### 🐳 Docker 기반 19개 서비스 구성
모든 서비스는 독립적인 Docker 컨테이너로 실행되며, docker-compose로 오케스트레이션됩니다.

```yaml
# 전체 서비스 구조
services:
  # Infrastructure (3)
  - postgres:5432
  - redis:6379
  - rabbitmq:5672/15672
  
  # Backend Services (16)
  - api-gateway:3000
  - auth-service:3001
  - store-management-service:3002
  - dashboard-service:3003
  - order-service:3004
  - payment-service:3005
  - ai-service:3006
  - analytics-service:3007
  - notification-service:3008
  - user-profile-service:3009
  - history-service:3010
  - scraping-service:3011
  - qr-service:3012
  - inventory-service:3013
  - delivery-service:3014
  - hardware-service:3015
  
  # Frontend Services (3)
  - pos-admin-web:4000
  - qr-order-web:4001
  - kitchen-display-web:4002
  
  # Reverse Proxy (1)
  - nginx:80/443
```

### 서비스 간 통신
```javascript
// 1. HTTP REST API (동기)
const authServiceUrl = 'http://auth-service:3001';
const response = await axios.get(`${authServiceUrl}/api/v1/users`);

// 2. RabbitMQ (비동기)
await channel.publish('orders', 'order.created', Buffer.from(JSON.stringify(data)));

// 3. Redis Pub/Sub (실시간)
redis.publish('table:status:changed', JSON.stringify({tableId, status}));

// 4. WebSocket (클라이언트)
socket.emit('order:new', orderData);
```

## 기술 스택

### Frontend
```javascript
- Framework: React 18 + TypeScript 5
- Styling: TailwindCSS 3
- State: Redux Toolkit / Zustand
- HTTP Client: Axios
- WebSocket: Socket.io-client
- Build: Vite
- Container: Nginx Alpine
```

### Backend
```javascript
- Runtime: Node.js 20 LTS
- Framework: Express 4 + TypeScript 5
- ORM: Prisma 5
- Auth: JWT + Redis Session
- Queue: RabbitMQ
- WebSocket: Socket.io
- AI: OpenAI GPT-4 API
- Container: Node Alpine
```

### Infrastructure
```yaml
- Database: PostgreSQL 15 Alpine
- Cache: Redis 7 Alpine
- Message Queue: RabbitMQ 3 Management Alpine
- Reverse Proxy: Nginx Alpine
- Container Runtime: Docker 24
- Orchestration: Docker Compose 3.8
```

## 프로젝트 구조 (Docker 기반)

```
pos-system/
├── docker/
│   ├── docker-compose.yml          # 메인 구성
│   ├── docker-compose.dev.yml      # 개발 오버라이드
│   ├── docker-compose.prod.yml     # 프로덕션 오버라이드
│   └── .env.example                # 환경변수 템플릿
│
├── frontend/
│   ├── pos-admin-web/
│   │   ├── Dockerfile              # 멀티스테이지 빌드
│   │   ├── .dockerignore
│   │   ├── nginx.conf              # Nginx 설정
│   │   ├── src/
│   │   └── package.json
│   ├── qr-order-web/
│   └── kitchen-display-web/
│
├── backend/
│   ├── core/                       # 핵심 서비스 (10개)
│   │   ├── auth-service/
│   │   │   ├── Dockerfile
│   │   │   ├── .dockerignore
│   │   │   ├── src/
│   │   │   ├── healthcheck.js
│   │   │   └── package.json
│   │   └── [기타 9개 서비스]
│   │
│   ├── support/                    # 지원 서비스 (6개)
│   │   ├── api-gateway/
│   │   └── [기타 5개 서비스]
│   │
│   └── shared/                     # 공유 모듈
│       ├── types/                  # TypeScript 타입
│       ├── utils/                  # 공통 유틸
│       └── database/               # DB 스키마
│
├── nginx/
│   ├── Dockerfile
│   ├── nginx.conf                  # 리버스 프록시 설정
│   └── ssl/                        # SSL 인증서
│
├── scripts/
│   ├── init-db.sh                  # DB 초기화
│   ├── seed-data.sh                # 시드 데이터
│   ├── health-check.sh             # 헬스체크
│   └── backup.sh                   # 백업 스크립트
│
├── Makefile                        # 개발 편의 명령어
└── README.md
```

## Docker 개발 환경

### 시스템 요구사항
```yaml
최소 사양:
  - CPU: 4 cores
  - RAM: 16GB
  - Storage: 20GB
  - Docker: 24.0+
  - Docker Compose: 2.20+

권장 사양:
  - CPU: 8 cores
  - RAM: 32GB
  - Storage: 50GB SSD
```

### 개발 시작 명령어
```bash
# 1. 프로젝트 클론
git clone https://github.com/your-org/pos-system.git
cd pos-system

# 2. 환경변수 설정
cp docker/.env.example docker/.env
# .env 파일 수정 (API 키 등)

# 3. 전체 서비스 빌드 (병렬 빌드)
make build

# 4. 개발 모드 시작 (hot-reload 활성화)
make dev

# 5. 데이터베이스 초기화
make migrate
make seed

# 6. 헬스체크
make health

# 7. 로그 확인
make logs
```

### Makefile 명령어
```makefile
make up          # 전체 서비스 시작
make down        # 전체 서비스 중지
make dev         # 개발 모드 (hot-reload)
make prod        # 프로덕션 모드
make build       # 전체 이미지 빌드
make logs        # 전체 로그 확인
make clean       # 볼륨 삭제
make reset       # 완전 초기화
make health      # 헬스체크
make restart service=auth-service  # 특정 서비스 재시작
make scale service=ai-service count=3  # 서비스 스케일링
```

## 서비스별 Dockerfile 템플릿

### Backend Service Dockerfile
```dockerfile
# 멀티스테이지 빌드
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node healthcheck.js
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### Frontend Service Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 환경변수 관리

### .env 구조
```env
# Environment
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/aipos
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# External Services
OPENAI_API_KEY=sk-...
SMS_API_KEY=...
PG_API_KEY=...

# Service URLs (Docker 내부 통신)
AUTH_SERVICE_URL=http://auth-service:3001
STORE_SERVICE_URL=http://store-management-service:3002
AI_SERVICE_URL=http://ai-service:3006
```

## 서비스 간 의존성 관리

```yaml
# docker-compose.yml
auth-service:
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_started
    rabbitmq:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## 코딩 컨벤션

### TypeScript
```typescript
// 1. Interface는 I 접두사 사용
interface IUser {
  id: string;
  name: string;
}

// 2. Type은 T 접두사 사용
type TOrderStatus = 'pending' | 'confirmed' | 'cooking';

// 3. Enum은 E 접두사 사용
enum EUserRole {
  OWNER = 'owner',
  STAFF = 'staff'
}

// 4. 함수는 동사로 시작
async function createOrder(data: IOrderRequest): Promise<IOrder> {
  // 구현
}

// 5. 상수는 UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
```

### API 응답 형식
```typescript
// 성공 응답
interface IApiResponse<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

// 에러 응답
interface IApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## 핵심 비즈니스 로직

### 1. 이중 인증 시스템
```typescript
// PIN 로그인 (점주/직원)
// 매장코드(4자리) + PIN(4자리)

// 모바일 인증 (점주 신규가입)
// SMS 인증 → 사업자번호 검증 → 자동 가입
```

### 2. 메뉴 자동 스크래핑
```typescript
// 네이버 플레이스 URL → Puppeteer 스크래핑
// → AI 분석 → 자동 카테고리 분류 → DB 저장
```

### 3. AI Agent 통합
```typescript
// RAG + MCP 아키텍처
// 실시간 매장 데이터 + GPT-4 분석
// → 맞춤형 경영 조언
```

### 4. Undo/Redo 시스템
```typescript
// 모든 CRUD 작업 history_logs 테이블에 저장
// oldData, newData JSON 형태로 보관
// 롤백 가능한 작업 표시
```

## 데이터베이스 핵심 테이블

### 인증 관련
- `stores`: 매장 정보 (store_code로 로그인)
- `users`: 점주/직원 (PIN 로그인)
- `customers`: 고객 세션

### 운영 관련
- `categories`: 메뉴 카테고리 (색상 커스터마이징)
- `menus`: 메뉴 정보
- `places`: 층/구역 (색상 커스터마이징)
- `tables`: 테이블 (QR 코드 포함)
- `orders`: 주문
- `order_items`: 주문 상세
- `payments`: 결제

### AI/분석 관련
- `ai_conversations`: AI 대화 기록
- `analytics_daily`: 일일 매출 분석
- `history_logs`: Undo/Redo용 작업 이력

## 주요 API 엔드포인트

### 인증
```
POST /api/v1/auth/stores/register    # 매장 가입
POST /api/v1/auth/login/pin         # PIN 로그인
POST /api/v1/auth/customer/session  # 고객 세션
```

### 매장 관리
```
GET/POST/PUT/DELETE /api/v1/store/categories
GET/POST/PUT/DELETE /api/v1/store/menus
GET/POST/PUT/DELETE /api/v1/store/tables
```

### 주문/결제
```
POST /api/v1/orders                 # 주문 생성
PATCH /api/v1/orders/{id}/status   # 상태 변경
POST /api/v1/payments               # 결제 요청
```

### AI
```
POST /api/v1/ai/agent/chat         # 점주 AI 상담
POST /api/v1/ai/customer/chat      # 고객 AI 챗
```

## WebSocket 이벤트
```javascript
// 주요 이벤트
'order.created'         // 새 주문
'order.status.changed'  // 주문 상태 변경
'table.status.changed'  // 테이블 상태 변경
'payment.completed'     // 결제 완료
```

## 데이터베이스 관리

### 마이그레이션
```bash
# Prisma 마이그레이션
docker-compose exec auth-service npx prisma migrate deploy

# SQL 직접 실행
docker-compose exec postgres psql -U postgres -d aipos
```

### 백업/복구
```bash
# 백업
docker-compose exec postgres pg_dump -U postgres aipos > backup.sql

# 복구
docker-compose exec -T postgres psql -U postgres aipos < backup.sql
```

## 모니터링 및 로깅

### 로그 수집
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스
docker-compose logs -f auth-service

# 로그 레벨 필터
docker-compose logs -f | grep ERROR
```

### 헬스체크 엔드포인트
```javascript
// 각 서비스별 /health 엔드포인트
app.get('/health', async (req, res) => {
  const health = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      rabbitmq: await checkRabbitMQ()
    }
  };
  res.json(health);
});
```

## 개발 팁

### 1. 특정 서비스만 개발
```bash
# auth-service만 개발 모드로
docker-compose up -d postgres redis rabbitmq
cd backend/core/auth-service
npm run dev
```

### 2. 서비스 디버깅
```bash
# 컨테이너 접속
docker-compose exec auth-service sh

# 로그 실시간 확인
docker-compose logs -f auth-service
```

### 3. 네트워크 디버깅
```bash
# 서비스 간 통신 테스트
docker-compose exec auth-service ping store-management-service
docker-compose exec auth-service curl http://store-management-service:3002/health
```

### 4. 볼륨 관리
```bash
# 볼륨 목록
docker volume ls

# 특정 볼륨 삭제
docker volume rm pos-system_postgres-data
```

## 프로덕션 배포 고려사항

### 1. 이미지 태그 관리
```yaml
auth-service:
  image: aipos/auth-service:${VERSION:-latest}
```

### 2. 리소스 제한
```yaml
ai-service:
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 2G
      reservations:
        cpus: '1.0'
        memory: 1G
```

### 3. 로드 밸런싱
```yaml
# 서비스 복제
docker-compose up -d --scale order-service=3
```

### 4. 보안 설정
- 모든 환경변수는 Docker Secrets 사용
- 내부 네트워크 격리
- HTTPS 적용 (Let's Encrypt)

## 문제 해결 가이드

### 포트 충돌
```bash
# 사용 중인 포트 확인
netstat -tulpn | grep LISTEN
lsof -i :3001
```

### 메모리 부족
```bash
# Docker 리소스 정리
docker system prune -a
docker volume prune
```

### 서비스 시작 실패
```bash
# 의존성 순서 확인
docker-compose up postgres redis rabbitmq
docker-compose up auth-service
```

## 개발 시 주의사항

### 1. 트랜잭션 처리
```typescript
// 주문 생성 시 재고 감소와 함께 트랜잭션 처리
// Prisma $transaction 사용
```

### 2. 실시간 동기화
```typescript
// Redis Pub/Sub + Socket.io로 실시간 상태 동기화
// 테이블 상태, 주문 상태 등
```

### 3. 다국어 처리
```typescript
// Accept-Language 헤더 기반 자동 번역
// GPT-4 API 활용, 캐싱 필수
```

### 4. Rate Limiting
```typescript
// AI API: 100 req/hour/store
// Scraping: 10 req/hour/store
// General: 1000 req/hour/IP
```

---

# TODO LIST - 📅 최종 업데이트 (2024.09.16)

## ✅ 완료된 작업들

### Phase 1: 기초 인프라 (100% 완료) ✅
- [x] **프로젝트 초기 설정** ✅ 완료 (2024.09.16)
  - [x] Git 레포지토리 연결 (사용자 완료)
  - [x] 모노레포 구조 설정 (19개 서비스 디렉토리 생성)
  - [x] Docker 환경 구성 (docker-compose 3개 파일)
  - [x] TypeScript 설정 (3개 설정 파일 + 공유 타입)
  - [x] ESLint/Prettier 설정 (네이밍 컨벤션 적용)
  - [x] Git hooks (Husky) (pre-commit, commit-msg, pre-push)

- [x] **Docker 인프라 구축** ✅ 완료 (2024.09.16)
  - [x] docker-compose.yml 작성 (19개 서비스 전체 구성)
  - [x] docker-compose.dev.yml 작성 (개발환경 오버라이드)
  - [x] docker-compose.prod.yml 작성 (프로덕션 설정)
  - [x] PostgreSQL Docker 설정 (헬스체크 포함)
  - [x] Redis Docker 설정 (영속성 설정)
  - [x] RabbitMQ Docker 설정 (관리 UI 포함)
  - [x] Nginx Docker 설정 (리버스 프록시)
  - [x] Makefile 작성 (17개 관리 명령어)

- [x] **Database 완전 구축** ✅ 완료 (2024.09.16) - NEW!
  - [x] Prisma 초기 설정 및 패키지 설치
  - [x] 환경변수 설정 (.env 및 .env.docker)
  - [x] 완전한 Prisma Schema 작성 (14개 테이블, 7개 Enum)
  - [x] Database Client 싱글톤 패턴 구현
  - [x] 유틸리티 함수 작성 (트랜잭션, 페이지네이션, 히스토리)
  - [x] Seed 데이터 작성 및 삽입 (Demo 매장 완료)
  - [x] Package.json 설정 및 스크립트 구성
  - [x] 마이그레이션 생성 및 적용
  - [x] 타입 Export 설정 (backend/shared/types/index.ts)
  - [x] 연결 테스트 및 검증 완료

## 🎯 다음 단계 작업들 (Phase 2: Week 3-4)

### 🔥 최우선 작업: Auth Service 구현
**위치**: `backend/core/auth-service/` (포트 3001)

- [ ] **프로젝트 초기 설정**
  - [ ] package.json 및 dependencies 설치
  - [ ] TypeScript 설정
  - [ ] Dockerfile 작성 (멀티스테이지 빌드)
  - [ ] 공유 모듈 연결 (@shared/database, @shared/types)

- [ ] **Core 인증 시스템**
  - [ ] Express 서버 설정 + middleware
  - [ ] Prisma Database 연결
  - [ ] JWT 토큰 시스템 구현
  - [ ] Redis 세션 관리
  - [ ] 비밀번호 해싱 (bcrypt)

- [ ] **API Endpoints 구현**
  - [ ] POST `/api/v1/auth/stores/register` - 매장 가입
  - [ ] POST `/api/v1/auth/login/pin` - PIN 로그인 (매장코드+PIN)
  - [ ] POST `/api/v1/auth/login/mobile` - 모바일 SMS 인증
  - [ ] POST `/api/v1/auth/customer/session` - 고객 세션 생성 (QR 주문용)
  - [ ] POST `/api/v1/auth/refresh` - 토큰 갱신
  - [ ] POST `/api/v1/auth/logout` - 로그아웃
  - [ ] GET `/api/v1/auth/me` - 현재 사용자 정보
  - [ ] GET `/health` - 헬스체크

- [ ] **검증 및 테스트**
  - [ ] Jest + Supertest 테스트 설정
  - [ ] API 테스트 코드 작성
  - [ ] 에러 핸들링 완성
  - [ ] Docker 컨테이너 테스트

### Week 3-4: 핵심 서비스
- [ ] **Store Management Service (포트 3002)**
  - [ ] Dockerfile 작성
  - [ ] 카테고리 CRUD API
  - [ ] 메뉴 CRUD API
  - [ ] 장소 CRUD API
  - [ ] 테이블 CRUD API
  - [ ] 색상 커스터마이징
  - [ ] 테스트 코드

- [ ] **Dashboard Service (포트 3003)**
  - [ ] Dockerfile 작성
  - [ ] 실시간 현황 API
  - [ ] 테이블 상태 관리
  - [ ] POS 로그 API
  - [ ] WebSocket 연동
  - [ ] Redis 캐싱

- [ ] **API Gateway (포트 3000)**
  - [ ] Dockerfile 작성
  - [ ] 라우팅 설정
  - [ ] 인증 미들웨어
  - [ ] Rate Limiting
  - [ ] 로드 밸런싱

- [ ] **POS Admin Web 기본 UI (포트 4000)**
  - [ ] Dockerfile 작성
  - [ ] React 프로젝트 설정
  - [ ] 라우팅 구조
  - [ ] 로그인 화면
  - [ ] 홈페이지 (4개 카드)
  - [ ] 공통 컴포넌트

### Week 5-6: 주문 시스템
- [ ] **Order Service (포트 3004)**
  - [ ] Dockerfile 작성
  - [ ] 주문 생성 API
  - [ ] 주문 조회 API
  - [ ] 상태 변경 API
  - [ ] 주문 취소 API
  - [ ] RabbitMQ 이벤트

- [ ] **History Service (포트 3010)**
  - [ ] Dockerfile 작성
  - [ ] 작업 로그 저장
  - [ ] Undo API
  - [ ] Redo API
  - [ ] 이력 조회 API

- [ ] **User Profile Service (포트 3009)**
  - [ ] Dockerfile 작성
  - [ ] 프로필 조회/수정
  - [ ] 직원 관리 API
  - [ ] 설정 관리

- [ ] **Notification Service (포트 3008)**
  - [ ] Dockerfile 작성
  - [ ] WebSocket 서버
  - [ ] 이벤트 브로드캐스트
  - [ ] 알림 관리

### Week 7-8: UI 완성 및 통합
- [ ] **POS Admin Web 완성**
  - [ ] Dashboard 화면
  - [ ] Management 화면
  - [ ] 실시간 업데이트
  - [ ] Undo/Redo UI
  - [ ] 반응형 디자인

- [ ] **통합 테스트**
  - [ ] 서비스 간 통신 테스트
  - [ ] E2E 테스트
  - [ ] 성능 테스트
  - [ ] 버그 수정

- [ ] **Docker 최적화**
  - [ ] 이미지 크기 최적화
  - [ ] 빌드 캐시 활용
  - [ ] 멀티스테이지 빌드 검증

## Phase 2: 고객 기능 (4주)

### Week 9-10: QR 주문
- [ ] **QR Service (포트 3012)**
  - [ ] Dockerfile 작성
  - [ ] QR 생성/갱신
  - [ ] QR 검증
  - [ ] E-paper 연동

- [ ] **QR Order Web (포트 4001)**
  - [ ] Dockerfile 작성
  - [ ] 메뉴 브라우징
  - [ ] 장바구니
  - [ ] 주문 화면
  - [ ] 다국어 지원

### Week 11-12: 결제 및 알림
- [ ] **Payment Service (포트 3005)**
  - [ ] Dockerfile 작성
  - [ ] PG 연동
  - [ ] 결제 처리
  - [ ] 영수증 발행
  - [ ] 환불 처리

## Phase 3: AI 통합 (8주)

### Week 13-16: AI 서비스
- [ ] **AI Service (포트 3006)**
  - [ ] Dockerfile 작성
  - [ ] OpenAI API 연동
  - [ ] RAG 시스템 구축
  - [ ] MCP 서버 구현
  - [ ] 점주 AI Agent
  - [ ] 고객 AI 챗
  - [ ] 메뉴 번역
  - [ ] 추천 시스템

### Week 17-20: 분석 및 스크래핑
- [ ] **Analytics Service (포트 3007)**
  - [ ] Dockerfile 작성
  - [ ] 매출 분석
  - [ ] 트렌드 분석
  - [ ] AI 제안 생성
  - [ ] 리포트 생성

- [ ] **Scraping Service (포트 3011)**
  - [ ] Dockerfile 작성
  - [ ] Puppeteer 설정
  - [ ] 네이버 파서
  - [ ] 구글 파서
  - [ ] 자동 동기화

## Phase 4: 확장 기능 (4주)

### Week 21-24: 부가 서비스
- [ ] **Kitchen Display Web (포트 4002)**
  - [ ] Dockerfile 작성
  - [ ] 주문 표시
  - [ ] 타이머 기능
  - [ ] 완료 알림

- [ ] **Inventory Service (포트 3013)**
  - [ ] Dockerfile 작성
  - [ ] 재고 관리
  - [ ] 자동 발주
  - [ ] 재고 알림

- [ ] **Delivery Service (포트 3014)**
  - [ ] Dockerfile 작성
  - [ ] 배달앱 연동
  - [ ] 주문 동기화
  - [ ] 배달 추적

- [ ] **Hardware Service (포트 3015)**
  - [ ] Dockerfile 작성
  - [ ] 프린터 제어
  - [ ] 카드리더 연동
  - [ ] E-paper 제어

## 체크포인트

### 코드 품질
- [ ] 테스트 커버리지 80% 이상
- [ ] TypeScript strict mode
- [ ] 모든 API 문서화
- [ ] 에러 핸들링 완성
- [ ] 로깅 시스템 구축

### 성능 목표
- [ ] API 응답시간 < 200ms
- [ ] WebSocket 레이턴시 < 100ms
- [ ] 동시접속 1000명 처리
- [ ] Docker 이미지 < 100MB

### 보안
- [ ] SQL Injection 방어
- [ ] XSS/CSRF 방어
- [ ] Rate Limiting
- [ ] 암호화 통신 (HTTPS)
- [ ] Docker 보안 스캔

### DevOps
- [ ] CI/CD 파이프라인
- [ ] 자동 테스트
- [ ] 자동 배포
- [ ] 모니터링 대시보드
- [ ] 로그 수집 시스템

---

## 📋 개발 체크리스트 (새로운 세션 시작 시)

새로운 Claude Code 인스턴스에서 작업을 시작할 때 다음 순서로 진행하세요:

### 1. 프로젝트 상태 확인
```bash
cd /home/wk/projects/wafl
pwd  # 현재 위치 확인
ls -la  # 파일 구조 확인
```

### 2. Database 상태 확인
```bash
# PostgreSQL 컨테이너 확인
docker ps | grep postgres

# Database 데이터 확인
docker exec database-postgres-1 psql -U postgres -d aipos -c "
  SELECT
    (SELECT COUNT(*) FROM stores) as stores,
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM menus) as menus,
    (SELECT COUNT(*) FROM tables) as tables;"

# 예상 결과: stores: 1, users: 2, menus: 18, tables: 21
```

### 3. 공유 모듈 상태 확인
```bash
# Database 모듈 확인
cd backend/shared/database
ls -la src/ prisma/
npm list --depth=0

# Types 모듈 확인
cd ../types
cat index.ts | head -20
```

### 4. 다음 작업 위치로 이동
```bash
# Auth Service 개발 시작
cd backend/core/auth-service
ls -la  # 현재 비어있는 상태여야 함
```

### 5. 현재 개발 상태 요약
- ✅ **Database**: 완전 구축 완료 (Prisma + PostgreSQL)
- ✅ **공유 모듈**: types, utils, database 모두 완료
- 🎯 **다음 작업**: Auth Service 구현 (backend/core/auth-service/)
- ⏳ **대기 중**: 16개 나머지 서비스

---

**최종 업데이트**: 2024.09.16 - Database 완전 구축 완료, Auth Service 구현 준비 완료

이 CLAUDE.md는 완전한 Database 구축 완료를 반영하여 업데이트되었습니다. 새로운 Claude Code 세션에서도 동일한 환경에서 개발을 계속할 수 있도록 모든 정보를 포함했습니다.