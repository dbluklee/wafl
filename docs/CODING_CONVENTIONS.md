# 코딩 컨벤션

## TypeScript 설정
- **Strict Mode 활성화**: 모든 서비스에서 타입 안정성 보장
- **Path Mapping 설정**: `@shared/*` 경로로 공유 모듈 접근
- **서비스별 tsconfig 분리**: backend/frontend 각각 최적화된 설정
- **빌드 타겟**: Backend ES2022/CommonJS, Frontend ES2020/ESNext

## 네이밍 컨벤션 (강제 규칙)

### TypeScript
```typescript
// 1. Interface는 I 접두사 사용
interface IUser {
  id: string;
  name: string;
}

// 2. Type은 T 접두사 사용
type TOrderStatus = 'pending' | 'confirmed' | 'cooking';

// 3. Enum은 E 접두사 사용
enum EUserRole {
  OWNER = 'owner',
  STAFF = 'staff'
}

// 4. 함수는 동사로 시작
async function createOrder(data: IOrderRequest): Promise<IOrder> {
  // 구현
}

// 5. 상수는 UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
```

### API 응답 형식
```typescript
// 성공 응답
interface IApiResponse<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

// 에러 응답
interface IApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Docker 아키텍처 결정사항
- **네트워크**: 커스텀 브리지 네트워크 (172.20.0.0/16)
- **볼륨**: 데이터 영속성을 위한 named volumes
- **헬스체크**: 모든 서비스에 30초 간격 헬스체크 적용
- **개발환경**: hot-reload용 볼륨 마운트 설정
- **프로덕션**: 리소스 제한 및 복제 설정

## Git 워크플로우 설정
- **pre-commit**: ESLint + Prettier 자동 실행
- **commit-msg**: 커밋 메시지 형식 강제 (type(scope): description)
- **pre-push**: TypeScript 검사 + 테스트 실행

## 보안 가이드라인
- 모든 API에 인증/인가 검증
- SQL Injection 방지 (Prisma ORM 사용)
- XSS 방지 (입력값 검증 및 이스케이프)
- CORS 설정으로 도메인 제한
- Rate Limiting으로 DDoS 방지
- 민감 정보는 환경변수로 관리
- JWT 토큰 만료 시간 설정
- Redis 세션 관리

## 성능 최적화
- Database 쿼리 최적화 (인덱스 활용)
- Redis 캐싱 적극 활용
- 이미지 최적화 및 CDN 사용
- API 응답 압축 (gzip)
- 불필요한 데이터 전송 최소화
- 백그라운드 작업은 Queue 활용
- Database Connection Pool 설정