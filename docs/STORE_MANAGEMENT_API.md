# Store Management Service API 가이드

## 개요
Store Management Service는 매장의 카테고리, 메뉴, 장소, 테이블을 관리하는 핵심 비즈니스 서비스입니다.

## 기본 정보
- **포트**: 4002
- **Base URL**: `http://localhost:4002`
- **API 버전**: v1
- **인증**: JWT Bearer Token (Auth Service와 동일한 secret 사용)

## 인증 방법

### JWT 토큰 발급 (Auth Service)
```bash
curl -X POST http://localhost:4001/api/v1/auth/login/pin \
  -H "Content-Type: application/json" \
  -d '{"storeCode":1001,"userPin":"1234"}'
```

### API 호출 시 토큰 사용
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:4002/api/v1/store/categories
```

## API 엔드포인트

### Health Check
```
GET /health
```
**응답 예시**:
```json
{
  "status": "UP",
  "service": "store-management-service",
  "timestamp": "2025-09-16T14:30:00.000Z",
  "version": "1.0.0"
}
```

## 1. Categories (카테고리 관리)

### 1.1 카테고리 목록 조회
```
GET /api/v1/store/categories
```

**응답 예시**:
```json
{
  "success": true,
  "data": [
    {
      "id": "01HZ1234-5678-9012-3456-789012345678",
      "name": "메인 요리",
      "color": "#FF5733",
      "sortOrder": 1,
      "createdAt": "2025-09-16T10:00:00.000Z"
    }
  ]
}
```

### 1.2 카테고리 생성
```
POST /api/v1/store/categories
```

**요청 본문**:
```json
{
  "name": "디저트",
  "color": "#8E44AD",
  "sortOrder": 5
}
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "id": "01HZ1234-5678-9012-3456-789012345679",
    "name": "디저트",
    "color": "#8E44AD",
    "sortOrder": 5,
    "storeId": "01HZ1234-5678-9012-3456-789012345678",
    "createdAt": "2025-09-16T14:30:00.000Z"
  }
}
```

### 1.3 카테고리 상세 조회
```
GET /api/v1/store/categories/:id
```

### 1.4 카테고리 수정
```
PUT /api/v1/store/categories/:id
```

**요청 본문**:
```json
{
  "name": "디저트 & 음료",
  "color": "#9B59B6"
}
```

### 1.5 카테고리 삭제
```
DELETE /api/v1/store/categories/:id
```

**응답**:
```json
{
  "success": true,
  "message": "카테고리가 성공적으로 삭제되었습니다"
}
```

## 2. Menus (메뉴 관리)

### 2.1 메뉴 목록 조회
```
GET /api/v1/store/menus?page=1&limit=10&categoryId=:categoryId&isAvailable=true
```

**쿼리 파라미터**:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 한 페이지당 항목 수 (기본값: 10, 최대: 50)
- `categoryId`: 카테고리 ID로 필터링
- `isAvailable`: 판매 가능 여부로 필터링

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "menus": [
      {
        "id": "01HZ1234-5678-9012-3456-789012345678",
        "name": "김치찌개",
        "description": "집에서 만든 듯한 깊은 맛의 김치찌개",
        "price": 8000,
        "imageUrl": "/uploads/menus/menu_123_optimized.webp",
        "tags": ["매운맛", "인기메뉴"],
        "allergens": ["대두"],
        "isAvailable": true,
        "stockQuantity": 20,
        "prepTime": 15,
        "calories": 350,
        "sortOrder": 1,
        "category": {
          "id": "01HZ1234-5678-9012-3456-789012345678",
          "name": "메인 요리",
          "color": "#FF5733"
        },
        "createdAt": "2025-09-16T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 18,
      "pages": 2
    }
  }
}
```

### 2.2 메뉴 생성
```
POST /api/v1/store/menus
```

**요청 본문**:
```json
{
  "categoryId": "01HZ1234-5678-9012-3456-789012345678",
  "name": "된장찌개",
  "description": "진한 된장 맛의 구수한 찌개",
  "price": 7500,
  "tags": ["구수한맛", "건강식"],
  "allergens": ["대두"],
  "isAvailable": true,
  "stockQuantity": 15,
  "prepTime": 12,
  "calories": 280,
  "sortOrder": 2
}
```

### 2.3 메뉴 이미지 업로드
```
POST /api/v1/store/menus/:id/image
Content-Type: multipart/form-data
```

**폼 데이터**:
- `image`: 이미지 파일 (JPEG, PNG, WebP)
- 최대 파일 크기: 5MB
- 자동 WebP 변환 및 리사이징

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "/uploads/menus/menu_123_optimized.webp"
  }
}
```

### 2.4 메뉴 상세 조회
```
GET /api/v1/store/menus/:id
```

### 2.5 메뉴 수정
```
PUT /api/v1/store/menus/:id
```

### 2.6 메뉴 삭제
```
DELETE /api/v1/store/menus/:id
```

## 3. Places (장소 관리)

### 3.1 장소 목록 조회
```
GET /api/v1/store/places
```

**응답 예시**:
```json
{
  "success": true,
  "data": [
    {
      "id": "01HZ1234-5678-9012-3456-789012345678",
      "name": "1층 홀",
      "color": "#3498DB",
      "sortOrder": 1,
      "createdAt": "2025-09-16T10:00:00.000Z"
    }
  ]
}
```

### 3.2 장소 생성
```
POST /api/v1/store/places
```

**요청 본문**:
```json
{
  "name": "2층 홀",
  "color": "#E74C3C",
  "sortOrder": 2
}
```

### 3.3 장소 상세 조회
```
GET /api/v1/store/places/:id
```

### 3.4 장소 수정
```
PUT /api/v1/store/places/:id
```

### 3.5 장소 삭제
```
DELETE /api/v1/store/places/:id
```

## 4. Tables (테이블 관리)

### 4.1 테이블 목록 조회
```
GET /api/v1/store/tables?placeId=:placeId&status=empty&minCapacity=4
```

**쿼리 파라미터**:
- `placeId`: 장소 ID로 필터링
- `status`: 테이블 상태로 필터링 (`empty`, `seated`, `ordered`)
- `minCapacity`: 최소 수용 인원으로 필터링

**응답 예시**:
```json
{
  "success": true,
  "data": [
    {
      "id": "01HZ1234-5678-9012-3456-789012345678",
      "name": "Table 1",
      "capacity": 4,
      "status": "empty",
      "qrCode": "QR_1001_001",
      "place": {
        "id": "01HZ1234-5678-9012-3456-789012345678",
        "name": "1층 홀",
        "color": "#3498DB"
      },
      "createdAt": "2025-09-16T10:00:00.000Z"
    }
  ]
}
```

### 4.2 테이블 생성 (QR 코드 자동 생성)
```
POST /api/v1/store/tables
```

**요청 본문**:
```json
{
  "placeId": "01HZ1234-5678-9012-3456-789012345678",
  "name": "Table 5",
  "capacity": 6
}
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "table": {
      "id": "01HZ1234-5678-9012-3456-789012345679",
      "name": "Table 5",
      "capacity": 6,
      "status": "empty",
      "qrCode": "QR_1001_005",
      "place": {
        "id": "01HZ1234-5678-9012-3456-789012345678",
        "name": "1층 홀"
      },
      "createdAt": "2025-09-16T14:30:00.000Z"
    },
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

### 4.3 테이블 상태 변경
```
PATCH /api/v1/store/tables/:id/status
```

**요청 본문**:
```json
{
  "status": "seated"
}
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "id": "01HZ1234-5678-9012-3456-789012345678",
    "status": "seated",
    "updatedAt": "2025-09-16T14:30:00.000Z"
  }
}
```

### 4.4 QR 코드 재생성
```
POST /api/v1/store/tables/:id/regenerate-qr
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "qrString": "QR_1001_001_NEW"
  }
}
```

### 4.5 테이블 일괄 생성
```
POST /api/v1/store/tables/bulk
```

**요청 본문**:
```json
{
  "placeId": "01HZ1234-5678-9012-3456-789012345678",
  "startNumber": 10,
  "count": 5,
  "capacity": 4
}
```

**응답**: Table 10 ~ Table 14까지 5개 테이블 생성

### 4.6 테이블 상세 조회
```
GET /api/v1/store/tables/:id
```

### 4.7 테이블 수정
```
PUT /api/v1/store/tables/:id
```

### 4.8 테이블 삭제
```
DELETE /api/v1/store/tables/:id
```

**주의**: 주문 이력이 있는 테이블은 삭제할 수 없습니다.

## 에러 응답

### 일반적인 에러 형식
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

### 주요 에러 코드
- `AUTH_001`: 인증 토큰이 없습니다
- `AUTH_002`: 토큰이 유효하지 않습니다
- `AUTH_003`: 권한이 없습니다
- `VALIDATION_ERROR`: 입력값 검증 실패
- `NOT_FOUND`: 리소스를 찾을 수 없습니다
- `CONFLICT`: 리소스 충돌 (예: 중복된 이름)

### 검증 에러 예시
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다",
    "details": [
      {
        "field": "name",
        "message": "이름은 필수입니다"
      },
      {
        "field": "price",
        "message": "가격은 0보다 커야 합니다"
      }
    ]
  }
}
```

## 캐시 정보
- **캐시 시스템**: 인메모리 캐시 (Redis 대체)
- **TTL**: 3600초 (1시간)
- **캐시 키 패턴**: `{storeId}:{type}[:id]`
- **무효화**: 생성/수정/삭제 시 자동 무효화

## 기술 스택
- **Framework**: Express.js + TypeScript
- **인증**: JWT (Auth Service와 동일한 secret)
- **데이터베이스**: PostgreSQL + Prisma ORM
- **이미지 처리**: Sharp (WebP 변환, 리사이징)
- **QR 코드**: qrcode 라이브러리
- **파일 업로드**: Multer
- **검증**: express-validator
- **캐시**: 인메모리 캐시 시스템

## 개발 환경 설정

### 환경 변수 (.env)
```
NODE_ENV=development
PORT=4002
SERVICE_NAME=store-management-service

DATABASE_URL=postgresql://postgres:password@localhost:5432/aipos?schema=public

CACHE_TTL=3600

AUTH_SERVICE_URL=http://localhost:4001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

QR_BASE_URL=https://order.aipos.kr

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 개발 서버 실행
```bash
cd backend/core/store-management-service
npm run dev  # 포트 4002에서 실행
```

### 테스트
```bash
# 헬스체크
curl http://localhost:4002/health

# JWT 토큰 발급
TOKEN=$(curl -s -X POST http://localhost:4001/api/v1/auth/login/pin \
  -H "Content-Type: application/json" \
  -d '{"storeCode":1001,"userPin":"1234"}' | \
  jq -r '.data.accessToken')

# API 테스트
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/v1/store/categories
```

## 최종 업데이트
2025.09.16 - Store Management Service 완전 구현 완료