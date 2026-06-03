# syntax=docker/dockerfile:1
# 봇만 실행하는 이미지 (Railway / Fly.io 등). 실행 시 DATABASE_URL·DISCORD_* 환경변수 필요.
FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
COPY apps ./apps
COPY scripts/start-production.sh ./scripts/start-production.sh
RUN sed -i 's/\r$//' scripts/start-production.sh && chmod +x scripts/start-production.sh

RUN pnpm install --frozen-lockfile

# Prisma generate는 유효한 DATABASE_URL 형식이 있어야 함 (실제 DB 연결은 안 함)
ARG DATABASE_URL="postgresql://docker:docker@127.0.0.1:5432/docker"
ENV DATABASE_URL=$DATABASE_URL

RUN pnpm db:generate \
  && pnpm --filter @shook/shared build \
  && pnpm --filter @shook/db build \
  && pnpm --filter @shook/bot build

ENV NODE_ENV=production
CMD ["sh", "scripts/start-production.sh"]
