# WAFL - AI POS System

AI Agent 기반 차세대 외식업 주문결제 시스템

## 시작하기

### 시스템 요구사항
- Node.js 20 LTS 이상
- Docker 24.0 이상
- Docker Compose 2.20 이상

### 개발 환경 설정

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
```bash
cp docker/.env.example docker/.env
# .env 파일을 수정하여 필요한 API 키 및 설정 추가
```

3. Docker 개발 환경 시작
```bash
make dev
```

### 주요 명령어

```bash
# 전체 서비스 시작
make up

# 개발 모드 시작 (hot-reload)
make dev

# 서비스 중지
make down

# 전체 빌드
make build

# 로그 확인
make logs

# 헬스체크
make health
```

## 아키텍처

19개의 독립적인 Docker 서비스로 구성된 마이크로서비스 아키텍처:

- **Infrastructure**: PostgreSQL, Redis, RabbitMQ
- **Backend Services**: 16개 마이크로서비스
- **Frontend Services**: 3개 웹 애플리케이션
- **Reverse Proxy**: Nginx

자세한 내용은 [CLAUDE.md](./CLAUDE.md)를 참조하세요.

## 개발 가이드

- [CLAUDE.md](./CLAUDE.md) - 전체 프로젝트 가이드 및 아키텍처
- 코딩 컨벤션: TypeScript strict mode, I/T/E 접두사 규칙
- API 표준: RESTful API with consistent response format

## 라이센스

Private Repository