# 개발 문제 해결 가이드 (Troubleshooting Guide)

이 문서는 WAFL POS 시스템 개발 중에 발생한 문제들과 해결 방법을 기록합니다.

## 📋 목차

1. [API Gateway 프록시 연결 지연 문제](#api-gateway-프록시-연결-지연-문제)
2. [향후 추가될 문제들...](#향후-추가될-문제들)

---

## API Gateway 프록시 연결 지연 문제

### 🚨 문제 증상

- **발생일**: 2025.09.18
- **증상**: API Gateway를 통한 인증 요청이 30초 이상 소요되거나 504 타임아웃 발생
- **직접 호출**: Auth Service에 직접 호출 시 0.08초로 정상 작동
- **에러 로그**: `[HPM] ECONNRESET: Error: socket hang up`

### 🔍 근본 원인

**Express.js body parsing과 http-proxy-middleware 간의 충돌**

1. Express.js가 들어오는 요청의 body를 파싱하여 `req.body` 객체로 변환
2. http-proxy-middleware가 Auth Service로 프록시할 때, 이미 소비된 원본 요청 스트림이 비어있음
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

| 항목 | 수정 전 | 수정 후 |
|------|---------|---------|
| 응답 시간 | 30초+ (타임아웃) | 0.08초 |
| 성공률 | 0% (504 에러) | 100% |
| 로그 상태 | ECONNRESET | 정상 200 |

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

1. **Express.js body parsing middleware 사용** (`express.json()`, `express.urlencoded()`)
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
- 최종 수정: 2025.09.18
- 관리자: WAFL 개발팀