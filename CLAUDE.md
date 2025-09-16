# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 이름
**WAFL**

## 프로젝트 개요
**AI POS System** - AI Agent 기반 차세대 외식업 주문결제 시스템

## 현재 상태 (Current State)
**⚠️ PROJECT PLANNING PHASE ⚠️**

이 프로젝트는 현재 기획 단계에 있으며, 아래에 설명된 Docker 마이크로서비스 아키텍처는 아직 구현되지 않았습니다. 현재 디렉토리에는 계획 문서만 존재합니다.

**현재 존재하는 파일:**
- `CLAUDE.md` - 이 프로젝트 계획 및 아키텍처 문서

**다음 단계:** Phase 1의 "프로젝트 초기 설정" 작업부터 시작해야 합니다.

## 즉시 필요한 작업 (Immediate Tasks)

### 1. 프로젝트 초기 설정
```bash
# 디렉토리 구조 생성
mkdir -p {docker,frontend,backend,nginx,scripts}
mkdir -p frontend/{pos-admin-web,qr-order-web,kitchen-display-web}
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

# TODO LIST

## Phase 1: MVP (8주)

### Week 1-2: 기초 인프라
- [ ] **프로젝트 초기 설정**
  - [ ] Git 레포지토리 생성
  - [ ] 모노레포 구조 설정
  - [ ] Docker 환경 구성
  - [ ] TypeScript 설정
  - [ ] ESLint/Prettier 설정
  - [ ] Git hooks (Husky)

- [ ] **Docker 인프라 구축**
  - [ ] docker-compose.yml 작성
  - [ ] docker-compose.dev.yml 작성
  - [ ] PostgreSQL Docker 설정
  - [ ] Redis Docker 설정
  - [ ] RabbitMQ Docker 설정
  - [ ] Nginx Docker 설정
  - [ ] Makefile 작성

- [ ] **Database 구축**
  - [ ] DDL 스크립트 실행
  - [ ] Prisma 스키마 생성
  - [ ] 마이그레이션 설정
  - [ ] 시드 데이터 작성

- [ ] **Auth Service (포트 3001)**
  - [ ] Dockerfile 작성
  - [ ] Express 서버 설정
  - [ ] JWT 미들웨어
  - [ ] PIN 로그인 API
  - [ ] 모바일 인증 API
  - [ ] 매장 가입 API
  - [ ] 고객 세션 API
  - [ ] 헬스체크 엔드포인트
  - [ ] 테스트 코드

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

이 CLAUDE.md는 Docker 기반 완전한 마이크로서비스 아키텍처를 반영하여 업데이트되었습니다. Claude Code가 프로젝트의 Docker 구조를 이해하고 일관된 개발을 할 수 있도록 상세한 정보를 포함했습니다.