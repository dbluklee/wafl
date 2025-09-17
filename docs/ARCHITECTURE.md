# WAFL 아키텍처 문서

## 핵심 가치
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
  - api-gateway:4000        # ✅ 완전 구현됨 (중앙 라우팅 허브)
  - auth-service:4001       # ✅ 완전 구현됨 (인증/권한 관리)
  - store-management-service:4002  # 📈 다음 우선 구현 대상
  - dashboard-service:4003         # ⚠️ 구현 대기
  - order-service:4004             # ⚠️ 구현 대기
  - payment-service:4005
  - ai-service:4006
  - analytics-service:4007
  - notification-service:4008
  - user-profile-service:4009
  - history-service:4010
  - scraping-service:4011
  - qr-service:4012
  - inventory-service:4013
  - delivery-service:4014
  - hardware-service:4015

  # Frontend Services (3)
  - pos-admin-web:5000
  - qr-order-web:5001
  - kitchen-display-web:5002

  # Reverse Proxy (1)
  - nginx:80/443
```

### 서비스 간 통신
```javascript
// 1. HTTP REST API (동기)
const authServiceUrl = 'http://auth-service:4001';
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