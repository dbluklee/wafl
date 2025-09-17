# 개발 명령어 모음

## 🛠️ 주요 명령어

### API Gateway 개발 (backend/support/api-gateway/)
```bash
npm run dev          # 개발 서버 시작 (포트 8080) ✅ 실행 중
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행
```

### Auth Service 개발 (backend/core/auth-service/)
```bash
npm run dev          # 개발 서버 시작 (포트 3001) ✅ 실행 중
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행
```

### Store Management Service 개발 (backend/core/store-management-service/)
```bash
npm run dev          # 개발 서버 시작 (포트 3002) ✅ 구현 완료
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행
```

### Order Service 개발 (backend/core/order-service/)
```bash
npm run dev          # 개발 서버 시작 (포트 3004) ✅ 실행 중
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행
```

### Dashboard Service 개발 (backend/core/dashboard-service/)
```bash
npm run dev          # 개발 서버 시작 (포트 3003) ✅ 구현 완료
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행
```

### Payment Service 개발 (backend/support/payment-service/)
```bash
npm run dev          # 개발 서버 시작 (포트 3005) ✅ 구현 완료
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행
```

### User Profile Service 개발 (backend/core/user-profile-service/) **[2025.09.17 재구현]**
```bash
npm run dev          # 개발 서버 시작 (포트 3009) ✅ 재구현 완료
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행
```

### Database 작업 (backend/shared/database/)
```bash
npm run generate     # Prisma 클라이언트 생성
npm run build        # TypeScript 컴파일
npm run studio       # Prisma Studio GUI
```

### 코드 품질 (프로젝트 루트)
```bash
npm run lint         # ESLint 자동 수정
npm run format       # Prettier 포맷팅
npm run type-check   # TypeScript 검사
```

### Docker 관리
```bash
make help           # 명령어 확인
make down           # 서비스 중지
```

## 🧪 테스트 명령어

### JWT 토큰 발급 테스트
```bash
curl -X POST http://localhost:3001/api/v1/auth/login/pin \
  -H "Content-Type: application/json" \
  -d '{"storeCode":1001,"userPin":"1234"}'
```

### 각 서비스 헬스체크
```bash
# Auth Service
curl http://localhost:3001/health

# Store Management Service
curl http://localhost:3002/health

# Dashboard Service
curl http://localhost:3003/health

# Order Service
curl http://localhost:3004/health

# Payment Service
curl http://localhost:3005/health

# User Profile Service
curl http://localhost:3006/health

# API Gateway
curl http://localhost:8080/health
```

### API Gateway 메트릭스
```bash
curl http://localhost:8080/api/v1/gateway/health
curl http://localhost:8080/api/v1/gateway/metrics
curl http://localhost:8080/api/v1/gateway/services
```

## 🔧 포트 관리

### 포트 충돌 해결
```bash
# 특정 포트의 프로세스 확인
lsof -i :3001
lsof -i :3002
lsof -i :3003
lsof -i :3004
lsof -i :3005
lsof -i :3006
lsof -i :8080

# 프로세스 종료
lsof -ti:3002 | xargs kill -9
```

### 모든 개발 서버 동시 실행
```bash
# 각 서비스 디렉토리에서 개별 실행
cd backend/core/auth-service && npm run dev &
cd backend/core/store-management-service && npm run dev &
cd backend/core/dashboard-service && npm run dev &
cd backend/core/order-service && npm run dev &
cd backend/support/payment-service && npm run dev &
cd backend/core/user-profile-service && npm run dev &
cd backend/support/api-gateway && npm run dev &
```

## 📊 Database 관리

### PostgreSQL 접속
```bash
# 컨테이너를 통한 접속
docker exec -it database-postgres-1 psql -U postgres -d aipos

# 테이블 확인
\dt

# 데이터 확인
SELECT COUNT(*) FROM stores;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM menus;
SELECT COUNT(*) FROM tables;
```

### Prisma 작업
```bash
cd backend/shared/database

# 스키마 변경 후 마이그레이션
npx prisma migrate dev --name "description"

# 클라이언트 재생성
npx prisma generate

# 데이터베이스 초기화 (주의!)
npx prisma migrate reset
```

## 🚀 배포 관련

### Docker 빌드
```bash
# 개별 서비스 빌드
docker build -t wafl-auth-service backend/core/auth-service/
docker build -t wafl-store-service backend/core/store-management-service/
docker build -t wafl-order-service backend/core/order-service/
docker build -t wafl-dashboard-service backend/core/dashboard-service/
docker build -t wafl-payment-service backend/support/payment-service/
docker build -t wafl-user-profile-service backend/core/user-profile-service/
docker build -t wafl-api-gateway backend/support/api-gateway/
```

### 환경 변수 확인
```bash
# 각 서비스의 .env 파일 확인
cat backend/core/auth-service/.env
cat backend/core/store-management-service/.env
cat backend/core/dashboard-service/.env
cat backend/core/order-service/.env
cat backend/support/payment-service/.env
cat backend/core/user-profile-service/.env
cat backend/support/api-gateway/.env
```