# AI Service API 명세서

**포트**: 3006
**상태**: ⚠️ 구현 예정
**목적**: AI Agent 기반 주문 처리, 자연어 이해, 경영 컨설팅

## 개요

AI Service는 WAFL 시스템의 핵심 AI 기능을 담당하는 서비스입니다. 점주를 위한 경영 컨설팅 AI와 고객을 위한 메뉴 추천 AI를 제공합니다.

## 주요 기능

### 1. 점주 AI 상담 (경영 컨설팅)
- 매출 분석 및 제안
- 메뉴 최적화 추천
- 운영 효율성 개선 제안
- 시장 트렌드 분석

### 2. 고객 AI 챗 (메뉴 추천)
- 다국어 메뉴 설명
- 개인화된 메뉴 추천
- 알레르기/선호도 기반 필터링
- 문화적 배경 고려한 설명

### 3. 메뉴 번역 및 설명
- 실시간 메뉴 번역
- 문화적 컨텍스트 추가
- 알레르기 정보 번역
- 조리법 간단 설명

## API 엔드포인트

### 헬스체크
```http
GET /health
```

**응답**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "aiModels": {
      "nlp": "operational",
      "translation": "operational",
      "recommendation": "operational"
    },
    "uptime": 3600
  }
}
```

### 1. 점주 AI 상담

#### 채팅 요청
```http
POST /api/v1/ai/agent/chat
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**요청 본문**:
```json
{
  "sessionId": "uuid",
  "message": "오늘 매출이 어때?",
  "context": {
    "type": "owner",
    "includeAnalytics": true,
    "dateRange": "today"
  }
}
```

**응답 (Server-Sent Events)**:
```
data: {"chunk": "오늘 매출을 분석해보니 "}
data: {"chunk": "전일 대비 15% 상승했네요. "}
data: {"chunk": "특히 점심 시간대(12-14시) 매출이 "}
data: {"done": true, "fullResponse": "오늘 매출을 분석해보니 전일 대비 15% 상승했네요..."}
```

#### Quick Questions 조회
```http
GET /api/v1/ai/quick-questions?type=owner
Authorization: Bearer {jwt_token}
```

**응답**:
```json
{
  "success": true,
  "data": [
    "오늘의 매출은?",
    "가장 인기 있는 메뉴는?",
    "재고 부족한 재료는?",
    "내일 날씨에 따른 메뉴 추천은?"
  ]
}
```

### 2. 고객 AI 챗

#### 메뉴 추천 채팅
```http
POST /api/v1/ai/customer/chat
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**요청 본문**:
```json
{
  "sessionId": "uuid",
  "customerId": "uuid",
  "message": "What's good here?",
  "language": "en",
  "context": {
    "tableId": "uuid",
    "preferences": ["no-spicy", "vegetarian"]
  }
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "response": "I recommend our signature Bibimbap, which is perfect for vegetarians and contains fresh seasonal vegetables...",
    "recommendations": [
      {
        "menuId": "uuid",
        "name": "Vegetable Bibimbap",
        "reason": "Perfect for vegetarians",
        "price": 12000,
        "culturalNote": "Traditional Korean mixed rice bowl"
      }
    ],
    "quickQuestions": [
      "Do you have any allergies?",
      "Would you like drink recommendations?",
      "How spicy can you handle?"
    ]
  }
}
```

### 3. 메뉴 번역

#### 메뉴 설명 AI 번역
```http
POST /api/v1/ai/translate/menu
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**요청 본문**:
```json
{
  "menuId": "uuid",
  "targetLanguage": "ja",
  "includeAllergens": true,
  "includeCulturalNote": true
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "name": "キムチチゲ",
    "description": "3ヶ月熟成キムチで作った濃厚なチゲスープです",
    "allergens": "豚肉、大豆を含む",
    "culturalNote": "韓国の代表的な家庭料理で、寒い日に特に人気があります",
    "spiceLevel": "中辛",
    "preparationTime": "約15分"
  }
}
```

## 데이터 모델

### AI Chat Session
```typescript
interface AIChatSession {
  id: string;
  userId: string;
  storeId: string;
  type: 'owner' | 'customer';
  language: string;
  context: Record<string, any>;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
}
```

### Chat Message
```typescript
interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    recommendations?: MenuRecommendation[];
    quickQuestions?: string[];
    analytics?: any;
  };
}
```

### Menu Recommendation
```typescript
interface MenuRecommendation {
  menuId: string;
  name: string;
  reason: string;
  price: number;
  confidence: number;
  culturalNote?: string;
  dietaryTags?: string[];
}
```

## 에러 코드

| 코드 | 설명 |
|------|------|
| AI_001 | AI 서비스 일반 오류 |
| AI_002 | 언어 번역 실패 |
| AI_003 | 메뉴 추천 생성 실패 |
| AI_004 | 세션 만료 |
| AI_005 | 지원하지 않는 언어 |
| AI_006 | AI 모델 응답 시간 초과 |

## 사용 예시

### 점주 AI 상담 플로우
```javascript
// 1. 세션 시작
const sessionId = generateUUID();

// 2. 질문하기
const response = await fetch('/api/v1/ai/agent/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId,
    message: "이번 주 매출 분석해줘",
    context: {
      type: "owner",
      includeAnalytics: true,
      dateRange: "week"
    }
  })
});

// 3. SSE로 실시간 응답 받기
const eventSource = new EventSource('/api/v1/ai/agent/chat/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.done) {
    console.log('AI 응답 완료:', data.fullResponse);
  } else {
    console.log('스트리밍:', data.chunk);
  }
};
```

### 고객 메뉴 추천 플로우
```javascript
// 1. 고객 언어 설정
const customerLanguage = 'en'; // 또는 'ko', 'ja', 'zh' 등

// 2. 메뉴 추천 요청
const recommendation = await fetch('/api/v1/ai/customer/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${customerToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: customerSessionId,
    customerId: customerId,
    message: "I'm vegetarian, what do you recommend?",
    language: customerLanguage,
    context: {
      tableId: tableId,
      preferences: ["vegetarian", "no-spicy"]
    }
  })
});
```

## 성능 요구사항

### 응답 시간
- 메뉴 추천: < 2초
- 간단한 질답: < 1초
- 복잡한 분석: < 5초
- 번역: < 1초

### 동시 처리
- 최대 100개 동시 세션
- 세션당 최대 50개 메시지
- 세션 만료: 30분 비활성

### 캐싱 전략
- 메뉴 번역 결과: 24시간 캐시
- 자주 묻는 질문: 1시간 캐시
- 추천 결과: 15분 캐시

## 보안 고려사항

### 데이터 보호
- 고객 개인정보 익명화
- 매출 데이터 암호화
- 세션 데이터 임시 저장만

### 접근 제어
- 점주 전용 기능 역할 기반 제한
- 고객 세션 테이블별 격리
- API Rate Limiting 적용

## 구현 계획

### Phase 1: 기본 번역 기능
- 메뉴 다국어 번역
- 기본 고객 챗봇

### Phase 2: 고급 추천 시스템
- ML 기반 메뉴 추천
- 개인화 알고리즘

### Phase 3: 경영 분석 AI
- 점주 상담 AI
- 매출 예측 및 제안

---

**다음 구현 대상**: 이 서비스는 History Service 다음으로 구현될 예정입니다.
**연관 서비스**: Analytics Service, Notification Service
**예상 구현 기간**: 3-4주