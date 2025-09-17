# Docker 개발 가이드

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
EXPOSE 4001
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
AUTH_SERVICE_URL=http://auth-service:4001
STORE_SERVICE_URL=http://store-management-service:4002
AI_SERVICE_URL=http://ai-service:4006
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
    test: ["CMD", "curl", "-f", "http://localhost:4001/health"]
    interval: 30s
    timeout: 10s
    retries: 3
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
docker-compose exec auth-service curl http://store-management-service:4002/health
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
lsof -i :4001
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