# Auth Service API Documentation

**서비스 위치**: `backend/core/auth-service/`
**포트**: 4001
**상태**: ✅ 완전 구현 완료 (2025.09.16)

## 📋 개요

Auth Service는 WAFL AI POS 시스템의 핵심 인증 서비스로, JWT 기반의 이중 인증 시스템을 제공합니다.

### 🔑 주요 기능
- PIN 기반 로그인 (매장코드 + 사용자 PIN)
- SMS 인증 기반 모바일 로그인
- 매장 온라인 가입 (원스톱)
- QR 코드 기반 고객 세션 관리
- JWT 토큰 관리 (Access + Refresh Token)
- 메모리 기반 세션 저장소

## 🚀 서버 정보

### 기본 정보
```
Base URL: http://localhost:4001
Content-Type: application/json
```

### 헬스체크
```http
GET /health
```

**응답 예시**:
```json
{
  "status": "ok",
  "timestamp": "2025-09-16T10:30:00.000Z",
  "service": "auth-service",
  "version": "1.0.0"
}
```

## 📚 API Endpoints

### 1. PIN 로그인

매장코드와 사용자 PIN을 이용한 로그인

```http
POST /api/v1/auth/login/pin
```

**요청 본문**:
```json
{
  "storeCode": 1001,
  "userPin": "1234"
}
```

**응답 성공 (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "user_uuid",
    "storeId": "store_uuid",
    "storeCode": 1001,
    "role": "owner",
    "name": "김점주",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**응답 오류 (400/401)**:
```json
{
  "success": false,
  "error": {
    "message": "매장을 찾을 수 없습니다.",
    "code": "STORE_NOT_FOUND"
  }
}
```

### 2. SMS 인증번호 요청

모바일 번호로 SMS 인증번호 발송

```http
POST /api/v1/auth/mobile/request
```

**요청 본문**:
```json
{
  "phone": "01012345678"
}
```

**응답 성공 (200)**:
```json
{
  "success": true,
  "data": {
    "message": "인증번호가 발송되었습니다",
    "expiresIn": 300
  }
}
```

### 3. SMS 인증번호 확인

발송된 인증번호 검증

```http
POST /api/v1/auth/mobile/verify
```

**요청 본문**:
```json
{
  "phone": "01012345678",
  "verificationCode": "123456"
}
```

**응답 성공 (200)**:
```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

### 4. 모바일 로그인

SMS 인증 완료 후 모바일 번호로 로그인

```http
POST /api/v1/auth/login/mobile
```

**요청 본문**:
```json
{
  "phone": "01012345678",
  "verificationCode": "123456"
}
```

**응답 성공 (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "user_uuid",
    "storeId": "store_uuid",
    "storeCode": 1001,
    "role": "owner",
    "name": "김점주",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 5. 매장 가입

온라인 원스톱 매장 가입 및 점주 계정 생성

```http
POST /api/v1/auth/stores/register
```

**요청 본문**:
```json
{
  "storeName": "맛집카페",
  "businessNumber": "123-45-67890",
  "email": "owner@example.com",
  "phone": "01012345678",
  "address": "서울시 강남구 테헤란로 123",
  "naverPlaceUrl": "https://place.naver.com/restaurant/1234567",
  "verificationCode": "123456"
}
```

**응답 성공 (201)**:
```json
{
  "success": true,
  "data": {
    "userId": "user_uuid",
    "storeId": "store_uuid",
    "storeCode": 1002,
    "role": "owner",
    "name": "점주",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 6. 고객 세션 생성

QR 코드 스캔을 통한 고객 세션 생성 (주문용)

```http
POST /api/v1/auth/customer/session
```

**요청 본문**:
```json
{
  "qrCode": "QR_TABLE_01",
  "language": "ko"
}
```

**응답 성공 (200)**:
```json
{
  "success": true,
  "data": {
    "sessionId": "session_uuid",
    "customerId": "customer_uuid",
    "tableId": "table_uuid",
    "tableName": "Table 1",
    "storeId": "store_uuid"
  }
}
```

### 7. 토큰 갱신

Refresh Token을 이용한 Access Token 갱신

```http
POST /api/v1/auth/refresh
Authorization: Bearer {accessToken}
```

**요청 본문**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**응답 성공 (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "user_uuid",
    "storeId": "store_uuid",
    "storeCode": 1001,
    "role": "owner",
    "name": "김점주",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 8. 로그아웃

사용자 로그아웃 및 세션 정리

```http
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}
```

**응답 성공 (200)**:
```json
{
  "success": true,
  "data": {
    "message": "로그아웃되었습니다"
  }
}
```

## 🔐 인증 및 보안

### JWT 토큰 구조
```typescript
{
  userId: string;      // 사용자 ID
  storeId: string;     // 매장 ID
  role: 'owner' | 'staff';  // 사용자 역할
  iat: number;         // 발급 시간
  exp: number;         // 만료 시간
}
```

### 토큰 유효기간
- **Access Token**: 15분
- **Refresh Token**: 30일

### 요청 헤더
보호된 엔드포인트 접근 시:
```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

## 🧪 테스트 데이터

### 테스트 계정 정보
```
매장 코드: 1001
점주 PIN: 1234 (김점주)
직원 PIN: 5678 (이직원)
```

### 테스트 QR 코드
```
QR_TABLE_01, QR_TABLE_02, QR_TABLE_03
```

## 🔧 cURL 테스트 예시

### 1. 헬스체크
```bash
curl http://localhost:4001/health
```

### 2. PIN 로그인
```bash
curl -X POST http://localhost:4001/api/v1/auth/login/pin \
  -H "Content-Type: application/json" \
  -d '{
    "storeCode": 1001,
    "userPin": "1234"
  }'
```

### 3. SMS 인증번호 요청
```bash
curl -X POST http://localhost:4001/api/v1/auth/mobile/request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01012345678"
  }'
```

### 4. 고객 세션 생성
```bash
curl -X POST http://localhost:4001/api/v1/auth/customer/session \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "QR_TABLE_01",
    "language": "ko"
  }'
```

### 5. 로그아웃 (토큰 필요)
```bash
curl -X POST http://localhost:4001/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## ❌ 오류 코드

### 공통 오류 응답 형식
```json
{
  "success": false,
  "error": {
    "message": "에러 메시지",
    "code": "ERROR_CODE",
    "details": "상세 정보 (선택사항)"
  }
}
```

### 주요 오류 코드
- `STORE_NOT_FOUND`: 매장을 찾을 수 없음
- `INVALID_PIN`: 잘못된 PIN 번호
- `INVALID_PHONE`: 등록되지 않은 전화번호
- `VERIFICATION_FAILED`: SMS 인증 실패
- `INVALID_QR_CODE`: 유효하지 않은 QR 코드
- `TOKEN_EXPIRED`: 토큰 만료
- `INVALID_TOKEN`: 유효하지 않은 토큰
- `BUSINESS_NUMBER_INVALID`: 유효하지 않은 사업자번호
- `STORE_ALREADY_EXISTS`: 이미 등록된 매장

## 🏗️ 기술 스택

- **Framework**: Express.js + TypeScript
- **Authentication**: JSON Web Token (JWT)
- **Password Hashing**: bcrypt
- **Database**: PostgreSQL + Prisma ORM
- **Session Store**: 메모리 기반 (개발용)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## 🚀 서비스 실행

### 개발 모드
```bash
cd backend/core/auth-service
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
npm start
```

### Docker 실행
```bash
docker build -t auth-service .
docker run -p 4001:4001 auth-service
```

---

**✅ 테스트 상태**: 모든 API 엔드포인트 동작 확인 완료
**🔗 다음 단계**: API Gateway Service와 연동
**📅 최종 업데이트**: 2025.09.16