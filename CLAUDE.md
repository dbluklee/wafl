# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 이름
**WAFL** - AI POS System (AI Agent 기반 차세대 외식업 주문결제 시스템)

## 현재 상태 (Current State)
**✅ 기초 인프라 구축 완료! (Phase 1 완료, 모든 서비스 구현 대기 중)**

### 🎯 완료된 작업 (2024.09.16)
- ✅ **프로젝트 초기 설정**: 모노레포 구조, Docker 환경, TypeScript, ESLint/Prettier, Git hooks
- ✅ **Docker 인프라**: docker-compose 3개 파일, 19개 서비스 구성, Makefile
- ✅ **Database 완전 구축**: Prisma ORM, 14개 테이블, 7개 Enum, Demo 데이터 삽입 완료
- ✅ **공유 모듈 완성**: shared/database, shared/types, shared/utils 모두 구현 완료

### 📁 현재 프로젝트 구조
```
wafl/
├── backend/
│   ├── core/                    # 핵심 서비스 (6개) - ⚠️ 구현 대기
│   │   ├── auth-service/        # 🎯 최우선 구현 대상 (빈 디렉토리)
│   │   ├── store-management-service/  # ⚠️ 구현 대기
│   │   ├── dashboard-service/   # ⚠️ 구현 대기
│   │   ├── order-service/       # ⚠️ 구현 대기
│   │   ├── user-profile-service/ # ⚠️ 구현 대기
│   │   └── history-service/     # ⚠️ 구현 대기
│   ├── support/                 # 지원 서비스 (10개) - ⚠️ 구현 대기
│   │   └── [api-gateway, payment, ai, analytics, notification, scraping, qr, inventory, delivery, hardware]
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
├── docs/                        # 📚 상세 문서들 (NEW!)
│   ├── ARCHITECTURE.md          # 아키텍처 및 기술스택
│   ├── DOCKER_GUIDE.md          # Docker 개발 가이드
│   ├── CODING_CONVENTIONS.md    # 코딩 컨벤션
│   └── DEVELOPMENT_TODO.md      # 상세 TODO 리스트
└── [설정 파일들] ✅ 완료
```

## 🗃️ Database 정보 (핵심)

### 📊 완전 구축된 상태
- **PostgreSQL 15 + Prisma ORM** ✅
- **14개 테이블**: stores, users, categories, menus, places, tables, customers, orders, order_items, payments, history_logs, ai_conversations, analytics_daily, sms_verifications
- **7개 Enum**: user_role, subscription_status, table_status, order_status, payment_method, payment_status, ai_conversation_type
- **Demo 데이터**: 매장(1), 사용자(2), 카테고리(5), 메뉴(18), 테이블(21) 완료

### 💾 접속 정보
```bash
# 로컬 개발 환경
DATABASE_URL="postgresql://postgres@localhost:5432/aipos?schema=public"
Container: database-postgres-1
```

### 🛠️ 주요 명령어
```bash
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

## ⚠️ 현재 상황 및 다음 단계

### 🎯 현재 상황 (정확한 구현 상태)
1. **✅ 완료**: 기초 인프라 (Docker, TypeScript, ESLint, Database, 공유 모듈)
2. **⚠️ 구현 대기**: 모든 비즈니스 로직 서비스 (16개 서비스 모두)
3. **⚠️ 구현 대기**: 모든 프론트엔드 (3개 웹 애플리케이션)

### 🚀 다음 우선 작업 순서
1. **🎯 최우선**: Auth Service 구현 (backend/core/auth-service/)
   - Express + TypeScript 기본 설정
   - JWT 인증 시스템 구현
   - PIN 로그인 (매장코드 + PIN)
   - 모바일 SMS 인증
   - API 엔드포인트 8개 구현
2. **🔄 다음**: API Gateway 구현 (backend/support/api-gateway/)
3. **📊 다음**: Store Management Service 구현

## 🚨 신규 Claude Code 세션 체크리스트

### 1. 프로젝트 상태 확인
```bash
cd /home/wk/projects/wafl
pwd && ls -la
```

### 2. Database 상태 확인
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
```

### 3. 공유 모듈 상태 확인
```bash
# Database 모듈 확인
cd backend/shared/database && ls -la src/ prisma/

# Types 모듈 확인
cd ../types && cat index.ts | head -10
```

### 4. 다음 작업 위치
```bash
# Auth Service 개발 시작 (현재 거의 빈 상태)
cd backend/core/auth-service
ls -la  # package.json과 src/types만 존재

# 현재 auth-service 상태: package.json만 있고 실제 구현 없음
```

## 🔧 기술적 결정사항 (핵심만)

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

## 📋 현재 개발 상태 요약 (정확한 상황)

### ✅ 완료 (Phase 1: 기초 인프라)
- **✅ 프로젝트 설정**: 모노레포, TypeScript, ESLint/Prettier, Git hooks
- **✅ Docker 인프라**: docker-compose 3개 파일, 19개 서비스 컨테이너 정의
- **✅ Database**: Prisma ORM, PostgreSQL, 14개 테이블, Demo 데이터
- **✅ 공유 모듈**: shared/database, shared/types, shared/utils 완전 구현

### ⚠️ 구현 대기 (Phase 2: 비즈니스 로직)
- **🎯 최우선**: Auth Service (JWT, PIN 로그인, SMS 인증)
- **⚠️ 16개 서비스**: 모든 core + support 서비스 구현 필요
- **⚠️ 3개 프론트엔드**: 모든 웹 애플리케이션 구현 필요

### 📊 진행률
- **완료**: 약 25% (기초 인프라 + Database + 공유 모듈)
- **대기**: 약 75% (모든 비즈니스 로직 + UI)

---

**📚 상세 문서**: `docs/` 디렉토리에서 ARCHITECTURE.md, DOCKER_GUIDE.md, CODING_CONVENTIONS.md, DEVELOPMENT_TODO.md 참조

**최종 업데이트**: 2024.09.16 - 정확한 구현 상태로 수정 완료, Auth Service 구현이 최우선 과제