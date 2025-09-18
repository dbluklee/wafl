# WAFL 프로젝트 문서 (Documentation)

**WAFL** - AI POS System (AI Agent 기반 차세대 외식업 주문결제 시스템)

## 📚 문서 구조 (Documentation Structure)

### 🏗️ Architecture (아키텍처)
시스템 설계 및 기술적 결정사항

- **[ARCHITECTURE.md](architecture/ARCHITECTURE.md)** - 전체 시스템 아키텍처 개요
- **[TECHNICAL_DECISIONS.md](architecture/TECHNICAL_DECISIONS.md)** - 기술 결정사항 및 해결된 문제들
- **[DATABASE_SCHEMA.md](architecture/DATABASE_SCHEMA.md)** - 완전한 데이터베이스 스키마 및 DDL
- **[CODING_CONVENTIONS.md](architecture/CODING_CONVENTIONS.md)** - TypeScript 코딩 컨벤션

### 🌐 API Documentation (API 문서)
모든 서비스의 API 명세서

- **[API_ENDPOINTS.md](api-docs/API_ENDPOINTS.md)** - **마스터 API 인덱스** (전체 서비스 API 목록)

#### ✅ 구현 완료된 서비스 (Implemented Services)
- **[AUTH_SERVICE_API.md](api-docs/implemented/AUTH_SERVICE_API.md)** - 인증 서비스 API (포트 4001)
- **[STORE_MANAGEMENT_API.md](api-docs/implemented/STORE_MANAGEMENT_API.md)** - 매장 관리 서비스 API (포트 4002)
- **[AI_SERVICE_API.md](api-docs/implemented/AI_SERVICE_API.md)** - AI 서비스 API (포트 4006)
- **[HISTORY_SERVICE_API.md](api-docs/implemented/HISTORY_SERVICE_API.md)** - 히스토리 서비스 API (포트 4010)

#### ⏳ 계획된 서비스 (Planned Services)
- **[ANALYTICS_SERVICE_API.md](api-docs/planned/ANALYTICS_SERVICE_API.md)** - 분석 서비스 API (포트 4007)
- **[NOTIFICATION_SERVICE_API.md](api-docs/planned/NOTIFICATION_SERVICE_API.md)** - 알림 서비스 API (포트 4008)
- **[QR_SERVICE_API.md](api-docs/planned/QR_SERVICE_API.md)** - QR 서비스 API (포트 4012)
- **[SCRAPING_SERVICE_API.md](api-docs/planned/SCRAPING_SERVICE_API.md)** - 스크래핑 서비스 API (포트 4011)

### 🛠️ Development (개발 가이드)
개발 환경 설정 및 명령어

- **[DEVELOPMENT_COMMANDS.md](development/DEVELOPMENT_COMMANDS.md)** - 개발 명령어 및 테스트 방법
- **[DOCKER_GUIDE.md](development/DOCKER_GUIDE.md)** - Docker 개발 환경 가이드
- **[API_GATEWAY_GUIDE.md](development/API_GATEWAY_GUIDE.md)** - API Gateway 설정 가이드
- **[TROUBLESHOOTING.md](development/TROUBLESHOOTING.md)** - 🚨 **개발 문제 해결 가이드** (프록시 연결 지연 등)

### 📊 Status (프로젝트 현황)
현재 프로젝트 상태 및 로드맵

- **[SERVICE_STATUS.md](status/SERVICE_STATUS.md)** - **현재 서비스 실행 상태** (실시간 업데이트)
- **[TODO_NEXT_STEPS.md](status/TODO_NEXT_STEPS.md)** - 다음 단계 로드맵 및 우선순위

### 📁 Archive (보관)
과거 문서 및 히스토리

- **[DEVELOPMENT_TODO.md](archive/DEVELOPMENT_TODO.md)** - 과거 TODO 기록 (완료된 작업들)

## 🚀 빠른 시작 (Quick Start)

### 1. 현재 상태 확인
```bash
# 프로젝트 현재 상태 확인
cat docs/status/SERVICE_STATUS.md

# 실행 중인 서비스 확인
curl http://localhost:4001/health  # Auth Service
curl http://localhost:4000/health  # API Gateway
curl http://112.148.37.41:4100     # Frontend (외부 접속)
```

### 2. API 문서 보기
```bash
# 전체 API 목록
cat docs/api-docs/API_ENDPOINTS.md

# 특정 서비스 API (예: AI Service)
cat docs/api-docs/implemented/AI_SERVICE_API.md
```

### 3. 개발 시작하기
```bash
# 개발 명령어 참조
cat docs/development/DEVELOPMENT_COMMANDS.md

# 서비스 실행
cd backend/core/auth-service && npm run dev
cd backend/support/api-gateway && npm run dev
cd frontend/pos-admin-web && npm run dev
```

## 📈 현재 프로젝트 진행률

### ✅ 완료된 서비스 (10/13)
- **핵심 서비스 (8/8)**: Auth, Store Management, Dashboard, Order, Payment, AI, User Profile, History
- **지원 서비스 (2/10)**: API Gateway, (Payment Service)
- **프론트엔드 (1/3)**: POS Admin Web 홈페이지 완료

### 🎯 현재 단계: Phase 3-3
**다음 우선순위**: Dashboard Page 구현 (실시간 테이블 상태 + POS 로그)

### 🎉 최신 완성 (2025.09.17)
- **Phase 3-2 완료**: POS Admin Web 홈페이지 완전 구현 (3x3 그리드 + 서비스 연결 + 인터랙션)
- **Phase 2-9 완료**: AI Service 완전 구현 (Ollama 기반 LLM, SSE 스트리밍)
- **Phase 2-8 완료**: History Service 완전 구현 (Undo/Redo 시스템)

## 🔧 외부 접속 정보

### 📍 현재 접속 가능한 서비스
- **POS Admin Web**: http://112.148.37.41:4100
- **Auth Service**: http://112.148.37.41:4001
- **API Gateway**: http://112.148.37.41:4000

### 🔑 테스트 계정
- **매장코드**: 1001
- **점주 PIN**: 1234
- **직원 PIN**: 5678
- **비밀번호**: password

## 📞 지원 및 문의

### 🐛 버그 리포트
- GitHub Issues 또는 개발팀 연락

### 📝 문서 업데이트
- 각 문서 상단의 "Last Updated" 날짜 확인
- 최신 정보는 `status/SERVICE_STATUS.md` 참조

---

**최종 업데이트**: 2025.09.17
**문서 버전**: v3.2
**프로젝트 진행률**: 99% (핵심 기능 완료, 프론트엔드 홈페이지 완성)