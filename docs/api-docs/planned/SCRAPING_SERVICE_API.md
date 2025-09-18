# Menu Scraping Service API 명세서

**포트**: 4011
**상태**: ⚠️ 계획 중
**목적**: 네이버플레이스, 배달앱 메뉴 자동 수집 및 동기화

## 개요

Menu Scraping Service는 외부 플랫폼(네이버플레이스, 배달의민족 등)에서 메뉴 정보를 자동으로 수집하여 WAFL 시스템에 동기화하는 서비스입니다.

## 주요 기능

### 1. 메뉴 스크래핑
- 네이버플레이스 메뉴 수집
- 배달 플랫폼 메뉴 수집
- 이미지 자동 다운로드
- 가격 정보 추출

### 2. 자동 동기화
- 실시간 메뉴 업데이트
- 가격 변동 감지
- 품절 상태 동기화

### 3. 데이터 검증
- 메뉴 정보 유효성 검사
- 중복 메뉴 병합
- 카테고리 자동 분류

## API 엔드포인트

### 1. 스크래핑 요청
```http
POST /api/v1/scraping/menus
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**요청 본문**:
```json
{
  "platform": "naver",
  "url": "https://place.naver.com/restaurant/123456",
  "autoSync": true
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "jobId": "job_uuid",
    "status": "processing",
    "estimatedTime": 30
  }
}
```

### 2. 스크래핑 상태 확인
```http
GET /api/v1/scraping/jobs/{jobId}
Authorization: Bearer {jwt_token}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "jobId": "job_uuid",
    "status": "completed",
    "progress": 100,
    "result": {
      "menuCount": 35,
      "categoryCount": 5,
      "menus": [
        {
          "name": "김치찌개",
          "price": 8000,
          "description": "진한 국물의 김치찌개",
          "imageUrl": "https://...",
          "category": "찌개류"
        }
      ]
    },
    "completedAt": "2024-01-01T12:00:30Z"
  }
}
```

### 3. 스크래핑된 메뉴 적용
```http
POST /api/v1/scraping/apply/{jobId}
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**요청 본문**:
```json
{
  "overwriteExisting": false,
  "selectedMenuIds": ["menu1", "menu2"]
}
```

---

**연관 서비스**: Store Management Service
**예상 구현 기간**: 3-4주