#!/bin/sh
set -e

if [ -z "$DISCORD_BOT_TOKEN" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo " DISCORD_BOT_TOKEN 이 없습니다."
  echo " Railway → shook-tok → Variables 에 추가하세요."
  echo " 또는 로컬: .env 작성 후 scripts/sync-railway-env.ps1"
  echo " 가이드: DEPLOY.md"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL 이 없습니다."
  exit 1
fi

echo "DB 마이그레이션 적용 중..."
pnpm db:migrate:deploy

echo "Discord 봇 시작..."
exec node apps/bot/dist/index.js
