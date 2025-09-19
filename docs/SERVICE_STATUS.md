# 서비스 실행 상태 (Service Status)

이 문서는 WAFL POS 시스템의 현재 실행 중인 서비스 상태를 기록합니다.

## 📋 목차

1. [현재 실행 중인 서비스](#현재-실행-중인-서비스)
2. [서비스 헬스 체크](#서비스-헬스-체크)
3. [JWT Secret 통일 상태](#jwt-secret-통일-상태)
4. [개발 환경 설정](#개발-환경-설정)
5. [다음 개발 작업](#다음-개발-작업)

---

## 현재 실행 중인 서비스

### 🟢 정상 작동 중인 핵심 서비스 (4개)

| 서비스               | 포트 | 상태       | JWT Secret | 설명                       |
| -------------------- | ---- | ---------- | ---------- | -------------------------- |
| **API Gateway**      | 4000 | 🟢 실행 중 | ✅ 통일    | 중앙 라우팅 게이트웨이     |
| **Auth Service**     | 4001 | 🟢 실행 중 | ✅ 통일    | JWT 인증 및 로그인         |
| **Store Management** | 4002 | 🟢 실행 중 | ✅ 통일    | 매장/메뉴/테이블 관리      |
| **POS Admin Web**    | 4100 | 🟢 실행 중 | -          | 프론트엔드 관리 인터페이스 |

### ⚪ 대기 중인 서비스

| 서비스                   | 포트 | 상태       | 구현 완료 여부 |
| ------------------------ | ---- | ---------- | -------------- |
| **Dashboard Service**    | 4003 | ⚪ 대기 중 | ✅ 구현 완료   |
| **Order Service**        | 4004 | ⚪ 대기 중 | ✅ 구현 완료   |
| **Payment Service**      | 4005 | ⚪ 대기 중 | ✅ 구현 완료   |
| **AI Service**           | 4006 | ⚪ 대기 중 | ✅ 구현 완료   |
| **User Profile Service** | 4009 | ⚪ 대기 중 | ✅ 구현 완료   |
| **History Service**      | 4010 | ⚪ 대기 중 | ✅ 구현 완료   |

---

## 서비스 헬스 체크

### 🔍 실시간 헬스 체크 명령어

```bash
# 실행 중인 핵심 서비스들 확인
curl http://localhost:4000/health  # API Gateway
curl http://localhost:4001/health  # Auth Service
curl http://localhost:4002/health  # Store Management
curl http://localhost:4100        # POS Admin Web (프론트엔드)

# 포트 사용 현황 확인
netstat -tulpn | grep -E ":(4000|4001|4002|4100)"
```

### 📊 최근 테스트 결과 (2025.09.19)

| 엔드포인트                    | 상태           | 응답 시간 | 비고               |
| ----------------------------- | -------------- | --------- | ------------------ |
| `GET /api/v1/store/places`    | ✅ 200 OK      | 0.013초   | JWT 인증 정상      |
| `POST /api/v1/auth/login/pin` | ✅ 200 OK      | 0.08초    | 토큰 발급 정상     |
| API Gateway → Store Mgmt      | ✅ 프록시 정상 | 0.013초   | 401 에러 해결 완료 |

---

## JWT Secret 통일 상태

### ✅ 통일 완료된 서비스들

**2025.09.19 - JWT Secret 통일 작업 완료**

모든 서비스가 다음 JWT secret을 사용합니다:

```
JWT_SECRET=wafl-super-secret-jwt-key-for-all-services-2025
```

| 서비스               | .env 파일 경로                                | 상태    |
| -------------------- | --------------------------------------------- | ------- |
| Auth Service         | `/backend/core/auth-service/.env`             | ✅ 통일 |
| Store Management     | `/backend/core/store-management-service/.env` | ✅ 통일 |
| Dashboard Service    | `/backend/core/dashboard-service/.env`        | ✅ 통일 |
| Order Service        | `/backend/core/order-service/.env`            | ✅ 통일 |
| Payment Service      | `/backend/support/payment-service/.env`       | ✅ 통일 |
| AI Service           | `/backend/core/ai-service/.env`               | ✅ 통일 |
| History Service      | `/backend/core/history-service/.env`          | ✅ 통일 |
| User Profile Service | `/backend/core/user-profile-service/.env`     | ✅ 통일 |
| API Gateway          | `/backend/support/api-gateway/.env`           | ✅ 통일 |
| Docker 환경          | `/docker/.env`                                | ✅ 통일 |

### 🔍 JWT Secret 일치 확인 명령어

```bash
# 모든 .env 파일의 JWT_SECRET 확인
grep -r "JWT_SECRET=" backend/ docker/ | grep -v node_modules

# 기대 결과: 모든 파일이 동일한 secret 사용
```

---

## 개발 환경 설정

### 🚀 서비스 시작 명령어

```bash
# 핵심 서비스 시작 (필수 3개)
cd backend/core/auth-service && npm run dev           # 포트 4001
cd backend/support/api-gateway && npm run dev         # 포트 4000
cd frontend/pos-admin-web && npm run dev             # 포트 4100

# 추가 백엔드 서비스 (필요시)
cd backend/core/store-management-service && npm run dev  # 포트 4002
cd backend/core/dashboard-service && npm run dev         # 포트 4003
cd backend/core/order-service && npm run dev            # 포트 4004
```

### 🎯 테스트 계정

```bash
# 로그인 테스트용 계정
매장코드: 1001
점주 PIN: 1234
직원 PIN: 5678
비밀번호: password
```

### 🌐 외부 접속 URL

```bash
# 프론트엔드 (브라우저 접속)
http://112.148.37.41:4100

# API 엔드포인트 (개발/테스트용)
http://112.148.37.41:4001  # Auth Service
http://112.148.37.41:4000  # API Gateway
```

---

## 다음 개발 작업

### 📋 Phase 3-6: Dashboard Page 구현 (다음 최우선)

**목표**: 실시간 테이블 상태 및 POS 로그를 보여주는 Dashboard 페이지 구현

**필요한 서비스들**:

- ✅ Dashboard Service (포트 4003) - 이미 구현 완료
- ✅ Order Service (포트 4004) - 이미 구현 완료
- ⏳ WebSocket 실시간 연동 - 프론트엔드 구현 필요

**구현 예정 기능들**:

- 실시간 테이블 상태 카드 (빈 테이블/손님 있음/주문 완료)
- POS 로그 패널 (History Service 연동)
- 홈 버튼 (홈페이지로 돌아가기)
- Undo 기능 (특정 작업에 대한 실행 취소)
- WebSocket 실시간 업데이트

### 🎯 현재 개발 준비 상태

- ✅ **백엔드 서비스**: 8개 핵심 서비스 모두 구현 완료
- ✅ **인증 시스템**: JWT Secret 통일 및 401 에러 해결 완료
- ✅ **Management 페이지**: 카테고리/메뉴/장소/테이블 CRUD 완전 구현
- 🎯 **다음 단계**: Dashboard 페이지 프론트엔드 구현

---

**📝 문서 관리**

- 최초 작성: 2025.09.19
- 최종 수정: 2025.09.19
- 관리자: WAFL 개발팀
- **상태 업데이트**: JWT Secret 통일 완료, Management 페이지 401 에러 해결 완료
