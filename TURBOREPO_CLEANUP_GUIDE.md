# Turborepo 마이그레이션 완료 후 정리 가이드

Turborepo가 정상적으로 작동하는 것이 확인되면, npm workspaces 관련 파일과 설정을 정리하여 순수 Turborepo 환경으로 만들 수 있습니다.

## 🎯 현재 상태

- ✅ **Turborepo 마이그레이션 완료**: npm workspaces → Turborepo
- ✅ **폴더 구조 재구성 완료**: apps/ 및 packages/ 구조
- ✅ **의존성 경로 업데이트 완료**: 새로운 폴더 구조에 맞게 조정
- ✅ **Turborepo 정상 동작 확인**: build, dev, lint 등 모든 명령어 정상 작동

## 🗑️ 정리해야 할 파일들 및 설정

### 1. package.json에서 제거할 설정

#### **루트 package.json** (`/home/wk/projects/wafl/package.json`)

**제거할 설정**:
```json
{
  "workspaces": [
    "apps/frontend/*",
    "apps/backend/core/*",
    "apps/backend/support/*",
    "packages/*"
  ]
}
```

**이유**: Turborepo는 자체적으로 패키지를 발견하므로 workspaces 설정이 불필요함

### 2. 의존성에서 제거할 패키지

#### **루트 package.json devDependencies에서 제거 가능**:
```json
{
  "devDependencies": {
    "concurrently": "^8.2.2"  // ← 제거 가능 (Turborepo가 대체)
  }
}
```

**이유**:
- `concurrently`: Turborepo가 병렬 실행을 담당하므로 불필요
- 다른 도구들 (eslint, prettier, typescript 등)은 유지

### 3. scripts에서 정리할 명령어들

#### **루트 package.json scripts 최적화**:

**현재**:
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "lint:check": "turbo run lint:check",
    "format": "turbo run format",
    "format:check": "turbo run format:check",
    "type-check": "turbo run type-check",
    "docker:build": "make build",
    "docker:dev": "make dev",
    "docker:up": "make up",
    "docker:down": "make down",
    "prepare": "husky install",
    "dev:auth": "turbo run dev --filter=@wafl/auth-service",
    "dev:gateway": "turbo run dev --filter=@wafl/api-gateway",
    "dev:frontend": "turbo run dev --filter='./apps/frontend/**'",
    "dev:backend": "turbo run dev --filter='./apps/backend/**'",
    "dev:all": "turbo run dev"
  }
}
```

**정리 후**:
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "turbo run format",
    "type-check": "turbo run type-check",
    "prepare": "husky install",
    "dev:auth": "turbo run dev --filter=@wafl/auth-service",
    "dev:gateway": "turbo run dev --filter=@wafl/api-gateway",
    "dev:frontend": "turbo run dev --filter='./apps/frontend/**'",
    "dev:backend": "turbo run dev --filter='./apps/backend/**'"
  }
}
```

**제거되는 것들**:
- `lint:check`, `format:check`: 중복 제거 (lint, format이면 충분)
- `dev:all`: 기본 `dev` 명령어와 동일
- Docker 관련: 필요시 별도 스크립트 파일로 이관

### 4. node_modules 심볼릭 링크 정리

#### **npm workspaces가 생성한 심볼릭 링크들**:

**확인 방법**:
```bash
find node_modules -type l -ls
```

**예상 링크들**:
```
node_modules/@wafl/auth-service -> ../apps/backend/core/auth-service
node_modules/@wafl/api-gateway -> ../apps/backend/support/api-gateway
node_modules/@shared/database -> ../packages/database
node_modules/@shared/types -> ../packages/types
node_modules/@shared/utils -> ../packages/utils
node_modules/pos-admin-web -> ../apps/frontend/pos-admin-web
```

**정리 방법**:
```bash
# 심볼릭 링크 제거
find node_modules -type l -delete

# 또는 전체 재설치
rm -rf node_modules package-lock.json
npm install
```

### 5. 개별 패키지의 의존성 정리

#### **확인이 필요한 파일들**:

각 패키지의 `package.json`에서 `file:` 프로토콜 의존성들:

**예시 - auth-service**:
```json
{
  "dependencies": {
    "@shared/database": "file:../../../../packages/database",
    "@shared/types": "file:../../../../packages/types",
    "@shared/utils": "file:../../../../packages/utils"
  }
}
```

**Turborepo 방식으로 변경 가능**:
```json
{
  "dependencies": {
    "@shared/database": "workspace:*",
    "@shared/types": "workspace:*",
    "@shared/utils": "workspace:*"
  }
}
```

### 6. .npmrc 파일 추가 (선택사항)

#### **Turborepo 최적화를 위한 .npmrc**:

**생성할 파일**: `/home/wk/projects/wafl/.npmrc`
```
# Turborepo 최적화
prefer-workspace-packages=true
save-workspace-protocol=rolling

# 성능 최적화
package-lock=false
shrinkwrap=false
```

## 🧪 정리 후 테스트 체크리스트

### 1. 기본 기능 테스트
```bash
# 모든 패키지 빌드
turbo build

# 개발 서버 실행
turbo dev --filter=@wafl/auth-service

# 린트 테스트
turbo lint --filter=pos-admin-web

# 타입 체크
turbo type-check
```

### 2. 필터링 기능 테스트
```bash
# 프론트엔드만
turbo dev --filter='./apps/frontend/**'

# 백엔드만
turbo dev --filter='./apps/backend/**'

# 특정 패키지만
turbo dev --filter=@wafl/auth-service
```

### 3. 의존성 해결 테스트
```bash
# 의존성 그래프 확인
turbo build --graph

# 캐시 동작 확인
turbo build
turbo build  # 두 번째 실행시 캐시 사용되는지 확인
```

## 🎯 정리 실행 순서

1. **백업 생성**
   ```bash
   git add . && git commit -m "backup before cleanup"
   ```

2. **package.json 수정**
   - workspaces 설정 제거
   - 불필요한 dependencies 제거
   - scripts 정리

3. **node_modules 정리**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **테스트 실행**
   ```bash
   turbo build --dry
   turbo dev --filter=@wafl/auth-service --dry
   ```

5. **정상 동작 확인 후 최종 커밋**
   ```bash
   git add . && git commit -m "cleanup: pure Turborepo setup"
   ```

## ⚠️ 주의사항

1. **점진적 정리**: 한 번에 모든 것을 제거하지 말고 단계별로 진행
2. **백업 필수**: 각 단계마다 git commit으로 백업
3. **테스트 중요**: 각 변경 후 반드시 `turbo build --dry` 로 확인
4. **복구 방안**: 문제 발생시 git reset으로 이전 상태 복구 가능

## 🏁 최종 상태

정리 완료 후에는:
- ✅ 순수 Turborepo 환경
- ✅ npm workspaces 잔재 제거
- ✅ 최적화된 의존성 관리
- ✅ 깔끔한 프로젝트 구조

이 가이드는 Turborepo가 안정적으로 동작하는 것이 확인된 후에 실행하세요!