# Analytics Service API 명세서

**포트**: 4007
**상태**: ⚠️ 구현 예정
**목적**: 매출 분석, 트렌드 분석, AI 기반 비즈니스 인사이트 제공

## 개요

Analytics Service는 WAFL POS 시스템의 비즈니스 인텔리전스를 담당하는 서비스입니다. 실시간 매출 분석, 트렌드 예측, AI 기반 경영 제안을 제공합니다.

## 주요 기능

### 1. 매출 분석
- 일별/주별/월별 매출 트렌드
- 시간대별 매출 패턴 분석
- 메뉴별 성과 분석
- 테이블 회전율 분석

### 2. 예측 분석
- 매출 예측 (주/월 단위)
- 메뉴 수요 예측
- 성수기/비수기 패턴 분석
- 날씨 기반 매출 예측

### 3. AI 기반 제안
- 메뉴 최적화 제안
- 운영시간 조정 제안
- 인력 배치 최적화
- 마케팅 전략 제안

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
    "dataProcessor": "operational",
    "mlModels": "operational",
    "lastAnalysis": "2024-01-01T12:00:00Z"
  }
}
```

### 1. 일일 매출 분석

```http
GET /api/v1/analytics/daily?date=2024-01-01
Authorization: Bearer {jwt_token}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "date": "2024-01-01",
    "totalRevenue": 2500000,
    "totalOrders": 85,
    "avgOrderValue": 29412,
    "peakHour": "19:00",
    "hourlyRevenue": {
      "11": 150000,
      "12": 450000,
      "13": 520000,
      "18": 380000,
      "19": 620000,
      "20": 380000
    },
    "menuPerformance": [
      {
        "menuId": "uuid",
        "name": "김치찌개",
        "quantity": 23,
        "revenue": 184000,
        "profitMargin": 65
      }
    ],
    "comparison": {
      "yesterday": {
        "revenue": 2100000,
        "change": "+19%"
      },
      "lastWeek": {
        "revenue": 2300000,
        "change": "+8.7%"
      },
      "lastMonth": {
        "revenue": 2200000,
        "change": "+13.6%"
      }
    },
    "customerMetrics": {
      "newCustomers": 15,
      "returningCustomers": 32,
      "avgStayTime": 45
    }
  }
}
```

### 2. 기간별 매출 트렌드

```http
GET /api/v1/analytics/trends?startDate=2024-01-01&endDate=2024-01-31&groupBy=daily
Authorization: Bearer {jwt_token}
```

**요청 파라미터**:
- `startDate`: 시작 날짜 (YYYY-MM-DD)
- `endDate`: 종료 날짜 (YYYY-MM-DD)
- `groupBy`: daily, weekly, monthly

**응답**:
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "totalRevenue": 65000000,
    "totalOrders": 2150,
    "avgDailyRevenue": 2096774,
    "dailyTrend": [
      {
        "date": "2024-01-01",
        "revenue": 2500000,
        "orders": 85,
        "growth": "+12%"
      }
    ],
    "weeklyPattern": {
      "monday": {
        "avgRevenue": 1800000,
        "avgOrders": 65
      },
      "tuesday": {
        "avgRevenue": 1900000,
        "avgOrders": 68
      },
      "friday": {
        "avgRevenue": 3200000,
        "avgOrders": 105
      },
      "saturday": {
        "avgRevenue": 3500000,
        "avgOrders": 115
      }
    },
    "seasonalTrends": {
      "growth": "+15%",
      "peakSeason": "winter",
      "predictedNextMonth": 68000000
    }
  }
}
```

### 3. 메뉴 성과 분석

```http
GET /api/v1/analytics/menu-performance?period=30d&sortBy=revenue
Authorization: Bearer {jwt_token}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "topPerformers": [
      {
        "menuId": "uuid",
        "name": "김치찌개",
        "category": "찌개류",
        "totalRevenue": 5500000,
        "totalQuantity": 687,
        "avgPrice": 8000,
        "profitMargin": 68,
        "growth": "+23%",
        "ranking": 1
      }
    ],
    "underPerformers": [
      {
        "menuId": "uuid",
        "name": "냉면",
        "category": "면류",
        "totalRevenue": 450000,
        "totalQuantity": 30,
        "avgPrice": 15000,
        "profitMargin": 45,
        "growth": "-15%",
        "suggestion": "계절 메뉴로 전환 고려"
      }
    ],
    "categoryAnalysis": [
      {
        "category": "찌개류",
        "revenue": 12000000,
        "percentage": 35,
        "trend": "increasing"
      }
    ]
  }
}
```

### 4. AI 매출 제안

```http
GET /api/v1/analytics/ai-suggestions?type=all&priority=high
Authorization: Bearer {jwt_token}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "id": "suggestion_001",
        "type": "menu",
        "priority": "high",
        "title": "크림 파스타 재출시 제안",
        "description": "최근 2주간 15명이 크림 파스타를 찾았습니다. 겨울 시즌 메뉴로 재출시하면 일 평균 150,000원 매출 증가가 예상됩니다.",
        "expectedImpact": {
          "revenueIncrease": "+150,000원/일",
          "orderIncrease": "+12건/일",
          "implementation": "즉시 가능"
        },
        "actionItems": [
          "메뉴 추가하기",
          "재료 주문하기",
          "직원 교육하기"
        ],
        "dataSource": "고객 요청 로그, 계절별 트렌드",
        "confidence": 85
      },
      {
        "id": "suggestion_002",
        "type": "operation",
        "priority": "medium",
        "title": "금요일 저녁 인력 보강",
        "description": "금요일 18-20시 대기시간이 평균 20분으로 고객 만족도 저하 우려. 아르바이트 1명 추가 시 대기시간 35% 단축 예상.",
        "expectedImpact": {
          "customerSatisfaction": "+15%",
          "orderVolume": "+8%",
          "costIncrease": "+80,000원/주"
        },
        "actionItems": [
          "아르바이트 채용 공고",
          "근무 스케줄 조정"
        ],
        "confidence": 78
      },
      {
        "id": "suggestion_003",
        "type": "pricing",
        "priority": "low",
        "title": "점심 세트 메뉴 가격 조정",
        "description": "점심 시간대 주문량 분석 결과, 세트 메뉴 가격을 1000원 인상해도 주문량 감소는 5% 미만일 것으로 예상.",
        "expectedImpact": {
          "revenueIncrease": "+320,000원/월",
          "orderDecrease": "-5%",
          "profitMargin": "+12%"
        }
      }
    ],
    "marketInsights": {
      "industryTrend": "배달 주문 22% 증가",
      "localCompetition": "반경 1km 내 신규 매장 2곳 오픈",
      "seasonalFactor": "겨울 시즌 진입으로 따뜻한 메뉴 선호도 상승"
    },
    "generatedAt": "2024-01-01T15:00:00Z"
  }
}
```

### 5. 실시간 대시보드 데이터

```http
GET /api/v1/analytics/realtime
Authorization: Bearer {jwt_token}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "currentHour": {
      "revenue": 245000,
      "orders": 12,
      "avgOrderValue": 20417
    },
    "todayVsYesterday": {
      "revenue": "+15%",
      "orders": "+8%",
      "customers": "+12%"
    },
    "activeMetrics": {
      "occupiedTables": 8,
      "totalTables": 20,
      "avgTableTurnover": 2.3,
      "kitchenQueueLength": 5
    },
    "hourlyForecast": [
      {
        "hour": 14,
        "predictedRevenue": 380000,
        "confidence": 82
      },
      {
        "hour": 15,
        "predictedRevenue": 420000,
        "confidence": 78
      }
    ]
  }
}
```

### 6. 고객 분석

```http
GET /api/v1/analytics/customers?period=30d
Authorization: Bearer {jwt_token}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCustomers": 1250,
      "newCustomers": 385,
      "returningCustomers": 865,
      "retentionRate": 69.2
    },
    "demographics": {
      "ageGroups": {
        "20-29": 35,
        "30-39": 28,
        "40-49": 22,
        "50+": 15
      },
      "preferredTime": {
        "lunch": 45,
        "dinner": 55
      }
    },
    "behaviorPatterns": {
      "avgOrderValue": 25000,
      "avgVisitFrequency": 2.1,
      "popularMenus": [
        "김치찌개",
        "불고기정식",
        "된장찌개"
      ]
    }
  }
}
```

## 데이터 모델

### Analytics Report
```typescript
interface AnalyticsReport {
  id: string;
  storeId: string;
  reportType: 'daily' | 'weekly' | 'monthly';
  period: {
    start: Date;
    end: Date;
  };
  metrics: ReportMetrics;
  generatedAt: Date;
}
```

### Report Metrics
```typescript
interface ReportMetrics {
  revenue: {
    total: number;
    growth: number;
    hourlyBreakdown?: number[];
  };
  orders: {
    total: number;
    avgValue: number;
    growth: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
  };
  menuPerformance: MenuPerformance[];
}
```

### AI Suggestion
```typescript
interface AISuggestion {
  id: string;
  storeId: string;
  type: 'menu' | 'operation' | 'pricing' | 'marketing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: {
    revenueIncrease?: string;
    costReduction?: string;
    customerSatisfaction?: string;
  };
  actionItems: string[];
  confidence: number;
  dataSource: string;
  createdAt: Date;
  status: 'pending' | 'applied' | 'dismissed';
}
```

## 성능 요구사항

### 데이터 처리
- 실시간 데이터: < 1초 응답
- 일일 리포트: < 3초 응답
- 월간 리포트: < 10초 응답
- AI 제안 생성: < 30초

### 데이터 보관
- 상세 데이터: 2년 보관
- 집계 데이터: 5년 보관
- 실시간 데이터: 7일 보관

### 확장성
- 동시 분석 요청: 50개
- 일일 데이터 처리량: 100MB
- 예측 모델 업데이트: 주 1회

## 에러 코드

| 코드 | 설명 |
|------|------|
| ANALYTICS_001 | 데이터 처리 오류 |
| ANALYTICS_002 | 분석 기간 오류 |
| ANALYTICS_003 | 예측 모델 오류 |
| ANALYTICS_004 | 데이터 부족 |
| ANALYTICS_005 | AI 제안 생성 실패 |

## 구현 계획

### Phase 1: 기본 분석 기능
- 일일/주간/월간 매출 분석
- 메뉴 성과 분석
- 기본 대시보드

### Phase 2: 예측 분석
- 매출 예측 모델
- 수요 예측 시스템
- 트렌드 분석

### Phase 3: AI 기반 제안
- 머신러닝 기반 제안 시스템
- 개인화된 인사이트
- 자동 알림 시스템

---

**연관 서비스**: AI Service, Dashboard Service, Order Service
**데이터 소스**: Order Service, Payment Service, User Profile Service
**예상 구현 기간**: 4-5주