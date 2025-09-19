# 개발 문제 해결 가이드 (Troubleshooting Guide)

이 문서는 WAFL POS 시스템 개발 중에 발생한 문제들과 해결 방법을 기록합니다.

## 📋 목차

1. [API Gateway 프록시 연결 지연 문제](#api-gateway-프록시-연결-지연-문제)
2. [JWT Secret 불일치로 인한 401 에러](#jwt-secret-불일치로-인한-401-에러)
3. [향후 추가될 문제들...](#향후-추가될-문제들)

---

## API Gateway 프록시 연결 지연 문제

### 🚨 문제 증상

- **발생일**: 2025.09.18
- **증상**: API Gateway를 통한 인증 요청이 30초 이상 소요되거나 504 타임아웃
  발생
- **직접 호출**: Auth Service에 직접 호출 시 0.08초로 정상 작동
- **에러 로그**: `[HPM] ECONNRESET: Error: socket hang up`

### 🔍 근본 원인

**Express.js body parsing과 http-proxy-middleware 간의 충돌**

1. Express.js가 들어오는 요청의 body를 파싱하여 `req.body` 객체로 변환
2. http-proxy-middleware가 Auth Service로 프록시할 때, 이미 소비된 원본 요청
   스트림이 비어있음
3. Auth Service가 빈 body를 받아 요청을 제대로 처리하지 못함
4. 소켓 연결이 중간에 끊어져 ECONNRESET 에러 발생

### 💡 해결 방법

**`/backend/support/api-gateway/src/middlewares/proxy/index.ts` 수정**

```typescript
onProxyReq: (proxyReq: any, req: any, res: any) => {
  console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${serviceConfig.url}${proxyReq.path}`);

  // 기본 헤더 설정
  proxyReq.setHeader('X-Gateway-Request-ID', req.requestId);
  proxyReq.setHeader('X-Gateway-Timestamp', new Date().toISOString());
  proxyReq.setHeader('X-Service-Name', routeConfig.target);

  // 사용자 컨텍스트 전달
  if (req.user) {
    proxyReq.setHeader('X-User-ID', req.user.userId);
    proxyReq.setHeader('X-Store-ID', req.user.storeId);
    proxyReq.setHeader('X-User-Role', req.user.role);
    if (req.user.sessionId) {
      proxyReq.setHeader('X-Session-ID', req.user.sessionId);
    }
  }

  // 🔧 핵심 해결책: 파싱된 body 재작성
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
    console.log(`[PROXY BODY] Forwarding parsed body: ${bodyData}`);
  }
},
```

### 📊 성능 개선 결과

| 항목      | 수정 전          | 수정 후  |
| --------- | ---------------- | -------- |
| 응답 시간 | 30초+ (타임아웃) | 0.08초   |
| 성공률    | 0% (504 에러)    | 100%     |
| 로그 상태 | ECONNRESET       | 정상 200 |

### 🛠️ 추가 설정

**proxy 옵션 최적화**:

```typescript
const proxyOptions: Options = {
  target: serviceConfig.url,
  changeOrigin: true,
  timeout: 30000, // 합리적인 타임아웃
  proxyTimeout: 35000,

  // body 파싱 문제 해결을 위한 설정
  selfHandleResponse: false,
  xfwd: true,
  secure: false,

  // ... onProxyReq 로직
};
```

### 🎯 영향을 받는 서비스

이 문제는 다음과 같은 조건에서 발생할 수 있습니다:

1. **Express.js body parsing middleware 사용** (`express.json()`,
   `express.urlencoded()`)
2. **http-proxy-middleware를 통한 요청 프록시**
3. **POST/PUT/PATCH 등 body가 있는 HTTP 메서드**

### 🔍 문제 진단 방법

1. **API Gateway 로그 확인**:

   ```
   [ROUTER] Routing POST /api/v1/auth/login/pin to http://localhost:4001
   [PATHREWRITE] Original path: /api/v1/auth/login/pin
   [PROXY] POST /api/v1/auth/login/pin -> http://localhost:4001/api/v1/auth/login/pin
   [HPM] ECONNRESET: Error: socket hang up  // ❌ 문제 발생
   ```

2. **대상 서비스 로그 확인**: 요청이 도달하지 않음
3. **직접 호출 테스트**: 정상 작동 확인

### 🚀 예방 방법

1. **새로운 프록시 라우트 추가 시 주의사항**:
   - POST/PUT/PATCH 요청에는 반드시 body 재작성 로직 포함
   - 로깅으로 body 전달 상태 확인

2. **테스트 방법**:

   ```bash
   # 직접 호출 테스트
   curl -X POST http://localhost:4001/api/v1/auth/login/pin \
   -H "Content-Type: application/json" \
   -d '{"storeCode": 1001, "userPin": "1234", "password": "password"}'

   # API Gateway 통한 호출 테스트
   curl -X POST http://localhost:4000/api/v1/auth/login/pin \
   -H "Content-Type: application/json" \
   -d '{"storeCode": 1001, "userPin": "1234", "password": "password"}'
   ```

3. **모니터링 지표**:
   - 응답 시간 0.1초 이하 유지
   - ECONNRESET 에러 0건 유지
   - `[PROXY BODY]` 로그 정상 출력 확인

---

## JWT Secret 불일치로 인한 401 에러

### 🚨 문제 증상

- **발생일**: 2025.09.19
- **증상**: 로그인 후 Management 페이지에서 카테고리/메뉴/장소/테이블 카드가
  표시되지 않음
- **브라우저 에러**: Network 탭에서 API 호출 시 401 Unauthorized 응답
- **에러 로그**:
  `{"success":false,"error":{"code":"AUTH_002","message":"Invalid or expired token"}}`

### 🔍 근본 원인

**마이크로서비스 간 JWT Secret 불일치**

1. **Auth Service**: JWT 토큰을
   `wafl-super-secret-jwt-key-for-all-services-2025` secret으로 생성
2. **Store Management Service**: 다른 JWT secret
   (`your-super-secret-jwt-key-change-this-in-production`)으로 토큰 검증 시도
3. **결과**: 유효한 토큰이지만 다른 secret으로 검증하여 401 에러 발생
4. **API Gateway 캐싱**: 서비스 재시작 없이 .env 변경 시 기존 JWT secret 계속
   사용

### 💡 해결 방법

**1단계: 모든 서비스 JWT_SECRET 통일**

영향을 받는 12개 서비스의 `.env` 파일을 모두 동일한 JWT secret으로 변경:

```bash
# 모든 .env 파일에서 다음과 같이 통일
JWT_SECRET=wafl-super-secret-jwt-key-for-all-services-2025
```

**수정 대상 파일들**:

- `/backend/core/auth-service/.env`
- `/backend/core/store-management-service/.env`
- `/backend/core/dashboard-service/.env`
- `/backend/core/order-service/.env`
- `/backend/core/ai-service/.env`
- `/backend/core/history-service/.env`
- `/backend/core/user-profile-service/.env`
- `/backend/support/payment-service/.env`
- `/backend/support/api-gateway/.env`
- `/docker/.env`

**2단계: 영향을 받는 서비스 재시작**

```bash
# Store Management Service 재시작
cd backend/core/store-management-service && npm run dev

# API Gateway 재시작 (중요!)
cd backend/support/api-gateway && npm run dev
```

**3단계: 새로운 JWT 토큰으로 테스트**

```bash
# 새로운 토큰 발급
curl -X POST "http://localhost:4001/api/v1/auth/login/pin" \
-H "Content-Type: application/json" \
-d '{"storeCode": 1001, "userPin": "1234", "password": "password"}'

# API Gateway를 통한 Store Management API 테스트
curl -X GET "http://localhost:4000/api/v1/store/places" \
-H "Authorization: Bearer [새로운_토큰]" \
-H "Content-Type: application/json"
```

### 📊 성능 개선 결과

| 항목            | 수정 전          | 수정 후        |
| --------------- | ---------------- | -------------- |
| API 응답        | 401 Unauthorized | 200 OK         |
| 응답 시간       | -                | 0.013초        |
| 프론트엔드 표시 | 빈 화면          | 카드 정상 표시 |
| 로그 상태       | Invalid token    | 정상 인증      |

### 🎯 영향을 받는 서비스

1. **직접적 영향**: JWT 인증을 사용하는 모든 백엔드 서비스
2. **간접적 영향**: API Gateway를 통해 인증이 필요한 모든 API 호출
3. **프론트엔드**: 로그인 후 인증이 필요한 모든 페이지

### 🔍 문제 진단 방법

1. **브라우저 개발자 도구 확인**:
   - Network 탭에서 API 호출 상태 확인
   - 401 응답 및 에러 메시지 확인

2. **JWT 토큰 검증**:

   ```bash
   # Auth Service로 직접 토큰 검증
   curl -X GET "http://localhost:4002/api/v1/store/places" \
   -H "Authorization: Bearer [토큰]"

   # API Gateway를 통한 토큰 검증
   curl -X GET "http://localhost:4000/api/v1/store/places" \
   -H "Authorization: Bearer [토큰]"
   ```

3. **서비스 로그 확인**:
   - Store Management Service 로그에서 JWT 검증 실패 메시지 확인
   - API Gateway 로그에서 프록시 요청 상태 확인

### 🚀 예방 방법

1. **JWT Secret 중앙 관리**:
   - 모든 서비스가 동일한 JWT secret 사용 원칙 수립
   - 환경변수 설정 체크리스트 작성

2. **자동화된 검증**:

   ```bash
   # 모든 .env 파일의 JWT_SECRET 일치 여부 확인 스크립트
   grep -r "JWT_SECRET=" backend/ docker/ | grep -v node_modules
   ```

3. **개발 가이드라인**:
   - 새로운 서비스 추가 시 JWT_SECRET 통일 확인
   - .env 파일 변경 후 반드시 서비스 재시작
   - JWT secret 변경 시 모든 서비스 동시 업데이트

4. **모니터링 지표**:
   - 401 에러 발생률 0% 유지
   - API Gateway → 백엔드 서비스 인증 성공률 100% 유지
   - 새로운 JWT 토큰 발급 후 즉시 모든 API 테스트

### 🔧 관련 파일들

```
backend/
├── core/
│   ├── auth-service/.env              # JWT 토큰 생성
│   ├── store-management-service/.env  # JWT 토큰 검증 (주요 문제)
│   ├── dashboard-service/.env
│   ├── order-service/.env
│   ├── ai-service/.env
│   ├── history-service/.env
│   └── user-profile-service/.env
├── support/
│   ├── api-gateway/.env               # JWT 토큰 프록시 검증
│   └── payment-service/.env
└── docker/.env                       # Docker 환경용
```

---

## 향후 추가될 문제들

새로운 문제가 해결될 때마다 이 섹션에 추가됩니다.

### 템플릿

```markdown
## 문제 제목

### 🚨 문제 증상

- **발생일**: YYYY.MM.DD
- **증상**:
- **에러 로그**:

### 🔍 근본 원인

### 💡 해결 방법

### 📊 성능 개선 결과

### 🎯 영향을 받는 서비스

### 🔍 문제 진단 방법

### 🚀 예방 방법
```

---

**📝 문서 관리**

- 최초 작성: 2025.09.18
- 최종 수정: 2025.09.19
- 관리자: WAFL 개발팀
