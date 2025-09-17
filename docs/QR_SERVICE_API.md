# QR Service API 명세서

**포트**: 3012
**상태**: ⚠️ 계획 중
**목적**: QR 코드 생성, 관리, 검증 및 보안

## 개요

QR Service는 WAFL 시스템의 QR 코드 생성과 관리를 담당하는 서비스입니다. 테이블별 고유 QR 코드 생성, 동적 QR 코드 관리, 보안 검증을 제공합니다.

## 주요 기능

### 1. QR 코드 생성
- 테이블별 고유 QR 생성
- 동적 QR 코드 (시간 제한)
- 정적 QR 코드 (영구)
- 커스텀 디자인 QR

### 2. QR 코드 관리
- QR 갱신 및 만료 관리
- 사용 통계 추적
- 대량 QR 생성

### 3. 보안 및 검증
- QR 코드 유효성 검사
- 접근 제어 및 권한 확인
- 위변조 방지

## API 엔드포인트

### 1. QR 코드 생성
```http
POST /api/v1/qr/generate
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**요청 본문**:
```json
{
  "tableId": "uuid",
  "type": "dynamic",
  "expiresIn": 300,
  "customization": {
    "logo": true,
    "color": "#000000",
    "size": "medium"
  }
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "qrCode": "QR_TABLE_01_20240101_120000",
    "qrImageUrl": "https://api.aipos.kr/qr/images/...",
    "qrImageBase64": "data:image/png;base64,...",
    "expiresAt": "2024-01-01T12:05:00Z"
  }
}
```

### 2. QR 코드 갱신
```http
POST /api/v1/qr/refresh/{tableId}
Authorization: Bearer {jwt_token}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "newQrCode": "QR_TABLE_01_20240101_120500",
    "qrImageUrl": "https://...",
    "expiresAt": "2024-01-01T12:10:00Z",
    "oldQrCode": "QR_TABLE_01_20240101_120000"
  }
}
```

### 3. QR 검증
```http
POST /api/v1/qr/validate
Content-Type: application/json
```

**요청 본문**:
```json
{
  "qrCode": "QR_TABLE_01_20240101_120000"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "tableId": "uuid",
    "tableName": "Table 1",
    "storeId": "uuid",
    "storeName": "맛있는 레스토랑",
    "expiresAt": "2024-01-01T12:05:00Z",
    "metadata": {
      "placeId": "place_uuid",
      "placeName": "1st Floor",
      "capacity": 4
    }
  }
}
```

### 4. QR 사용 통계
```http
GET /api/v1/qr/statistics?period=7d
Authorization: Bearer {jwt_token}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "totalScans": 1247,
    "uniqueUsers": 892,
    "avgScansPerTable": 15.6,
    "peakHours": ["12:00", "19:00"],
    "tableStats": [
      {
        "tableId": "uuid",
        "tableName": "Table 1",
        "scans": 45,
        "lastScan": "2024-01-01T15:30:00Z"
      }
    ]
  }
}
```

### 5. 대량 QR 생성
```http
POST /api/v1/qr/bulk-generate
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**요청 본문**:
```json
{
  "placeId": "place_uuid",
  "tableCount": 20,
  "type": "static",
  "customization": {
    "includeTableName": true,
    "format": "png",
    "size": "large"
  }
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "batchId": "batch_uuid",
    "status": "processing",
    "totalTables": 20,
    "downloadUrl": null,
    "estimatedTime": 60
  }
}
```

## 데이터 모델

### QR Code
```typescript
interface QRCode {
  id: string;
  tableId: string;
  storeId: string;
  code: string;
  type: 'static' | 'dynamic';
  status: 'active' | 'expired' | 'revoked';
  createdAt: Date;
  expiresAt?: Date;
  scanCount: number;
  lastScannedAt?: Date;
  metadata: {
    imageUrl: string;
    customization: QRCustomization;
  };
}
```

### QR Customization
```typescript
interface QRCustomization {
  size: 'small' | 'medium' | 'large';
  color: string;
  backgroundColor: string;
  logo: boolean;
  format: 'png' | 'svg' | 'pdf';
  errorCorrection: 'low' | 'medium' | 'quartile' | 'high';
}
```

---

**연관 서비스**: Store Management Service, Auth Service
**예상 구현 기간**: 2주