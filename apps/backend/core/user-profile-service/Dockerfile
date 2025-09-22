# 빌드 스테이지
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./
COPY tsconfig.json ./

# 의존성 설치
RUN npm ci --only=production && npm cache clean --force

# 소스 코드 복사
COPY src ./src

# TypeScript 빌드
RUN npm run build

# 운영 스테이지
FROM node:18-alpine AS production

WORKDIR /app

# 필수 시스템 패키지 설치
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S wafl -u 1001

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist

# 업로드 디렉토리 생성
RUN mkdir -p uploads/profiles && chown -R wafl:nodejs uploads

# 사용자 전환
USER wafl

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3006/health', (res) => { \
    process.exit(res.statusCode === 200 ? 0 : 1) \
  }).on('error', () => process.exit(1))"

# 포트 노출
EXPOSE 3006

# 시작 명령어
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]