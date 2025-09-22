FROM node:20-alpine AS builder

WORKDIR /app

# 전체 프로젝트 복사 (모노레포)
COPY . .

# 루트에서 모든 의존성 설치 (workspaces 포함)
RUN npm install

# shared 모듈들 빌드
RUN npm run build --workspace=@shared/database
RUN npm run build --workspace=@shared/types --if-present
RUN npm run build --workspace=@shared/utils --if-present

# Prisma 클라이언트 생성
RUN npx prisma generate --schema=./backend/shared/database/prisma/schema.prisma

# api-gateway 빌드
RUN npm run build --workspace=@wafl/api-gateway

# Production stage
FROM node:20-alpine

# Alpine에서 native modules 빌드를 위한 도구 설치
RUN apk add --no-cache make gcc g++ python3 libc6-compat

WORKDIR /app

# 전체 프로젝트 구조 복사 (workspaces 의존성 해결을 위해)
COPY . .

# 프로덕션 의존성만 설치 (husky 스킵)
RUN npm ci --only=production --ignore-scripts

# Prisma 클라이언트 생성 (production)
RUN npx prisma generate --schema=./backend/shared/database/prisma/schema.prisma

# 빌드된 파일 복사
COPY --from=builder /app/backend/support/api-gateway/dist ./backend/support/api-gateway/dist

# 헬스체크 파일 복사
COPY backend/support/api-gateway/healthcheck.js ./backend/support/api-gateway/

# 작업 디렉토리를 api-gateway로 변경
WORKDIR /app/backend/support/api-gateway

# 비루트 사용자로 실행
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

EXPOSE 4000

CMD ["node", "dist/index.js"]