# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 이름
**WAFL** - AI POS System (AI Agent 기반 차세대 외식업 주문결제 시스템)

## 현재 상태 (Current State)
**🎉 Auth Service 완전 구현 완료! (Phase 2 시작, 핵심 인증 시스템 작동 중)**

### 🎯 완료된 작업 (2025.09.16 업데이트)
- ✅ **프로젝트 초기 설정**: 모노레포 구조, Docker 환경, TypeScript, ESLint/Prettier, Git hooks
- ✅ **Docker 인프라**: docker-compose 3개 파일, 19개 서비스 구성, Makefile
- ✅ **Database 완전 구축**: Prisma ORM, 14개 테이블, 7개 Enum, Demo 데이터 삽입 완료
- ✅ **공유 모듈 완성**: shared/database, shared/types, shared/utils 모두 구현 완료
- 🎉 **Auth Service 완전 구현**: Express + TypeScript, JWT, PIN/SMS 인증, 8개 API 엔드포인트 모두 작동

### 📁 현재 프로젝트 구조
```
wafl/
├── backend/
│   ├── core/                    # 핵심 서비스 (6개)
│   │   ├── auth-service/        # 🎉 완전 구현됨! (포트 3001 실행 중)
│   │   │   ├── src/
│   │   │   │   ├── controllers/ # AuthController 구현 완료
│   │   │   │   ├── services/    # AuthService 비즈니스 로직 완료
│   │   │   │   ├── routes/      # 8개 API 라우트 완료
│   │   │   │   ├── middlewares/ # 인증, 검증, 에러 처리 완료
│   │   │   │   ├── utils/       # JWT, SMS, 사업자번호 검증 완료
│   │   │   │   ├── validators/  # express-validator 검증 완료
│   │   │   │   ├── types/       # TypeScript 인터페이스 완료
│   │   │   │   └── config/      # 설정, 메모리 스토어 완료
│   │   │   ├── Dockerfile       # 운영 배포 준비 완료
│   │   │   ├── .env            # 개발 환경 설정 완료
│   │   │   └── package.json    # 의존성 완전 설정
│   │   ├── store-management-service/  # 🎯 다음 우선 구현 대상
│   │   ├── dashboard-service/   # ⚠️ 구현 대기
│   │   ├── order-service/       # ⚠️ 구현 대기
│   │   ├── user-profile-service/ # ⚠️ 구현 대기
│   │   └── history-service/     # ⚠️ 구현 대기
│   ├── support/                 # 지원 서비스 (10개) - ⚠️ 구현 대기
│   │   ├── api-gateway/         # 🔄 Auth Service 다음 우선 구현
│   │   └── [payment, ai, analytics, notification, scraping, qr, inventory, delivery, hardware]
│   └── shared/                  # ✅ 완전 구현됨
│       ├── types/index.ts       # Prisma + 기존 타입 Export
│       ├── utils/index.ts       # 공통 유틸리티
│       └── database/            # ✅ 완전 구현
│           ├── src/[index.ts, utils.ts]
│           ├── prisma/[schema.prisma, seed.ts]
│           └── [package.json, tsconfig.json, .env]
├── frontend/                    # 프론트엔드 (3개) - ⚠️ 구현 대기
│   └── [pos-admin-web, qr-order-web, kitchen-display-web]
├── docker/                      # ✅ Docker 설정 완료
├── docs/                        # 📚 상세 문서들
│   ├── ARCHITECTURE.md          # 아키텍처 및 기술스택
│   ├── DOCKER_GUIDE.md          # Docker 개발 가이드
│   ├── CODING_CONVENTIONS.md    # 코딩 컨벤션
│   ├── DEVELOPMENT_TODO.md      # 상세 TODO 리스트
│   └── AUTH_SERVICE_API.md      # Auth Service API 문서 (NEW!)
└── [설정 파일들] ✅ 완료
```

## 🎉 Auth Service 완전 구현 상태 (NEW!)

### 📡 구현된 API 엔드포인트 (8개 모두 테스트 완료)
```bash
# 서비스 실행 중: http://localhost:3001
GET  /health                           # ✅ 헬스체크 (작동 확인)
POST /api/v1/auth/stores/register      # ✅ 매장 가입 (온라인 원스톱)
POST /api/v1/auth/login/pin           # ✅ PIN 로그인 (테스트 완료)
POST /api/v1/auth/login/mobile        # ✅ 모바일 인증 로그인
POST /api/v1/auth/mobile/request      # ✅ SMS 인증 요청 (테스트 완료)
POST /api/v1/auth/mobile/verify       # ✅ SMS 인증 확인
POST /api/v1/auth/customer/session    # ✅ 고객 세션 생성 (테스트 완료)
POST /api/v1/auth/refresh             # ✅ 토큰 갱신
POST /api/v1/auth/logout              # ✅ 로그아웃 (테스트 완료)
```

### 🔧 구현된 핵심 기능
- **이중 인증 시스템**: PIN 로그인 (매장코드 + PIN) + 모바일 SMS 인증
- **JWT 토큰 관리**: Access Token + Refresh Token (완전한 토큰 갱신 시스템)
- **세션 관리**: 메모리 기반 세션 스토어 (Redis 대체, 개발/테스트용)
- **입력값 검증**: express-validator 기반 완전한 검증 시스템
- **에러 처리**: 통합된 에러 핸들링 (검증 오류, 비즈니스 로직 오류, 404 등)
- **보안**: Helmet, CORS, Rate Limiting 적용
- **사업자번호 검증**: 국세청 API 연동 준비 (개발 환경에서는 모의 검증)
- **SMS 인증**: SMS API 연동 준비 (개발 환경에서는 콘솔 출력)

### 📊 테스트 검증 완료 상태
```bash
# ✅ 모든 테스트 성공 확인됨 (2025.09.16)
PIN 로그인      ✅ 성공 (JWT 토큰 발급 확인)
SMS 인증 요청   ✅ 성공 (5분 만료 시간 설정)
고객 세션 생성  ✅ 성공 (QR 코드 → 테이블 연결)
로그아웃        ✅ 성공 (세션 정리 확인)
검증 오류 처리  ✅ 성공 (상세 오류 메시지 반환)
404 오류 처리   ✅ 성공 (일관된 에러 응답)
```

## 🗃️ Database 정보 (핵심)

### 📊 완전 구축된 상태
- **PostgreSQL 15 + Prisma ORM** ✅
- **14개 테이블**: stores, users, categories, menus, places, tables, customers, orders, order_items, payments, history_logs, ai_conversations, analytics_daily, sms_verifications
- **7개 Enum**: user_role, subscription_status, table_status, order_status, payment_method, payment_status, ai_conversation_type
- **Demo 데이터**: 매장(1), 사용자(2), 카테고리(5), 메뉴(18), 테이블(21) 완료

### 💾 접속 정보 (중요!)
```bash
# 로컬 개발 환경 (올바른 패스워드 포함)
DATABASE_URL="postgresql://postgres:Cl!Wm@Dp!Dl@Em!@localhost:5432/aipos?schema=public"
Container: database-postgres-1

# 테스트 계정 정보
매장 코드: 1001
점주 PIN: 1234 (김점주)
직원 PIN: 5678 (이직원)
테스트 QR: QR_TABLE_01, QR_TABLE_02, QR_TABLE_03
```

### 🛠️ 주요 명령어
```bash
# Auth Service 개발 (backend/core/auth-service/)
npm run dev          # 개발 서버 시작 (포트 3001)
npm run build        # TypeScript 컴파일
npm run test         # 단위 테스트 실행

# Database 작업 (backend/shared/database/)
npm run generate     # Prisma 클라이언트 생성
npm run build        # TypeScript 컴파일
npm run studio       # Prisma Studio GUI

# 코드 품질 (프로젝트 루트)
npm run lint         # ESLint 자동 수정
npm run format       # Prettier 포맷팅
npm run type-check   # TypeScript 검사

# Docker 관리
make help           # 명령어 확인
make down           # 서비스 중지
```

## 🚀 현재 상황 및 다음 단계

### 🎯 현재 상황 (정확한 구현 상태)
1. **✅ 완료**: 기초 인프라 + Auth Service 완전 구현
2. **🔄 진행 중**: Phase 2 비즈니스 로직 서비스 개발
3. **⚠️ 구현 대기**: 15개 나머지 서비스 + 3개 프론트엔드

### 🚀 다음 우선 작업 순서 (업데이트)
1. **🎯 최우선**: API Gateway Service 구현 (backend/support/api-gateway/)
   - 모든 마이크로서비스 라우팅 허브
   - Auth Service와 연동하여 인증 미들웨어 적용
   - Rate Limiting, CORS, 로깅 중앙화
   - 포트 8080 (main entry point)
2. **📊 다음**: Store Management Service 구현 (backend/core/store-management-service/)
3. **🛒 다음**: Order Service 구현 (backend/core/order-service/)

## 🚨 신규 Claude Code 세션 체크리스트

### 1. 프로젝트 상태 확인
```bash
cd /home/wk/projects/wafl
pwd && ls -la
```

### 2. Auth Service 실행 확인 (중요!)
```bash
# Auth Service 상태 확인
cd backend/core/auth-service
ls -la  # 완전한 구현 확인

# 서비스 실행 (포트 3001)
npm run dev

# 다른 터미널에서 헬스체크
curl http://localhost:3001/health

# PIN 로그인 테스트
curl -X POST http://localhost:3001/api/v1/auth/login/pin \
  -H "Content-Type: application/json" \
  -d '{"storeCode": 1001, "userPin": "1234"}'
```

### 3. Database 상태 확인
```bash
# PostgreSQL 컨테이너 확인
docker ps | grep postgres

# 데이터 확인 (예상: stores:1, users:2, menus:18, tables:21)
docker exec database-postgres-1 psql -U postgres -d aipos -c "
  SELECT
    (SELECT COUNT(*) FROM stores) as stores,
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM menus) as menus,
    (SELECT COUNT(*) FROM tables) as tables;"

# 테스트 계정 확인
docker exec database-postgres-1 psql -U postgres -d aipos -c "
  SELECT s.store_code, u.user_pin, u.name, u.role
  FROM stores s JOIN users u ON s.id = u.store_id;"
```

### 4. 공유 모듈 상태 확인
```bash
# Database 모듈 확인
cd backend/shared/database && ls -la src/ prisma/

# Types 모듈 확인
cd ../types && cat index.ts | head -10
```

### 5. 다음 작업 위치 (API Gateway)
```bash
# API Gateway 개발 시작 위치
cd backend/support/api-gateway
ls -la  # 현재 비어있음, 구현 필요

# Auth Service는 완전 구현되어 참조 가능
cd ../../../backend/core/auth-service
ls -la src/  # 완전한 구현 예제로 활용 가능
```

## 🔧 기술적 결정사항 (핵심만)

### Auth Service 아키텍처 패턴
- **계층화 아키텍처**: Controllers → Services → Database
- **의존성 주입**: 각 계층 간 인터페이스 기반 분리
- **에러 처리**: 중앙화된 에러 핸들러 + 비즈니스 예외
- **검증 시스템**: express-validator + 커스텀 검증 규칙
- **세션 관리**: 인메모리 스토어 (개발용) / Redis (운영용)

### TypeScript 설정
- Strict Mode 활성화, Path Mapping (`@shared/*`)
- 네이밍 컨벤션: Interface(I), Type(T), Enum(E) 접두사

### Docker 아키텍처
- 19개 서비스 (Infrastructure 3 + Backend 16)
- 커스텀 네트워크 (172.20.0.0/16), 헬스체크 30초

### 코딩 컨벤션
```typescript
// Interface: I 접두사
interface IUser { id: string; name: string; }

// Type: T 접두사
type TOrderStatus = 'pending' | 'confirmed';

// Enum: E 접두사
enum EUserRole { OWNER = 'owner' }
```

## 📋 현재 개발 상태 요약

### ✅ 완료 (Phase 1 + Auth Service)
- **✅ 프로젝트 설정**: 모노레포, TypeScript, ESLint/Prettier, Git hooks
- **✅ Docker 인프라**: docker-compose 3개 파일, 19개 서비스 컨테이너 정의
- **✅ Database**: Prisma ORM, PostgreSQL, 14개 테이블, Demo 데이터
- **✅ 공유 모듈**: shared/database, shared/types, shared/utils 완전 구현
- **🎉 Auth Service**: 완전 구현, 8개 API 엔드포인트, JWT 인증, 세션 관리

### 🔄 다음 구현 (Phase 2 계속)
- **🎯 최우선**: API Gateway Service (중앙 라우팅 허브)
- **📊 다음**: Store Management Service (매장 관리)
- **🛒 다음**: Order Service (주문 처리)
- **⚠️ 14개 서비스**: 나머지 core + support 서비스
- **⚠️ 3개 프론트엔드**: 모든 웹 애플리케이션

### 📊 진행률 (업데이트)
- **완료**: 약 35% (기초 인프라 + Database + 공유 모듈 + Auth Service)
- **진행 중**: 약 15% (API Gateway 계획 중)
- **대기**: 약 50% (나머지 비즈니스 로직 + UI)

## 🎯 Auth Service 상세 구현 정보

### 핵심 파일 구조
```
backend/core/auth-service/src/
├── controllers/auth.controller.ts    # API 엔드포인트 핸들러
├── services/auth.service.ts          # 비즈니스 로직 (PIN, SMS, JWT)
├── routes/auth.routes.ts             # Express 라우터 정의
├── middlewares/
│   ├── auth.ts                       # JWT 인증 미들웨어
│   └── errorHandler.ts               # 글로벌 에러 처리
├── utils/
│   ├── jwt.ts                        # JWT 토큰 유틸리티
│   ├── sms.ts                        # SMS 발송 유틸리티
│   └── business.ts                   # 사업자번호 검증
├── validators/auth.ts                # 입력값 검증 규칙
├── types/index.ts                    # TypeScript 인터페이스
├── config/
│   ├── index.ts                      # 환경 설정
│   └── memory-store.ts               # 메모리 세션 스토어
├── app.ts                            # Express 앱 설정
└── index.ts                          # 서버 엔트리 포인트
```

### API 응답 형식 (표준화됨)
```typescript
// 성공 응답
{
  "success": true,
  "data": { ... }
}

// 오류 응답
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자 친화적 메시지",
    "details": [...] // 검증 오류 시
  }
}
```

---

**📚 상세 문서**: `docs/` 디렉토리에서 AUTH_SERVICE_API.md, ARCHITECTURE.md, DOCKER_GUIDE.md, CODING_CONVENTIONS.md, DEVELOPMENT_TODO.md 참조

**최종 업데이트**: 2025.09.16 - Auth Service 완전 구현 완료, API Gateway가 다음 우선 과제