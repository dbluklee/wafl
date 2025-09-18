# 개발 명령어 모음

## 🎉 Phase 2-7 완료 (2025.09.17)
**전체 포트 4000대 마이그레이션 완료! 모든 서비스 정상 실행 중**

## 🛠️ 주요 명령어

### API Gateway 개발 (backend/support/api-gateway/)
```bash
npm run dev          # 개발 서버 시작 (포트 4000) ✅ 실행 중
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행
```

### Auth Service 개발 (backend/core/auth-service/)
```bash
npm run dev          # 개발 서버 시작 (포트 4001) ✅ 실행 중
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행
```

### Store Management Service 개발 (backend/core/store-management-service/)
```bash
npm run dev          # 개발 서버 시작 (포트 4002) ✅ 구현 완료
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행
```

### Order Service 개발 (backend/core/order-service/)
```bash
npm run dev          # 개발 서버 시작 (포트 4004) ✅ 실행 중
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행
```

### Dashboard Service 개발 (backend/core/dashboard-service/)
```bash
npm run dev          # 개발 서버 시작 (포트 4003) ✅ 구현 완료
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행
```

### Payment Service 개발 (backend/support/payment-service/) **[2025.09.17 완전 복구]**
```bash
npm run dev          # 개발 서버 시작 (포트 4005) ✅ TypeScript 엄격 모드 대응 완료
npm run build        # TypeScript 컴파일 ✅
npm run test         # 단위 테스트 실행
# ⚠️ 중요: tsconfig-paths가 설정되어 있어 @/ 경로 매핑이 정상 작동
```

### User Profile Service 개발 (backend/core/user-profile-service/) **[2025.09.17 재구현]**
```bash
npm run dev          # 개발 서버 시작 (포트 4009) ✅ 재구현 완료
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
curl -X POST http://localhost:4001/api/v1/auth/login/pin \
  -H "Content-Type: application/json" \
  -d '{"storeCode":1001,"userPin":"1234"}'
```

### 각 서비스 헬스체크
```bash
# Auth Service
curl http://localhost:4001/health

# Store Management Service
curl http://localhost:4002/health

# Dashboard Service
curl http://localhost:4003/health

# Order Service
curl http://localhost:4004/health

# Payment Service
curl http://localhost:4005/health

# User Profile Service
curl http://localhost:4009/health

# API Gateway
curl http://localhost:4000/health
```

### API Gateway 메트릭스
```bash
curl http://localhost:4000/api/v1/gateway/health
curl http://localhost:4000/api/v1/gateway/metrics
curl http://localhost:4000/api/v1/gateway/services
```

## 🔧 포트 관리

### 포트 충돌 해결
```bash
# 특정 포트의 프로세스 확인
lsof -i :4001
lsof -i :4002
lsof -i :4003
lsof -i :4004
lsof -i :4005
lsof -i :4009
lsof -i :4000

# 프로세스 종료
lsof -ti:4002 | xargs kill -9
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

## 🌟 현재 실행 중인 서비스 (Phase 2-7 완료)

### ✅ 정상 작동 중인 모든 서비스
```bash
# API Gateway - 포트 4000 ✅
http://localhost:4000

# Auth Service - 포트 4001 ✅
http://localhost:4001

# Store Management Service - 포트 4002 ✅
http://localhost:4002

# Dashboard Service - 포트 4003 ✅
http://localhost:4003

# Order Service - 포트 4004 ✅
http://localhost:4004

# Payment Service - 포트 4005 ✅ (TypeScript 문제 완전 해결)
http://localhost:4005

# User Profile Service - 포트 4009 ✅ (재구현 완료)
http://localhost:4009
```

### 🚀 새로운 창에서 작업 시 빠른 체크
```bash
# 모든 서비스 상태 한 번에 확인
curl -s http://localhost:4001/health && echo "✅ Auth" || echo "❌ Auth"
curl -s http://localhost:4002/health && echo "✅ Store" || echo "❌ Store"
curl -s http://localhost:4003/health && echo "✅ Dashboard" || echo "❌ Dashboard"
curl -s http://localhost:4004/health && echo "✅ Order" || echo "❌ Order"
curl -s http://localhost:4005/health && echo "✅ Payment" || echo "❌ Payment"
curl -s http://localhost:4009/health && echo "✅ User Profile" || echo "❌ User Profile"
curl -s http://localhost:4000/health && echo "✅ API Gateway" || echo "❌ API Gateway"
```

---
**📊 진행률**: 85% 완료 (핵심 서비스 6/7, 지원 서비스 2/10)
**최종 업데이트**: 2025.09.17 - Phase 2-7 완료