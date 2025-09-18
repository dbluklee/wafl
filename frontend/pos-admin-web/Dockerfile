# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 전체 프로젝트 복사 (모노레포)
COPY . .

# 루트에서 모든 의존성 설치 (workspaces 포함)
RUN npm install

# pos-admin-web 빌드 (TypeScript 체크 스킵)
RUN cd frontend/pos-admin-web && npm run build:docker

# Production stage
FROM nginx:alpine

# 빌드된 파일을 nginx로 복사
COPY --from=builder /app/frontend/pos-admin-web/dist /usr/share/nginx/html

# nginx 설정 파일 복사
COPY frontend/pos-admin-web/nginx.conf /etc/nginx/nginx.conf

# 포트 노출
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]