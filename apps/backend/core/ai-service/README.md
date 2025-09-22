# WAFL AI Service

**WAFL AI POS System의 AI 서비스** - Ollama 기반 점주 경영 컨설팅, 고객 대화, 메뉴 추천, 다국어 번역을 제공하는 핵심 서비스입니다.

## 🎯 서비스 개요

- **서비스명**: AI Service
- **포트**: 4006
- **버전**: 1.0.0
- **LLM 엔진**: Ollama (gemma3:27b-it-q4_K_M)
- **개발 완료일**: 2025.09.17

## 🚀 핵심 기능

### 1. 점주 AI Agent (경영 컨설팅)
- 📊 **실시간 분석**: 매출 데이터 기반 경영 인사이트 제공
- 🎯 **맞춤형 조언**: 매장별 데이터를 활용한 개선 방안 제시
- 📈 **비즈니스 인사이트**: 수익 증대, 비용 절감, 운영 최적화 제안
- 💬 **자연어 대화**: 점주와의 자연스러운 한국어 대화
- 🔄 **스트리밍 응답**: Server-Sent Events 기반 실시간 답변

### 2. 고객 AI Chat (메뉴 추천)
- 🍽️ **메뉴 추천**: 개인 취향 기반 맞춤형 메뉴 제안
- 🌍 **다국어 지원**: 한국어, 영어, 일본어, 중국어 등 10개 언어
- 🚫 **알레르기 고려**: 알레르기 정보 기반 안전한 메뉴 추천
- 🌱 **식단 제한**: 채식, 비건 등 식단 제한 고려
- 📝 **빠른 질문**: 자주 묻는 질문 자동 생성

### 3. 다국어 번역 서비스
- 📋 **메뉴 번역**: 메뉴명, 설명, 알레르기 정보 번역
- 🏪 **매장 일괄번역**: 전체 메뉴 대량 번역
- 🎭 **문화적 설명**: 현지 문화에 맞는 음식 설명 추가
- ⚡ **고성능 캐싱**: 번역 결과 1시간 캐시로 빠른 응답
- 🎯 **품질 평가**: AI 기반 번역 품질 자동 평가

### 4. 비즈니스 제안 시스템
- 📊 **매출 분석**: 일/주/월별 매출 패턴 분석
- 🍜 **메뉴 최적화**: 인기도와 수익성 기반 메뉴 제안
- ⚙️ **운영 개선**: 효율성 향상을 위한 운영 방안 제시
- 🎨 **마케팅 아이디어**: 고객 유치를 위한 마케팅 전략

## 🏗️ 기술 스택

### Backend Framework
- **Node.js** + **Express.js** + **TypeScript**
- **Ollama SDK** - LLM 통신
- **Winston** - 구조화된 로깅

### AI & Machine Learning
- **Ollama Server**: http://112.148.37.41:1884
- **LLM Model**: gemma3:27b-it-q4_K_M (27B 파라미터, Q4_K_M 양자화)
- **프롬프트 엔지니어링**: 역할별 최적화된 시스템 프롬프트

### Performance & Caching
- **TTL 기반 인메모리 캐시**: 30초/5분/1시간 단계별 캐싱
- **스트리밍 응답**: SSE(Server-Sent Events) 실시간 스트림
- **Rate Limiting**: API 호출량 제한 및 보호

### Security & Auth
- **JWT 인증**: 다른 서비스와 동일한 토큰 검증
- **역할 기반 접근 제어**: 점주/직원 권한 분리
- **입력 검증**: Express Validator 기반 요청 검증

## 📡 API 엔드포인트

### 점주 AI Agent (점주 전용)
```http
POST /api/v1/ai/agent/chat
GET  /api/v1/ai/agent/quick-questions
GET  /api/v1/ai/agent/sessions/:sessionId
POST /api/v1/ai/agent/sessions
GET  /api/v1/ai/agent/insights
POST /api/v1/ai/agent/sessions/:sessionId/summary
```

### 고객 AI Chat (공개)
```http
POST /api/v1/ai/customer/chat
POST /api/v1/ai/customer/recommend
GET  /api/v1/ai/customer/quick-questions
```

### 번역 서비스 (공개)
```http
POST /api/v1/ai/translate/text
POST /api/v1/ai/translate/menu
POST /api/v1/ai/translate/batch
POST /api/v1/ai/translate/store/:storeId
```

### 제안 시스템 (점주 전용)
```http
GET  /api/v1/ai/suggestions/revenue
GET  /api/v1/ai/suggestions/menu
POST /api/v1/ai/analyze/feedback
```

### Health Check (공개)
```http
GET  /health
```

## 🚦 서비스 상태 확인

### 1. Health Check
```bash
curl http://localhost:4006/health
```

**응답 예시**:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-17T07:21:30.592Z",
  "uptime": 10,
  "version": "1.0.0",
  "service": "ai-service",
  "dependencies": {
    "ollama": "connected",
    "cache": { "status": "active", "size": 0 }
  },
  "memory": { "rss": 116, "heapTotal": 40 },
  "environment": "development"
}
```

### 2. Ollama 연결 확인
```bash
curl http://112.148.37.41:1884/api/tags
```

## 🔧 개발 환경 설정

### 1. 환경 변수 (.env)
```env
NODE_ENV=development
PORT=4006
DATABASE_URL=postgresql://postgres:Cl!Wm@Dp!Dl@Em!@localhost:5432/aipos
JWT_SECRET=your-jwt-secret-key-here-change-in-production

# Ollama Configuration
OLLAMA_BASE_URL=http://112.148.37.41:1884
OLLAMA_MODEL=gemma3:27b-it-q4_K_M

# AI Settings
AI_TEMPERATURE=0.7
AI_TOP_P=0.9
AI_MAX_TOKENS=2048
AI_STREAM=true
CONVERSATION_TTL=1800
CACHE_TTL=3600
RATE_LIMIT_ENABLED=true

# External Services
STORE_MANAGEMENT_URL=http://localhost:4002
DASHBOARD_SERVICE_URL=http://localhost:4003
ORDER_SERVICE_URL=http://localhost:4004
AUTH_SERVICE_URL=http://localhost:4001
```

### 2. 개발 명령어
```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start

# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 테스트 실행
npm test
```

## 🔄 서비스 통합

### 1. 다른 서비스와의 연동
- **Store Management Service** (4002): 매장/메뉴 정보 조회
- **Dashboard Service** (4003): 실시간 매출 분석 데이터
- **Order Service** (4004): 주문 패턴 및 고객 선호도 분석
- **Auth Service** (4001): JWT 토큰 검증

### 2. 캐시 전략
- **짧은 캐시 (30초)**: 실시간 매출 데이터, 주문 현황
- **중간 캐시 (5분)**: 메뉴 정보, 매장 설정, 고객 컨텍스트
- **긴 캐시 (1시간)**: 번역 결과, 비즈니스 인사이트

## 🎨 사용 예시

### 1. 점주 경영 상담 (스트리밍)
```javascript
const eventSource = new EventSource('/api/v1/ai/agent/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: 'uuid-here',
    message: '오늘 매출이 어떤가요?',
    context: { includeAnalytics: true, dateRange: 'today' }
  })
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.done) {
    console.log('응답 완료:', data.metadata);
  } else {
    console.log('실시간 응답:', data.chunk);
  }
};
```

### 2. 메뉴 번역
```javascript
const response = await fetch('/api/v1/ai/translate/menu', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    menuId: 'menu-uuid',
    targetLang: 'en',
    includeAllergens: true
  })
});

const translation = await response.json();
console.log(translation.data);
// Output: { translatedName: "Kimchi Stew", culturalNotes: [...] }
```

### 3. 고객 메뉴 추천
```javascript
const response = await fetch('/api/v1/ai/customer/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerId: 'customer-id',
    preferences: ['매운맛', '해산물'],
    budget: 30000,
    numberOfPeople: 2
  })
});

const recommendations = await response.json();
console.log(recommendations.data);
// Output: [{ name: "해물찜", reason: "매운맛과 해산물 선호도 반영", confidence: 0.9 }]
```

## 🔍 모니터링 & 로깅

### 1. Winston 구조화 로깅
- **일별 로그 로테이션**: `logs/combined.log`, `logs/error.log`
- **AI 전용 로깅**: 채팅 요청/응답, 번역, 캐시 히트율
- **성능 추적**: 응답 시간, 토큰 사용량, Ollama API 호출

### 2. 실시간 통계
```bash
# 캐시 통계 확인 (health 엔드포인트에 포함)
curl http://localhost:4006/health | jq '.dependencies.cache'

# 메모리 사용량 모니터링
curl http://localhost:4006/health | jq '.memory'
```

### 3. 백그라운드 작업
- **캐시 정리**: 매 5분마다 만료된 캐시 엔트리 제거
- **세션 정리**: 매 10분마다 만료된 대화 세션 제거

## 🛠️ 개발 가이드

### 1. 새로운 AI 기능 추가
1. `src/types/index.ts`에 타입 정의 추가
2. `src/services/` 에 비즈니스 로직 구현
3. `src/controllers/` 에 API 핸들러 구현
4. `src/routes/` 에 라우트 등록
5. 프롬프트 템플릿을 `src/utils/prompt-templates.ts`에 추가

### 2. 프롬프트 최적화
- 시스템 프롬프트는 역할별로 분리
- 컨텍스트 정보를 동적으로 주입
- 토큰 사용량 최소화를 위한 간결한 표현
- 한국어/영어 이중 언어 지원

### 3. 캐싱 전략 확장
```typescript
// 새로운 캐시 타입 추가 예시
cache.setLong(`custom:${key}`, data); // 1시간 캐시
cache.getMedium<Type>(`another:${key}`); // 5분 캐시 조회
```

## 🚨 트러블슈팅

### 1. Ollama 연결 실패
```bash
# Ollama 서버 상태 확인
curl http://112.148.37.41:1884/api/tags

# 모델 로드 상태 확인
curl http://112.148.37.41:1884/api/show -d '{"name":"gemma3:27b-it-q4_K_M"}'
```

### 2. 메모리 사용량 증가
- 캐시 크기 모니터링: `/health` 엔드포인트 확인
- 대화 세션 정리: `contextService.cleanupExpiredSessions()`
- 캐시 수동 정리: `cache.cleanup()` 호출

### 3. 응답 속도 저하
- 캐시 히트율 확인 (목표: 70% 이상)
- Ollama 서버 부하 상태 점검
- 프롬프트 길이 최적화 (2000자 이내 권장)

## 📝 업데이트 로그

### v1.0.0 (2025.09.17)
- ✅ Ollama 기반 AI 서비스 완전 구현
- ✅ 점주 경영 컨설팅 Agent 완성
- ✅ 고객 메뉴 추천 시스템 완성
- ✅ 10개 언어 번역 서비스 완성
- ✅ 비즈니스 인사이트 생성 시스템
- ✅ SSE 스트리밍 응답 구현
- ✅ TTL 기반 캐싱 시스템 완성
- ✅ Rate Limiting 및 보안 강화
- ✅ Winston 구조화 로깅 완성
- ✅ TypeScript 엄격 모드 완전 지원

---

**🎉 AI Service 구현 완료!**

WAFL AI POS System의 핵심 AI 기능을 모두 갖춘 완전한 서비스입니다. Ollama와 Gemma3 모델을 활용하여 점주에게는 전문적인 경영 컨설팅을, 고객에게는 개인화된 메뉴 추천을 제공합니다.

**포트 4006**에서 실행 중이며, 다른 WAFL 서비스들과 완벽하게 통합됩니다.