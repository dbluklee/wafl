# 서비스 현재 상태 (Service Status)

## 🌐 현재 실행 중인 서버들 (2025.09.18 기준 - API Gateway 프록시 문제 해결 완료)

### 핵심 서비스 (Core Services)
```bash
# Auth Service (인증 서비스)
포트: 4001
URL: http://localhost:4001
상태: ✅ 실행 중 (헬스체크 OK, JWT 토큰 발급 작동)

# Store Management Service (매장 관리 서비스)
포트: 4002
URL: http://localhost:4002
상태: ✅ 실행 중 (JWT 인증 연동, 인메모리 캐시, 완전 작동)

# Dashboard Service (대시보드 서비스)
포트: 4003
URL: http://localhost:4003
상태: ✅ 실행 중 (JWT 인증 작동, 헬스체크 OK, 실시간 대시보드 작동)

# Order Service (주문 관리 서비스)
포트: 4004
URL: http://localhost:4004
상태: ✅ 실행 중 (WebSocket 실시간 알림, Kitchen 큐 관리, 완전 작동)

# Payment Service (결제 서비스)
포트: 4005
URL: http://localhost:4005
상태: ✅ 실행 중 (TypeScript 엄격 모드 대응 완료, @/config 경로 매핑 해결, Mock PG 정상 작동)

# AI Service (AI 서비스)
포트: 4006
URL: http://localhost:4006
상태: ✅ 실행 중 (Ollama LLM 연동, 점주 Agent, 고객 Chat, 번역, 12개 API 엔드포인트)

# User Profile Service (사용자 프로필 서비스)
포트: 4009
URL: http://localhost:4009
상태: ✅ 실행 중 (재구현 완료, 프로필/직원 관리, 8개 핵심 API 엔드포인트)

# History Service (히스토리/이력 서비스)
포트: 4010
URL: http://localhost:4010
상태: ✅ 실행 중 (신규 구현 완료, Undo/Redo 시스템, 감사 로그, 8개 API 엔드포인트)
```

### 지원 서비스 (Support Services)
```bash
# API Gateway (메인 진입점)
포트: 4000
URL: http://localhost:4000 (내부) / http://112.148.37.41:4000 (외부)
상태: ✅ 실행 중 (프록시 라우팅 완전 안정화 완료, Body parsing 문제 해결, 0.08초 응답 속도)
```

### 프론트엔드 서비스 (Frontend Services)
```bash
# POS Admin Web (점주/직원용 관리 인터페이스)
포트: 4100
URL: http://localhost:4100 (내부) / http://112.148.37.41:4100 (외부)
상태: ✅ 실행 중 (Phase 3-2 완료: 홈페이지 3x3 그리드 + 서비스 연결 + 인터랙션 완성)
기술스택: React 18 + TypeScript + Vite + TailwindCSS v4 + Zustand + React Router

# Kitchen Display Web (주방용 실시간 화면)
포트: 4200
URL: http://localhost:4200
상태: ⏳ 대기 (Phase 4 예정)

# Customer Mobile App (고객용 모바일 앱)
포트: 4300
URL: http://localhost:4300
상태: ⏳ 대기 (Phase 4 예정)
```

## 🏗️ Phase 3-2+ 주요 업데이트 (2025.09.18) - API Gateway 프록시 문제 해결 완료

### ✅ 완료된 작업 (2025.09.18)
1. **API Gateway 프록시 안정화**: Express body parsing vs http-proxy-middleware 충돌 문제 완전 해결
2. **성능 400배 향상**: 30초+ 타임아웃 → 0.08초 응답 속도 달성
3. **Express body 재작성**: onProxyReq 핸들러에서 파싱된 body를 proxy 요청 스트림에 재작성
4. **외부 IP 접속 안정화**: 112.148.37.41:4100 외부 접속으로 로그인 완전 작동
5. **TROUBLESHOOTING.md 문서 생성**: 향후 동일 문제 예방을 위한 상세 가이드 작성

### 🔧 해결된 핵심 문제 (2025.09.18)
- **Express body parsing 충돌**: http-proxy-middleware가 빈 body를 전달하던 문제
- **Socket hang up 에러**: ECONNRESET 오류로 인한 연결 실패 문제
- **30초+ 타임아웃**: 직접 호출은 0.08초인데 프록시는 30초 걸리던 성능 문제
- **마이크로서비스 아키텍처**: 모든 프론트엔드 요청이 API Gateway를 통해서만 통신하도록 완전 정리

### 📊 성능 개선 결과 (2025.09.18)
| 항목 | 수정 전 | 수정 후 |
|------|---------|---------|
| 응답 시간 | 30초+ (타임아웃) | 0.08초 |
| 성공률 | 0% (504 에러) | 100% |
| 로그 상태 | ECONNRESET | 정상 200 |

## 🏗️ Phase 3-2 프론트엔드 홈페이지 구현 (2025.09.17)

### ✅ 완료된 작업
1. **홈페이지 3x3 그리드 완성**: TailwindCSS v4 업그레이드로 flex 레이아웃 문제 완전 해결
2. **React Router 라우팅**: 4개 메인 페이지 (/dashboard, /management, /ai-agent, /analytics)
3. **인터랙티브 UI 구현**: 모든 블록 클릭 시 해당 서비스 페이지로 네비게이션
4. **유저 인포 카드 뒤집기**: 터치 시 CSS 3D 애니메이션으로 매장정보/사용자명 표시
5. **인증 시스템 완전 연동**: Zustand 스토어와 실시간 사용자 정보 연동

### 🔧 해결된 기술적 문제들
- **TailwindCSS v4 마이그레이션**: `flex: '45'` 문자열이 `flex-grow: 45`로 잘못 해석되던 문제
- **PostCSS 설정**: `@tailwindcss/postcss` 플러그인으로 CSS-in-JS 정상 처리
- **CSS 기반 설정**: html/body fixed positioning + overflow hidden
- **React Router 통합**: BrowserRouter + useNavigate 훅
- **상태 관리**: 인증 스토어와 UI 컴포넌트 연동

### 🎨 구현된 UI 컴포넌트 시스템
- **BlockComp**: 메인 서비스 블록 (Management, Dashboard, Analytics)
- **BlockHighlightComp**: AI Agent 특별 블록 (그라데이션 텍스트)
- **BlockPromoComp**: 프로모션 이미지 블록 (QR, Chef, Robot 이미지)
- **BlockSmallComp**: 작은 기능 블록들 (Info, Settings, FAQ 등)
- **BlockInfo**: 3D 카드 뒤집기 기능 (매장정보/사용자명 표시)
- **BlockSignOut**: 로그아웃 기능 블록

### 🚀 홈페이지 구현 완료 기능들
- **Management 블록**: 매장 관리 페이지로 이동
- **Dashboard 블록**: 실시간 대시보드 페이지로 이동
- **AI Agent 블록**: AI 상담 페이지로 이동 (그라데이션 텍스트)
- **Analytics 블록**: 매출 분석 페이지로 이동
- **User Info 카드**: 터치 시 뒤집어서 매장정보/사용자명 표시
- **Sign Out 블록**: 완전한 로그아웃 처리 (상태 초기화 + 토큰 삭제)

## 🏗️ Phase 2-9 주요 업데이트 (2025.09.17)

### ✅ 완료된 작업
1. **AI Service 완전 구현**: Ollama 기반 LLM, SSE 스트리밍, 프롬프트 엔지니어링
2. **12개 AI API 엔드포인트**: 점주 Agent 6개, 고객 Chat 3개, 번역 4개, 제안 3개
3. **Ollama 통합**: gemma3:27b-it-q4_K_M 모델 연동 및 건강성 체크
4. **TypeScript 엄격 모드**: AsyncIterable, exactOptionalPropertyTypes 완전 대응
5. **서비스 간 통합**: Store Management, Dashboard, Order Service와 HTTP 통신

### 🔧 AI Service 핵심 기능
- **점주 AI Agent**: 실시간 분석, 맞춤형 조언, 비즈니스 인사이트, SSE 스트리밍
- **고객 AI Chat**: 메뉴 추천, 다국어 지원, 알레르기 고려, 식단 제한
- **다국어 번역**: 10개 언어 지원, 문화적 설명, 고성능 캐싱
- **비즈니스 제안**: 매출 분석, 메뉴 최적화, 운영 개선, 마케팅 아이디어
- **TTL 캐싱 시스템**: 30초/5분/1시간 단계별 인메모리 캐시
- **세션 관리**: 대화 세션 TTL 관리 및 자동 정리

## 🏗️ Phase 2-8 주요 업데이트 (2025.09.17)

### ✅ 완료된 작업
1. **History Service 완전 구현**: 전체 시스템 히스토리 추적 및 Undo/Redo 기능
2. **데이터베이스 스키마 확장**: HistoryLog 모델 확장 및 UndoStack 모델 신규 생성
3. **8개 API 엔드포인트**: 히스토리 조회, 생성, Undo/Redo, 엔티티별 조회
4. **TypeScript 엄격 모드**: 모든 타입 안전성 문제 해결 및 Prisma 매핑 완료
5. **서비스 간 통합**: Store Management, Order, User Profile Service와 HTTP 통신

### 🔧 History Service 핵심 기능
- **30분 Undo 마감시간**: 설정 가능한 안전한 실행 취소 시스템
- **권한 기반 Undo**: 본인 또는 점주만 실행 가능
- **실제 데이터 복원**: 다른 서비스 API 호출로 실제 상태 복원
- **인메모리 TTL 캐시**: 30초/5분/1시간 단계별 캐싱
- **Winston 구조화 로깅**: 히스토리 전용 로깅 메서드
- **히스토리 자동 정리**: 90일 보관 후 자동 삭제

## 🏗️ Phase 2-7 주요 업데이트 (2025.09.17)

### ✅ 완료된 작업
1. **전체 포트 마이그레이션**: 혼재된 3000/8000 → 체계적인 4000대
2. **133개 포트 레퍼런스 업데이트**: 15개 문서 파일 완전 동기화
3. **Payment Service 완전 복구**: TypeScript 엄격 모드 대응
4. **모든 서비스 정상 작동 검증**: Health check 통과

### 🔧 Payment Service 해결된 기술적 문제
- `@/config` 모듈 경로 문제 → tsconfig-paths 설치 및 설정
- TypeScript exactOptionalPropertyTypes 에러 → 조건부 속성 설정
- Express 미들웨어 타입 안전성 강화
- unused parameter 및 import 정리

### 📊 현재 서비스 실행 상태
- **모든 핵심 서비스 (8개)**: ✅ 정상 실행 중
- **지원 서비스 (2개)**: ✅ 정상 실행 중
- **전체 포트 체계**: 4000~4012 (체계적 배치)

## 📊 Database 정보

### 💾 접속 정보
```bash
# 로컬 개발 환경
DATABASE_URL="postgresql://postgres:Cl!Wm@Dp!Dl@Em!@localhost:5200/aipos?schema=public"
Container: database-postgres-1

# 테스트 계정 정보
매장 코드: 1001
점주 PIN: 1234 (김점주)
직원 PIN: 5678 (이직원)
테스트 QR: QR_TABLE_01, QR_TABLE_02, QR_TABLE_03
```

### 📊 완전 구축된 상태
- **PostgreSQL 15 + Prisma ORM** ✅
- **14개 테이블**: stores, users, categories, menus, places, tables, customers, orders, order_items, payments, history_logs, ai_conversations, analytics_daily, sms_verifications
- **7개 Enum**: user_role, subscription_status, table_status, order_status, payment_method, payment_status, ai_conversation_type
- **Demo 데이터**: 매장(1), 사용자(2), 카테고리(5), 메뉴(18), 테이블(21) 완료

## 🚨 새로운 Claude Code 세션 체크리스트

### 1. 프로젝트 상태 확인
```bash
cd /home/wk/projects/wafl
pwd && ls -la
```

### 2. 실행 중인 서비스 확인
```bash
# Auth Service 상태 확인 (포트 4001)
curl http://localhost:4001/health

# Store Management Service 상태 확인 (포트 4002)
curl http://localhost:4002/health

# Dashboard Service 상태 확인 (포트 4003)
curl http://localhost:4003/health

# Order Service 상태 확인 (포트 4004)
curl http://localhost:4004/health

# Payment Service 상태 확인 (포트 4005)
curl http://localhost:4005/health

# AI Service 상태 확인 (포트 4006)
curl http://localhost:4006/health

# User Profile Service 상태 확인 (포트 4009)
curl http://localhost:4009/health

# History Service 상태 확인 (포트 4010)
curl http://localhost:4010/health

# API Gateway 상태 확인 (포트 4000)
curl http://localhost:4000/health
```

### 3. Database 상태 확인
```bash
# PostgreSQL 컨테이너 확인
docker ps | grep postgres

# 데이터 확인
docker exec database-postgres-1 psql -U postgres -d aipos -c "
  SELECT
    (SELECT COUNT(*) FROM stores) as stores,
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM menus) as menus,
    (SELECT COUNT(*) FROM tables) as tables;"
```