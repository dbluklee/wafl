# 기술적 결정사항 및 아키텍처 패턴

## 🔧 핵심 아키텍처 결정사항

### API Gateway 아키텍처 패턴
- **중앙화된 라우팅**: 모든 마이크로서비스 요청의 단일 진입점
- **지능형 프록시**: 서비스 디스커버리 및 로드 밸런싱 준비
- **실시간 모니터링**: 30초 간격 헬스체크 및 메트릭스 수집
- **WebSocket 프록시**: 실시간 이벤트 브로드캐스팅 시스템
- **통합 보안**: JWT 인증, Rate Limiting, CORS 중앙 관리

### Auth Service 아키텍처 패턴
- **계층화 아키텍처**: Controllers → Services → Database
- **의존성 주입**: 각 계층 간 인터페이스 기반 분리
- **에러 처리**: 중앙화된 에러 핸들러 + 비즈니스 예외
- **검증 시스템**: express-validator + 커스텀 검증 규칙
- **세션 관리**: 인메모리 스토어 (개발용) / Redis (운영용)

### Store Management Service 아키텍처 패턴
- **4계층 아키텍처**: Routes → Controllers → Services → Database
- **JWT 로컬 검증**: Auth Service와 동일한 secret 사용
- **인메모리 캐시**: TTL 기반 캐시 시스템 (Redis 대체)
- **이미지 처리**: Sharp + WebP 최적화 + 리사이징
- **QR 코드 생성**: qrcode 라이브러리 + Base64 인코딩
- **파일 업로드**: Multer + 타입/크기 검증
- **권한 관리**: JWT + 점주 전용 미들웨어

### Order Service 아키텍처 패턴
- **주문 중심 아키텍처**: Order + Kitchen 이중 시스템
- **실시간 WebSocket**: 매장/테이블/주방별 이벤트 브로드캐스팅
- **주문 번호 생성기**: 일일 리셋, 충돌 방지, 순차 증가
- **상태 전환 검증**: 무효한 상태 변경 차단 시스템
- **재고 연동**: 트랜잭션 기반 안전한 재고 증감
- **주방 큐 관리**: 대기/조리중/완료 큐 분리, 우선순위 지원
- **인메모리 캐시**: 고성능 TTL 기반 캐시 시스템

### Dashboard Service 아키텍처 패턴
- **대시보드 중심 아키텍처**: Dashboard + Log 이중 시스템
- **실시간 WebSocket**: Socket.IO 기반 매장/테이블별 이벤트 브로드캐스팅
- **테이블 상태 관리**: 실시간 좌석 현황, Undo 가능한 상태 변경
- **통계 집계 시스템**: 일일/시간별 매출, 주문, 고객 통계 계산
- **POS 로그 시스템**: 히스토리 추적, 30분 내 Undo 기능, 감사 로그
- **서비스간 데이터 연동**: Order + Store Management 데이터 통합
- **인메모리 캐시**: 30초/5분 TTL 기반 캐시 최적화

### Payment Service 아키텍처 패턴
- **결제 중심 아키텍처**: Payment + PG Gateway 이중 시스템
- **Mock PG Gateway**: 개발용 PG 시뮬레이션 (카드/현금/모바일)
- **상태 관리**: pending → processing → completed/failed 전환
- **Luhn 알고리즘**: 카드번호 유효성 검증 시스템
- **인메모리 저장**: Map 기반 결제 데이터 저장 (개발용)
- **PG 콜백 처리**: 외부 PG사 콜백 수신 및 로깅
- **결제 취소 로직**: 안전한 취소 가능 상태 검증

### User Profile Service 아키텍처 패턴
- **프로필 중심 아키텍처**: Profile + Staff 이중 시스템
- **이미지 처리**: Sharp + WebP 최적화 + 리사이징 (300x300)
- **PIN 보안**: bcrypt 해싱 + 4자리 숫자 검증
- **권한 분리**: ownerOnly 미들웨어로 점주 전용 기능 분리
- **매장별 격리**: storeId 기반 데이터 격리
- **파일 업로드**: 프로필 이미지 업로드/삭제 + 타입 검증
- **인메모리 캐시**: TTL 기반 캐시 시스템

## 🔧 공통 기술 스택

### TypeScript 설정 (공통)
```typescript
// Interface: I 접두사
interface IUser { id: string; name: string; }

// Type: T 접두사
type TOrderStatus = 'pending' | 'confirmed';

// Enum: E 접두사
enum EUserRole { OWNER = 'owner' }
```

### Docker 아키텍처
- **19개 서비스**: Infrastructure 3 + Backend 16
- **커스텀 네트워크**: 172.20.0.0/16
- **헬스체크**: 30초 간격 모니터링
- **환경 분리**: development, staging, production

### 보안 설정 (공통)
- **JWT 인증**: HS256 알고리즘, 24시간 만료
- **Rate Limiting**: 요청 제한 (100req/15min)
- **CORS**: 개발환경 전체 허용, 운영환경 제한
- **Helmet**: 보안 헤더 자동 설정
- **Input Validation**: express-validator 기반 검증

## ⚡ 해결된 기술적 문제들

### Redis 연결 문제 → 인메모리 캐시 대체
- **문제**: Redis 컨테이너 연결 불안정
- **해결**: TTL 기반 인메모리 캐시 시스템 구현
- **효과**: 개발 속도 향상, 의존성 단순화

### JWT 검증 방식 변경
- **기존**: Auth Service /verify 엔드포인트 호출
- **변경**: 각 서비스에서 동일한 secret으로 로컬 검증
- **효과**: 네트워크 트래픽 감소, 응답 속도 향상

### 포트 충돌 문제 해결
- **문제**: 개발 환경에서 포트 충돌 빈발
- **해결**: 표준 포트 할당 + 프로세스 정리 스크립트
- **포트 맵**: 4001(Auth), 4002(Store), 4003(Dashboard), 4004(Order), 4005(Payment), 4009(Profile), 4000(Gateway)

### TypeScript 컴파일 최적화
- **Strict Mode**: 엄격한 타입 검사 활성화
- **Path Mapping**: 절대 경로 사용으로 import 단순화
- **Build 최적화**: 증분 컴파일, 소스맵 생성

## 🔄 데이터 플로우

### 인증 플로우
```
Client → API Gateway → Auth Service
      ← JWT Token ←
```

### 주문 플로우
```
Client → API Gateway → Order Service → Database
                    → WebSocket → Kitchen Display
                    → Dashboard Service (실시간 업데이트)
```

### 결제 플로우
```
Client → API Gateway → Payment Service → Mock PG Gateway
                                     → Order Service (상태 업데이트)
                                     → Dashboard Service (통계 업데이트)
```

### 실시간 이벤트 플로우
```
Service → WebSocket Server → Room Broadcasting → Connected Clients
```

## 🚀 성능 최적화

### 캐시 전략
- **TTL 기반**: 30초(실시간), 5분(통계), 1시간(메뉴)
- **패턴 기반**: 와일드카드 패턴으로 관련 캐시 일괄 무효화
- **메모리 효율**: 자동 만료 + LRU 정책

### 데이터베이스 최적화
- **인덱스**: 자주 조회되는 컬럼에 인덱스 설정
- **트랜잭션**: 결제/주문 등 중요 작업에 트랜잭션 적용
- **커넥션 풀**: Prisma 커넥션 풀 최적화

### WebSocket 최적화
- **룸 기반**: 매장/테이블/주방별 룸 분리
- **이벤트 필터링**: 관련 클라이언트에게만 이벤트 전송
- **연결 관리**: 자동 재연결 + 하트비트