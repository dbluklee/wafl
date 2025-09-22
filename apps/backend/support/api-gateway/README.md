# API Gateway - WAFL AI POS System

## 개요

WAFL AI POS 시스템의 중앙 API 게이트웨이입니다. 모든 마이크로서비스를 통합하여 단일 진입점을 제공합니다.

## 주요 기능

### 🌐 라우팅 및 프록시
- **13개 마이크로서비스 프록시**: Auth, Store Management, Dashboard, Order, Payment, AI, Analytics, Notification, User Profile, History, Scraping, QR
- **지능적 라우팅**: 경로 기반 서비스 라우팅
- **로드 밸런싱**: 라운드 로빈 방식의 로드 밸런싱 지원
- **서비스 디스커버리**: 자동 서비스 발견 및 상태 모니터링

### 🔐 보안 및 인증
- **JWT 인증**: Bearer Token 기반 인증 시스템
- **역할 기반 접근 제어**: Owner, Staff, Customer 역할별 권한 관리
- **Rate Limiting**: 서비스별, 라우트별 요청 제한
- **보안 헤더**: Helmet.js를 통한 보안 강화
- **CORS 정책**: 도메인별 CORS 설정

### 🔌 실시간 통신
- **WebSocket 프록시**: 실시간 이벤트 브로드캐스팅
- **이벤트 구독**: 클라이언트별 이벤트 구독 관리
- **업스트림 연결**: 백엔드 서비스와의 WebSocket 연결

### 📊 모니터링 및 로깅
- **헬스체크**: 서비스별 상태 모니터링 (30초 간격)
- **메트릭스**: 요청/응답 통계, 성능 지표
- **로깅**: 구조화된 로그 및 요청 추적
- **에러 처리**: 표준화된 에러 응답

## 포트 매핑

| 서비스 | 포트 | 설명 |
|--------|------|------|
| **API Gateway** | **3000** | **메인 게이트웨이** |
| Auth Service | 3001 | 인증/인가 |
| Store Management | 3002 | 매장 관리 |
| Dashboard | 3003 | 실시간 현황 |
| Order Service | 3004 | 주문 관리 |
| Payment Service | 3005 | 결제 처리 |
| AI Service | 3006 | AI 기능 |
| Analytics | 3007 | 매출 분석 |
| Notification | 3008 | 실시간 알림 |
| User Profile | 3009 | 계정 관리 |
| History Service | 3010 | 작업 이력 |
| Scraping Service | 3011 | 메뉴 스크래핑 |
| QR Service | 3012 | QR 관리 |

## API 엔드포인트

### 게이트웨이 관리
```
GET  /health              # 전체 시스템 상태
GET  /ping                # 간단한 상태 확인
GET  /api/v1/gateway/health          # 상세 헬스체크
GET  /api/v1/gateway/health/:service # 개별 서비스 상태
GET  /api/v1/gateway/metrics         # 성능 메트릭스
GET  /api/v1/gateway/services        # 서비스 목록
POST /api/v1/gateway/health/check    # 수동 헬스체크
```

### 프록시 라우팅
```
/api/v1/auth/*           -> auth-service
/api/v1/store/*          -> store-management-service
/api/v1/dashboard/*      -> dashboard-service
/api/v1/orders/*         -> order-service
/api/v1/payments/*       -> payment-service
/api/v1/ai/*             -> ai-service
/api/v1/analytics/*      -> analytics-service
/api/v1/notifications/*  -> notification-service
/api/v1/profile/*        -> user-profile-service
/api/v1/history/*        -> history-service
/api/v1/scraping/*       -> scraping-service
/api/v1/qr/*             -> qr-service
```

### WebSocket
```
ws://localhost:3000/ws   # WebSocket 연결
```

## 개발 환경 설정

### 1. 의존성 설치
```bash
cd backend/support/api-gateway
npm install
```

### 2. 환경 변수 설정
`.env` 파일에서 필요한 설정을 확인하고 수정:
```bash
# API Gateway Configuration
PORT=3000
NODE_ENV=development

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-for-api-gateway-2024

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 서비스 URL들
AUTH_SERVICE_URL=http://localhost:3001
STORE_MANAGEMENT_SERVICE_URL=http://localhost:3002
# ... 다른 서비스들
```

### 3. 개발 서버 시작
```bash
npm run dev
```

## 사용 방법

### 1. Auth Service를 통한 인증
```bash
# PIN 로그인
curl -X POST http://localhost:3000/api/v1/auth/login/pin \
  -H "Content-Type: application/json" \
  -d '{"storeCode": 1001, "userPin": "1234"}'
```

### 2. JWT 토큰을 사용한 API 호출
```bash
# 매장 정보 조회 (Authorization 헤더 필요)
curl -X GET http://localhost:3000/api/v1/store/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. WebSocket 연결
```javascript
const ws = new WebSocket('ws://localhost:3000/ws?token=YOUR_JWT_TOKEN');

ws.onopen = () => {
  // 이벤트 구독
  ws.send(JSON.stringify({
    action: 'subscribe',
    events: ['order.created', 'payment.completed'],
    topics: ['orders', 'tables']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('받은 이벤트:', data.type, data.payload);
};
```

### 4. 헬스체크 확인
```bash
# 전체 시스템 상태
curl http://localhost:3000/api/v1/gateway/health

# 개별 서비스 상태
curl http://localhost:3000/api/v1/gateway/health/auth-service

# 메트릭스
curl http://localhost:3000/api/v1/gateway/metrics
```

## 아키텍처

### 미들웨어 체인
1. **보안**: Helmet, CORS
2. **요청 처리**: Body parsing, Compression
3. **식별**: Request ID, Logging
4. **인증**: JWT 검증
5. **인가**: 역할 기반 권한 확인
6. **Rate Limiting**: 요청 제한
7. **Timeout**: 요청 시간 제한
8. **프록시**: 서비스로 요청 전달
9. **에러 처리**: 표준화된 에러 응답

### 서비스 디스커버리
- 30초 간격으로 모든 서비스 헬스체크
- 서비스 장애 시 자동 제외
- 서비스 복구 시 자동 포함
- 로드 밸런싱 지원

### WebSocket 관리
- JWT 기반 연결 인증
- 스토어별/사용자별 이벤트 필터링
- 업스트림 서비스와 연결 유지
- 자동 재연결 시도

## 모니터링

### 로그 레벨
- **개발**: 모든 요청/응답 로깅
- **운영**: 에러 및 경고만 로깅

### 메트릭스
- 요청 수, 응답 시간, 에러율
- 서비스별 상태 및 성능
- 메모리, CPU 사용량

### 알림
- 서비스 장애 시 콘솔 경고
- WebSocket 연결 실패 시 재연결 시도

## Docker 배포

### 1. 이미지 빌드
```bash
docker build -t wafl/api-gateway .
```

### 2. 컨테이너 실행
```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-production-secret \
  wafl/api-gateway
```

### 3. Docker Compose
```yaml
api-gateway:
  build: .
  ports:
    - "3000:3000"
  environment:
    - NODE_ENV=production
    - JWT_SECRET=${JWT_SECRET}
  depends_on:
    - auth-service
    - store-management-service
```

## 보안 고려사항

1. **JWT Secret**: 운영 환경에서는 반드시 강력한 시크릿 키 사용
2. **HTTPS**: 운영 환경에서는 HTTPS 필수
3. **Rate Limiting**: DDoS 방지를 위한 적절한 제한
4. **CORS**: 허용된 도메인만 접근 가능
5. **헤더 검증**: 악의적인 헤더 필터링

## 성능 최적화

1. **연결 풀링**: HTTP Agent를 통한 연결 재사용
2. **압축**: Gzip 압축으로 대역폭 절약
3. **캐싱**: Redis를 통한 세션 캐싱 (선택사항)
4. **로드 밸런싱**: 여러 인스턴스 간 부하 분산

## 문제 해결

### 서비스 연결 실패
```bash
# 서비스 상태 확인
curl http://localhost:3000/api/v1/gateway/health

# 개별 서비스 상태 확인
curl http://localhost:3000/api/v1/gateway/health/auth-service
```

### WebSocket 연결 실패
1. JWT 토큰 확인
2. 네트워크 연결 상태 확인
3. 방화벽 설정 확인

### 높은 메모리 사용량
1. 헬스체크 간격 조정
2. 로그 레벨 조정
3. 연결 풀 크기 조정

---

**개발팀**: WAFL Team
**최종 업데이트**: 2025.09.16
**버전**: 1.0.0