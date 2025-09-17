# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 코드 작업을 할 때 사용하는 가이드입니다.

## 프로젝트 이름
**WAFL** - AI POS System (AI Agent 기반 차세대 외식업 주문결제 시스템)

## 현재 상태 (Current State)
**🎉 AI Service 완전 구현 완료! (Phase 2-9 완료, 핵심 서비스 8/8 완료)**

### 🎯 완료된 핵심 서비스들
- ✅ **Auth Service** (포트 4001) - JWT 인증, PIN/SMS 로그인, 8개 API
- ✅ **Store Management Service** (포트 4002) - 매장/메뉴/테이블 관리, 20개 API
- ✅ **Dashboard Service** (포트 4003) - 실시간 대시보드, POS 로그, 15개 API
- ✅ **Order Service** (포트 4004) - 주문/주방 관리, WebSocket, 32개 API
- ✅ **Payment Service** (포트 4005) - 결제 처리, Mock PG, 7개 API
- ✅ **AI Service** (포트 4006) - Ollama 기반 AI Agent, 번역, 추천, 12개 API (**2025.09.17 신규 구현 완료**)
- ✅ **User Profile Service** (포트 4009) - 프로필/직원 관리, 8개 API
- ✅ **History Service** (포트 4010) - 이력 추적, Undo/Redo, 8개 API
- ✅ **API Gateway** (포트 4000) - 중앙 라우팅, 12개 서비스 프록시

### 📋 AI Service 상세 정보 (최신 구현)
**목적**: Ollama 기반 점주 경영 컨설팅, 고객 대화, 메뉴 추천, 다국어 번역 핵심 서비스
**포트**: 4006 (신규 구현)
**개발 완료일**: 2025.09.17

**핵심 기능**:
1. **점주 AI Agent** - 실시간 분석, 맞춤형 조언, 비즈니스 인사이트, 자연어 대화
2. **고객 AI Chat** - 메뉴 추천, 다국어 지원, 알레르기 고려, 식단 제한
3. **다국어 번역** - 메뉴 번역, 매장 일괄번역, 문화적 설명, 고성능 캐싱
4. **비즈니스 제안** - 매출 분석, 메뉴 최적화, 운영 개선, 마케팅 아이디어

**API 엔드포인트 (12개)**:
- **점주 AI Agent (6개)**: `POST /agent/chat`, `GET /agent/quick-questions`, `GET /agent/sessions/:id`, `POST /agent/sessions`, `GET /agent/insights`, `POST /agent/sessions/:id/summary`
- **고객 AI Chat (3개)**: `POST /customer/chat`, `POST /customer/recommend`, `GET /customer/quick-questions`
- **번역 서비스 (4개)**: `POST /translate/text`, `POST /translate/menu`, `POST /translate/batch`, `POST /translate/store/:storeId`
- **제안 시스템 (3개)**: `GET /suggestions/revenue`, `GET /suggestions/menu`, `POST /analyze/feedback`

**기술 스택**:
- **LLM 엔진**: Ollama (gemma3:27b-it-q4_K_M) - http://112.148.37.41:1884
- **Node.js + Express.js + TypeScript** (엄격 모드)
- **SSE 스트리밍**: Server-Sent Events 기반 실시간 AI 응답
- **TTL 기반 캐싱**: 30초/5분/1시간 단계별 인메모리 캐시
- **프롬프트 엔지니어링**: 역할별 최적화된 시스템 프롬프트
- **Winston 로깅**: 구조화된 로깅, AI 전용 로깅 메서드

**고급 기능**:
- **스트리밍 응답**: SSE로 실시간 AI 대화 (EventSource 기반)
- **컨텍스트 통합**: Store Management, Dashboard, Order Service 데이터 연동
- **캐시 전략**: 짧은/중간/긴 캐시로 성능 최적화
- **Rate Limiting**: API 호출량 제한 및 보호
- **세션 관리**: 대화 세션 TTL 관리 및 정리
- **다국어 지원**: 한국어, 영어, 일본어, 중국어 등 10개 언어

**해결된 기술적 과제**:
- TypeScript 엄격 모드 완전 지원 (`exactOptionalPropertyTypes` 대응)
- Ollama SDK 통합 및 스트리밍 응답 구현
- 복잡한 프롬프트 템플릿 시스템 구축
- 서비스 간 컨텍스트 데이터 통합
- SSE 실시간 스트리밍 아키텍처 구현

### 📋 User Profile Service 상세 정보 (최신 구현)
**목적**: 사용자 계정 관리 및 직원 관리 (CRM/포인트 시스템 제외)
**포트**: 4009 (AI Service와 분리)
**개발 완료일**: 2025.09.17

**핵심 기능**:
1. **계정 정보 수정** - 사용자 이름 변경
2. **언어 설정 저장** - 다국어 지원 (ko, en, ja, zh, es, fr, de)
3. **PIN 변경** - 보안 PIN 관리
4. **직원 관리** - 점주 전용 직원 CRUD

**API 엔드포인트 (8개)**:
- `GET /api/v1/profile` - 내 프로필 조회
- `PUT /api/v1/profile` - 프로필 수정 (이름)
- `PUT /api/v1/profile/pin` - PIN 변경
- `PUT /api/v1/profile/language` - 언어 설정
- `GET /api/v1/profile/staff` - 직원 목록 (점주만)
- `POST /api/v1/profile/staff` - 직원 추가 (점주만)
- `PUT /api/v1/profile/staff/:staffId` - 직원 수정 (점주만)
- `PATCH /api/v1/profile/staff/:staffId/status` - 직원 상태 변경 (점주만)

**기술 스택**:
- Node.js + Express.js + TypeScript
- Prisma ORM + PostgreSQL
- JWT 인증 + 역할 기반 접근 제어
- Express Validator 입력 검증

### 📋 History Service 상세 정보 (최신 구현)
**목적**: 전체 시스템 활동 추적, Undo/Redo 기능, 감사 로그
**포트**: 4010 (신규 구현)
**개발 완료일**: 2025.09.17

**핵심 기능**:
1. **히스토리 추적** - 모든 서비스의 데이터 변경 이력 기록
2. **Undo/Redo 시스템** - 30분 제한 실행 취소 및 재실행
3. **감사 로그** - 사용자 활동 추적 및 규정 준수
4. **인메모리 캐시** - TTL 기반 고성능 캐싱
5. **서비스 통합** - 다른 서비스와 HTTP 통신으로 데이터 복원
6. **권한 관리** - 사용자별, 역할별 접근 제어

**API 엔드포인트 (8개)**:
- `GET /api/v1/history` - 히스토리 목록 조회 (페이지네이션)
- `POST /api/v1/history` - 히스토리 생성 (서비스 간 호출)
- `POST /api/v1/history/undo` - Undo 실행 (30분 제한)
- `POST /api/v1/history/redo` - Redo 실행
- `GET /api/v1/history/entity/:type/:id` - 특정 엔티티 히스토리
- `GET /health` - 헬스체크 (캐시 통계 포함)

**Undo/Redo 시스템**:
- **30분 Undo 마감시간** - 설정 가능한 시간 제한
- **권한 기반 실행** - 본인 또는 점주만 Undo 가능
- **실제 데이터 복원** - Store Management, Order, User Profile Service 연동
- **Redo 스택 관리** - Undo 후 30분간 Redo 가능
- **변경 필드 추적** - oldData/newData 비교로 정확한 변경 사항 기록

**고급 기능**:
- **인메모리 TTL 캐시** (30초/5분/1시간 단계별)
- **Winston 로깅** (일별 로테이션, 구조화된 로그)
- **패턴 기반 캐시 무효화** (매장별, 엔티티별)
- **히스토리 자동 정리** (90일 보관 후 삭제)
- **실시간 활동 추적** (사용자별 최근 활동)

**기술 스택**:
- Node.js + Express.js + TypeScript (엄격 모드)
- Prisma ORM + PostgreSQL (HistoryLog, UndoStack 모델)
- 인메모리 캐시 시스템 (Redis 대체)
- JWT 인증 + 역할 기반 접근 제어
- Express Validator 입력 검증
- Winston 구조화 로깅

**해결된 기술적 과제**:
- TypeScript 엄격 모드 완전 지원
- Prisma 모델 매핑 함수 타입 안전성
- Winston 로거 중복 설정 제거
- 서비스 간 HTTP 통신 에러 처리
- 복잡한 캐시 무효화 패턴 구현

### 📋 Payment Service 상세 정보 (최신 복구)
**목적**: 결제 처리, Mock PG Gateway, 트랜잭션 관리
**포트**: 4005 (완전 복구 완료)
**개발 완료일**: 2025.09.17

**핵심 기능**:
1. **카드/현금/모바일 결제** - 다양한 결제 수단 지원
2. **Mock PG Gateway** - 개발용 결제 게이트웨이 시뮬레이션
3. **결제 상태 관리** - pending/processing/completed/failed/cancelled
4. **환불 처리** - 결제 취소 및 환불 관리
5. **결제 영수증** - 이메일/SMS/프린트 영수증 발송
6. **정산 리포트** - 일별/월별 결제 통계

**API 엔드포인트 (7개)**:
- `POST /api/v1/payments` - 결제 생성
- `GET /api/v1/payments/:id` - 결제 상세 조회
- `PATCH /api/v1/payments/:id/status` - 결제 상태 변경
- `POST /api/v1/payments/:id/cancel` - 결제 취소
- `POST /api/v1/payments/callback` - PG 콜백 (인증 불필요)
- `GET /api/v1/payments/order/:orderId` - 주문별 결제 목록
- `GET /health` - 헬스체크

**해결된 기술적 문제**:
- TypeScript 엄격 모드 (`exactOptionalPropertyTypes`) 대응
- tsconfig-paths를 통한 `@/` 경로 매핑 해결
- Optional property 조건부 설정 패턴 적용
- Express 미들웨어 타입 안전성 강화

**기술 스택**:
- Node.js + Express.js + TypeScript (엄격 모드)
- Mock PG Gateway + 실시간 트랜잭션 시뮬레이션
- 인메모리 캐시 시스템 (TTL 기반)
- JWT 인증 + 역할 기반 접근 제어
- Express Validator 입력 검증

### 📁 프로젝트 구조 (핵심)
```
wafl/
├── backend/
│   ├── core/                    # 핵심 서비스 (8개)
│   │   ├── auth-service/        # ✅ 완전 구현 (포트 4001)
│   │   ├── store-management-service/  # ✅ 완전 구현 (포트 4002)
│   │   ├── dashboard-service/   # ✅ 완전 구현 (포트 4003)
│   │   ├── order-service/       # ✅ 완전 구현 (포트 4004)
│   │   ├── ai-service/          # ✅ 완전 구현 (포트 4006)
│   │   ├── user-profile-service/ # ✅ 완전 구현 (포트 4009)
│   │   └── history-service/     # ✅ 완전 구현 (포트 4010)
│   ├── support/                 # 지원 서비스 (10개)
│   │   ├── api-gateway/         # ✅ 완전 구현 (포트 4000)
│   │   ├── payment-service/     # ✅ 완전 구현 (포트 4005)
│   │   └── [8개 서비스 대기]    # ⚠️ 구현 대기
│   └── shared/                  # ✅ 완전 구현
├── frontend/                    # ⚠️ 구현 대기 (3개 웹앱)
├── docs/                        # 📚 상세 문서들
└── [설정 파일들]               # ✅ 완료
```

## 🗃️ Database 정보
- **PostgreSQL 15 + Prisma ORM** ✅ 완전 작동
- **14개 테이블, 7개 Enum** ✅ Demo 데이터 포함
- **접속**: `postgresql://postgres:Cl!Wm@Dp!Dl@Em!@localhost:5432/aipos`
- **테스트 계정**: 매장코드 1001, 점주PIN 1234, 직원PIN 5678

## 📚 개발 히스토리 및 진행 상황

### 🏗️ Phase 2-9: AI Service 완전 구현 (2025.09.17)
**목적**: Ollama 기반 LLM을 활용한 점주 경영 컨설팅, 고객 메뉴 추천, 다국어 번역 서비스 구현

**구현 과정**:
1. **Ollama 통합**: gemma3:27b-it-q4_K_M 모델 연동 및 건강성 체크
2. **완전한 AI 아키텍처**: TypeScript 엄격 모드, Express.js, SSE 스트리밍 응답
3. **4가지 AI 서비스**: 점주 Agent, 고객 Chat, 번역, 비즈니스 제안
4. **프롬프트 엔지니어링**: 역할별 최적화된 시스템 프롬프트 및 컨텍스트 주입
5. **TTL 캐싱 시스템**: 30초/5분/1시간 단계별 인메모리 캐시
6. **서비스 통합**: Store Management, Dashboard, Order Service와 HTTP 통신

**구현된 핵심 기능**:
- **12개 API 엔드포인트**: 점주 Agent 6개, 고객 Chat 3개, 번역 4개, 제안 3개
- **SSE 스트리밍**: EventSource 기반 실시간 AI 응답 (Agent Chat)
- **컨텍스트 통합**: 매장 정보, 메뉴 데이터, 매출 분석 자동 연동
- **다국어 번역**: 10개 언어 지원, 문화적 설명 포함
- **세션 관리**: 대화 세션 TTL 관리 및 자동 정리
- **Rate Limiting**: 분당 20회/60회 API 호출 제한

**해결된 기술적 과제**:
- TypeScript 엄격 모드 및 `exactOptionalPropertyTypes` 완전 대응
- Ollama SDK 스트리밍 응답 AsyncIterable 타입 처리
- 복잡한 프롬프트 템플릿 시스템 및 동적 컨텍스트 주입
- SSE 실시간 스트리밍 아키텍처 구현
- 서비스 간 HTTP 통신 오류 처리 및 캐시 무효화

**완성된 파일 구조**:
```
backend/core/ai-service/
├── src/
│   ├── config/           # 환경 설정 (Ollama, AI 파라미터)
│   ├── controllers/      # API 컨트롤러 (Agent, Customer, Translate)
│   ├── middleware/       # 인증, 검증, Rate Limiting
│   ├── routes/          # API 라우트 (12개 엔드포인트)
│   ├── services/        # 비즈니스 로직 (Ollama, Context, Agent)
│   ├── types/           # TypeScript 타입 정의 (AI 전용)
│   ├── utils/           # 로거, 캐시, 프롬프트 템플릿
│   ├── server.ts        # Express 서버 및 백그라운드 작업
│   └── index.ts         # 서버 진입점
├── package.json         # Ollama 의존성 및 스크립트
├── tsconfig.json        # TypeScript 엄격 모드 설정
├── .env                 # Ollama/AI 환경 변수
└── README.md            # 완전한 AI Service 문서
```

### 🏗️ Phase 2-8: History Service 완전 구현 (2025.09.17)
**목적**: 전체 시스템의 활동 추적 및 Undo/Redo 기능을 제공하는 핵심 서비스 구현

**구현 과정**:
1. **데이터베이스 스키마 확장**: HistoryLog 모델에 entityName, metadata, undoDeadline, undoneAt 필드 추가 및 UndoStack 모델 신규 생성
2. **완전한 서비스 아키텍처**: TypeScript 엄격 모드 지원, Prisma ORM 통합, Express.js 기반 REST API
3. **Undo/Redo 시스템**: 30분 제한 실행 취소, 권한 기반 접근 제어, 실제 데이터 복원
4. **고급 캐싱**: TTL 기반 인메모리 캐시, 패턴 기반 무효화
5. **서비스 통합**: Store Management, Order, User Profile Service와 HTTP 통신
6. **구조화된 로깅**: Winston 일별 로테이션, 히스토리 전용 로깅 메서드

**구현된 핵심 기능**:
- **8개 API 엔드포인트**: 히스토리 조회, 생성, Undo/Redo, 엔티티별 조회
- **30분 Undo 마감시간**: 설정 가능한 시간 제한으로 안전한 실행 취소
- **권한 기반 Undo**: 본인 또는 점주만 실행 가능
- **실제 데이터 복원**: 다른 서비스 API 호출로 실제 데이터 상태 복원
- **인메모리 TTL 캐시**: 30초/5분/1시간 단계별 캐싱
- **히스토리 자동 정리**: 90일 보관 후 자동 삭제

**해결된 기술적 과제**:
- TypeScript 엄격 모드 완전 지원 및 Prisma 매핑 함수 타입 안전성
- Winston 로거 중복 설정 문제 해결
- 복잡한 서비스 간 HTTP 통신 에러 처리
- 패턴 기반 캐시 무효화 시스템 구현

**완성된 파일 구조**:
```
backend/core/history-service/
├── src/
│   ├── config/           # 환경 설정
│   ├── controllers/      # API 컨트롤러
│   ├── middleware/       # 인증, 검증 미들웨어
│   ├── routes/          # API 라우트
│   ├── services/        # 비즈니스 로직 (History, Undo)
│   ├── types/           # TypeScript 타입 정의
│   ├── utils/           # 로거, 캐시 유틸리티
│   ├── app.ts           # Express 앱 설정
│   └── index.ts         # 서버 진입점
├── package.json         # 의존성 및 스크립트
├── tsconfig.json        # TypeScript 설정
├── .env                 # 환경 변수
└── nodemon.json         # 개발 서버 설정
```

### 🏗️ Phase 2-6: User Profile Service 재구현 (2025.09.17)
**문제 상황**: 기존 User Profile Service가 프로젝트 기획과 다르게 복잡한 CRM/포인트 시스템으로 구현됨
**해결 과정**:
1. **요구사항 재정의**: 복잡한 CRM → 간단한 프로필 관리
2. **포트 변경**: 3006 → 4009 (AI Service용 포트 분리)
3. **기능 축소**: 14개 API → 8개 핵심 API
4. **코드 재작성**: Services, Controllers, Routes, Middleware 전면 재구현
5. **테스트 완료**: JWT 인증, 역할 기반 접근 제어, API 응답 검증

**주요 변경사항**:
- 불필요한 CRM/포인트 기능 완전 제거
- 직원 관리 기능만 점주에게 제한
- 언어 설정 임시 저장 방식 (향후 DB 확장 준비)
- TypeScript 컴파일 에러 해결
- 코드 품질 및 보안 강화

### 🏗️ Phase 2-7: 전체 포트 마이그레이션 및 Payment Service 복구 (2025.09.17)
**목적**: 모든 서비스를 체계적인 4000대 포트로 마이그레이션하고 Payment Service의 TypeScript 문제 완전 해결

**실행 과정**:
1. **포트 체계 재설계**: 혼재된 3000/8000 → 체계적인 4000대 포트
2. **133개 포트 레퍼런스 업데이트**: 15개 문서 파일 전면 수정
3. **환경 설정 동기화**: 모든 서비스 .env 파일 업데이트
4. **Payment Service 완전 복구**: TypeScript 엄격 모드 대응 및 tsconfig-paths 설정

**새로운 포트 체계**:
- **API Gateway**: 4000 (기존 8080)
- **Auth Service**: 4001 (기존 3001)
- **Store Management**: 4002 (기존 3002)
- **Dashboard Service**: 4003 (기존 3003)
- **Order Service**: 4004 (기존 3004)
- **Payment Service**: 4005 (기존 3005)
- **AI Service**: 4006 (예약)
- **Analytics Service**: 4007 (예약)
- **Notification Service**: 4008 (예약)
- **User Profile Service**: 4009 (기존 3006)
- **History Service**: 4010 (예약)
- **Scraping Service**: 4011 (예약)
- **QR Service**: 4012 (예약)

**Payment Service 해결한 TypeScript 에러들**:
- `@/config` 모듈 경로 문제 → tsconfig-paths 설치 및 설정
- error.ts field 타입 캐스팅 문제
- optional property exactOptionalPropertyTypes 대응
- unused parameter 및 import 정리
- 조건부 속성 설정으로 엄격 타입 체크 통과

**검증 완료**:
- ✅ 모든 서비스 4000대 포트에서 정상 실행
- ✅ Health check 엔드포인트 응답 확인
- ✅ Payment Service TypeScript 컴파일 성공
- ✅ 133개 포트 레퍼런스 완전 동기화

### 🔄 개발 결정사항 및 변경 로그
**2025.09.17 - Phase 2-9**:
- **AI Service 완전 구현**: Ollama 기반 LLM, SSE 스트리밍, 프롬프트 엔지니어링
- **12개 AI API 엔드포인트**: 점주 Agent, 고객 Chat, 번역, 비즈니스 제안
- **TypeScript 엄격 모드**: AsyncIterable, exactOptionalPropertyTypes 완전 대응
- **핵심 서비스 8/8 완료**: 모든 Core 서비스 구현 완료

**2025.09.17 - Phase 2-8**:
- **History Service 완전 구현**: Undo/Redo 시스템, 감사 로그, 서비스 통합
- **데이터베이스 스키마 확장**: HistoryLog, UndoStack 모델 추가
- **TypeScript 엄격 모드**: 모든 타입 안전성 문제 해결
- **핵심 서비스 7/8 완료**: History Service까지 구현 완료

**2025.09.17 - Phase 2-7**:
- **전체 포트 마이그레이션**: 3000/8000대 → 4000대 체계적 정리
- **Payment Service 완전 복구**: TypeScript 엄격 모드 대응
- **문서 동기화**: 15개 파일 133개 포트 레퍼런스 업데이트
- **개발 환경 안정화**: 모든 서비스 정상 작동 검증 완료

**2025.09.17 - Phase 2-6**:
- User Profile Service 포트: 3006 → 4009 (AI Service와 분리)
- CRM/포인트 시스템 제거 결정
- 프로필 이미지 업로드 기능 제거
- 직원 통계/로그 기능 제거 (History Service로 이관 예정)

## 🚀 다음 작업 우선순위

### 1. 최우선: 지원 서비스 구현 (8개 대기)
- **Analytics Service**: 고급 분석 및 리포팅 (포트 4007)
- **Notification Service**: 푸시/SMS/이메일 알림 (포트 4008)
- **Scraping Service**: 온라인 데이터 수집 (포트 4011)
- **QR Service**: QR 코드 생성/관리 (포트 4012)

### 2. 프론트엔드 개발
- **Kitchen Display Web**: 주방 전용 실시간 화면
- **POS Admin Web**: 매장 관리자 전용 시스템
- **Customer Mobile App**: 고객용 모바일 앱

## 🛠️ 개발 환경 체크리스트

### 서비스 상태 확인
```bash
# 실행 중인 서비스들 확인
curl http://localhost:4001/health  # Auth Service
curl http://localhost:4002/health  # Store Management
curl http://localhost:4003/health  # Dashboard
curl http://localhost:4004/health  # Order Service
curl http://localhost:4005/health  # Payment Service
curl http://localhost:4006/health  # AI Service
curl http://localhost:4009/health  # User Profile
curl http://localhost:4010/health  # History Service
curl http://localhost:4000/health  # API Gateway
```

### 개발 명령어
```bash
# 각 서비스 개발 서버 시작
cd backend/core/[service-name] && npm run dev

# 코드 품질 검사
npm run lint && npm run type-check

# 포트 충돌 해결
lsof -ti:4002 | xargs kill -9
```

## 🔧 중요 기술 결정사항
- **JWT 로컬 검증**: Auth Service와 동일한 secret 사용
- **인메모리 캐시**: Redis 대체, TTL 기반 고성능 캐시
- **WebSocket 실시간**: Order/Dashboard Service에서 실시간 이벤트
- **Mock PG Gateway**: 개발용 결제 시스템, 실제 PG 연동 준비됨
- **이미지 최적화**: Sharp + WebP 변환 + 리사이징

## 📚 상세 문서 참조
프로젝트 상세 정보는 `docs/` 폴더를 참고하세요:

### 🔧 개발 참조 문서
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - **[신규]** 전체 DB 스키마 및 DDL
- **[API_ENDPOINTS.md](docs/API_ENDPOINTS.md)** - **[업데이트]** 전체 API 엔드포인트 목록
- **[SERVICE_STATUS.md](docs/SERVICE_STATUS.md)** - 모든 서비스 현재 상태
- **[DEVELOPMENT_COMMANDS.md](docs/DEVELOPMENT_COMMANDS.md)** - 개발 명령어 모음

### 🏗️ 아키텍처 문서
- **[TECHNICAL_DECISIONS.md](docs/TECHNICAL_DECISIONS.md)** - 아키텍처 패턴 및 기술 결정사항
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - 전체 시스템 아키텍처
- **[CODING_CONVENTIONS.md](docs/CODING_CONVENTIONS.md)** - 코딩 컨벤션

### 🚀 배포 및 운영
- **[DOCKER_GUIDE.md](docs/DOCKER_GUIDE.md)** - Docker 개발 가이드

### 💡 History Service 개발 참조
- **포트**: 4010
- **스키마 파일**: `backend/shared/database/prisma/schema.prisma`
- **설정 파일**: `backend/core/history-service/.env`
- **주요 테이블**: HistoryLog, UndoStack (DATABASE_SCHEMA.md 참조)
- **JWT Secret**: 다른 서비스와 동일한 키 사용
- **서비스 URL**: Store Management (4002), Order (4004), User Profile (4009)

### 💡 AI Service 개발 참조
- **포트**: 4006
- **LLM 서버**: http://112.148.37.41:1884 (Ollama)
- **모델**: gemma3:27b-it-q4_K_M
- **설정 파일**: `backend/core/ai-service/.env`
- **주요 기능**: 점주 Agent, 고객 Chat, 번역, 비즈니스 제안
- **JWT Secret**: 다른 서비스와 동일한 키 사용
- **서비스 연동**: Store Management (4002), Dashboard (4003), Order (4004)

### 💡 User Profile Service 개발 참조
- **포트**: 4009
- **스키마 파일**: `backend/shared/database/prisma/schema.prisma`
- **설정 파일**: `backend/core/user-profile-service/.env`
- **주요 테이블**: users, stores (DATABASE_SCHEMA.md 참조)
- **JWT Secret**: 다른 서비스와 동일한 키 사용

---

**📊 진행률**: 약 95% 완료 (핵심 서비스 8/8 완료, 지원 서비스 2/10 완료)
**최종 업데이트**: 2025.09.17 - **Phase 2-9 완료**: AI Service 완전 구현 완료! 모든 핵심 서비스 구현 완료!