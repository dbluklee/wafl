FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 먼저 복사 (캐시 활용)
COPY package*.json ./
RUN npm ci

# 소스 복사 및 빌드
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# 필요한 도구 설치 (이미지 처리용)
RUN apk add --no-cache vips

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist

# 헬스체크 파일 복사
COPY healthcheck.js ./

# 업로드 디렉토리 생성
RUN mkdir -p uploads/menus

# 비루트 사용자로 실행
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

EXPOSE 3002

CMD ["node", "dist/index.js"]