# 서비스 현재 상태 (Service Status)

## 🌐 현재 실행 중인 서버들 (2025.09.16 기준)

### 핵심 서비스 (Core Services)
```bash
# Auth Service (인증 서비스)
포트: 3001
URL: http://localhost:3001
상태: ✅ 실행 중 (헬스체크 OK, JWT 토큰 발급 작동)

# Store Management Service (매장 관리 서비스)
포트: 3002
URL: http://localhost:3002
상태: ✅ 실행 중 (JWT 인증 연동, 인메모리 캐시, 완전 작동)

# Dashboard Service (대시보드 서비스)
포트: 3003
URL: http://localhost:3003
상태: ✅ 실행 중 (JWT 인증 작동, 헬스체크 OK, 실시간 대시보드 작동)

# Order Service (주문 관리 서비스)
포트: 3004
URL: http://localhost:3004
상태: ✅ 실행 중 (WebSocket 실시간 알림, Kitchen 큐 관리, 완전 작동)

# Payment Service (결제 서비스)
포트: 3005
URL: http://localhost:3005
상태: ✅ 구현 완료 (Mock 모드 실행 가능, PG 모의 서비스, 카드/현금/모바일 결제)

# User Profile Service (사용자 프로필 서비스)
포트: 3006
URL: http://localhost:3006
상태: ✅ 구현 완료 (프로필 관리, 직원 관리, 이미지 업로드, 14개 API 엔드포인트)
```

### 지원 서비스 (Support Services)
```bash
# API Gateway (메인 진입점)
포트: 8080
URL: http://localhost:8080
상태: ⚠️ 현재 미실행 (필요시 시작 가능, 12개 라우트 설정 완료)
```

## 📊 Database 정보

### 💾 접속 정보
```bash
# 로컬 개발 환경
DATABASE_URL="postgresql://postgres:Cl!Wm@Dp!Dl@Em!@localhost:5432/aipos?schema=public"
Container: database-postgres-1

# 테스트 계정 정보
매장 코드: 1001
점주 PIN: 1234 (김점주)
직원 PIN: 5678 (이직원)
테스트 QR: QR_TABLE_01, QR_TABLE_02, QR_TABLE_03
```

### 📊 완전 구축된 상태
- **PostgreSQL 15 + Prisma ORM** ✅
- **14개 테이블**: stores, users, categories, menus, places, tables, customers, orders, order_items, payments, history_logs, ai_conversations, analytics_daily, sms_verifications
- **7개 Enum**: user_role, subscription_status, table_status, order_status, payment_method, payment_status, ai_conversation_type
- **Demo 데이터**: 매장(1), 사용자(2), 카테고리(5), 메뉴(18), 테이블(21) 완료

## 🚨 새로운 Claude Code 세션 체크리스트

### 1. 프로젝트 상태 확인
```bash
cd /home/wk/projects/wafl
pwd && ls -la
```

### 2. 실행 중인 서비스 확인
```bash
# Auth Service 상태 확인 (포트 3001)
curl http://localhost:3001/health

# Store Management Service 상태 확인 (포트 3002)
curl http://localhost:3002/health

# Dashboard Service 상태 확인 (포트 3003)
curl http://localhost:3003/health

# Order Service 상태 확인 (포트 3004)
curl http://localhost:3004/health

# Payment Service 상태 확인 (포트 3005)
curl http://localhost:3005/health

# User Profile Service 상태 확인 (포트 3006)
curl http://localhost:3006/health

# API Gateway 상태 확인 (포트 8080)
curl http://localhost:8080/health
```

### 3. Database 상태 확인
```bash
# PostgreSQL 컨테이너 확인
docker ps | grep postgres

# 데이터 확인
docker exec database-postgres-1 psql -U postgres -d aipos -c "
  SELECT
    (SELECT COUNT(*) FROM stores) as stores,
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM menus) as menus,
    (SELECT COUNT(*) FROM tables) as tables;"
```