# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 코드 작업을 할 때 사용하는 가이드입니다.

## 프로젝트 이름
**WAFL** - AI POS System (AI Agent 기반 차세대 외식업 주문결제 시스템)

## 현재 상태 (Current State)
**🎉 User Profile Service 재구현 완료! (Phase 2-6 완료, 7개 핵심 서비스 중 6개 완전 작동)**

### 🎯 완료된 핵심 서비스들
- ✅ **Auth Service** (포트 3001) - JWT 인증, PIN/SMS 로그인, 8개 API
- ✅ **Store Management Service** (포트 3002) - 매장/메뉴/테이블 관리, 20개 API
- ✅ **Dashboard Service** (포트 3003) - 실시간 대시보드, POS 로그, 15개 API
- ✅ **Order Service** (포트 3004) - 주문/주방 관리, WebSocket, 32개 API
- ✅ **Payment Service** (포트 3005) - 결제 처리, Mock PG, 7개 API
- ✅ **User Profile Service** (포트 3009) - 프로필/직원 관리, 8개 API (**2025.09.17 재구현 완료**)
- ✅ **API Gateway** (포트 8080) - 중앙 라우팅, 12개 서비스 프록시

### 📋 User Profile Service 상세 정보 (최신 구현)
**목적**: 사용자 계정 관리 및 직원 관리 (CRM/포인트 시스템 제외)
**포트**: 3009 (AI Service와 분리)
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

### 📁 프로젝트 구조 (핵심)
```
wafl/
├── backend/
│   ├── core/                    # 핵심 서비스 (7개)
│   │   ├── auth-service/        # ✅ 완전 구현 (포트 3001)
│   │   ├── store-management-service/  # ✅ 완전 구현 (포트 3002)
│   │   ├── dashboard-service/   # ✅ 완전 구현 (포트 3003)
│   │   ├── order-service/       # ✅ 완전 구현 (포트 3004)
│   │   ├── user-profile-service/ # ✅ 완전 구현 (포트 3009)
│   │   └── history-service/     # ⚠️ 다음 구현 대상
│   ├── support/                 # 지원 서비스 (10개)
│   │   ├── api-gateway/         # ✅ 완전 구현 (포트 8080)
│   │   ├── payment-service/     # ✅ 완전 구현 (포트 3005)
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

### 🏗️ Phase 2-6: User Profile Service 재구현 (2025.09.17)
**문제 상황**: 기존 User Profile Service가 프로젝트 기획과 다르게 복잡한 CRM/포인트 시스템으로 구현됨
**해결 과정**:
1. **요구사항 재정의**: 복잡한 CRM → 간단한 프로필 관리
2. **포트 변경**: 3006 → 3009 (AI Service용 포트 분리)
3. **기능 축소**: 14개 API → 8개 핵심 API
4. **코드 재작성**: Services, Controllers, Routes, Middleware 전면 재구현
5. **테스트 완료**: JWT 인증, 역할 기반 접근 제어, API 응답 검증

**주요 변경사항**:
- 불필요한 CRM/포인트 기능 완전 제거
- 직원 관리 기능만 점주에게 제한
- 언어 설정 임시 저장 방식 (향후 DB 확장 준비)
- TypeScript 컴파일 에러 해결
- 코드 품질 및 보안 강화

### 🔄 개발 결정사항 및 변경 로그
**2025.09.17**:
- User Profile Service 포트: 3006 → 3009
- CRM/포인트 시스템 제거 결정
- 프로필 이미지 업로드 기능 제거
- 직원 통계/로그 기능 제거 (History Service로 이관 예정)

## 🚀 다음 작업 우선순위

### 1. 최우선: History Service 구현
- **위치**: `backend/core/history-service/` (포트 3007)
- **기능**: 모든 서비스 로그 통합, 분석 리포트, 감사 추적
- **User Profile Service 연동**: 직원 활동 로그, 프로필 변경 이력

### 2. AI Service 구현
- **위치**: `backend/core/ai-service/` (포트 3006)
- **기능**: AI Agent 기반 주문 처리, 자연어 이해

### 3. 프론트엔드 개발
- **Kitchen Display Web**: 주방 전용 실시간 화면
- **POS Admin Web**: 매장 관리자 전용 시스템

## 🛠️ 개발 환경 체크리스트

### 서비스 상태 확인
```bash
# 실행 중인 서비스들 확인
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Store Management
curl http://localhost:3003/health  # Dashboard
curl http://localhost:3004/health  # Order Service
curl http://localhost:3005/health  # Payment Service
curl http://localhost:3009/health  # User Profile
curl http://localhost:8080/health  # API Gateway
```

### 개발 명령어
```bash
# 각 서비스 개발 서버 시작
cd backend/core/[service-name] && npm run dev

# 코드 품질 검사
npm run lint && npm run type-check

# 포트 충돌 해결
lsof -ti:3002 | xargs kill -9
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

### 💡 User Profile Service 개발 참조
- **포트**: 3009
- **스키마 파일**: `backend/shared/database/prisma/schema.prisma`
- **설정 파일**: `backend/core/user-profile-service/.env`
- **주요 테이블**: users, stores (DATABASE_SCHEMA.md 참조)
- **JWT Secret**: 다른 서비스와 동일한 키 사용

---

**📊 진행률**: 약 75% 완료 (핵심 서비스 6/7 완료)
**최종 업데이트**: 2025.09.17 - User Profile Service 재구현 완료! (포트 3009, 간소화 버전)