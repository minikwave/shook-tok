#!/bin/sh
if [ -z "$DISCORD_BOT_TOKEN" ]; then
  echo "DISCORD_BOT_TOKEN missing. Set in Railway Variables."
  exit 1
fi
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL missing."
  exit 1
fi
echo "Running DB migrations..."
pnpm db:migrate:deploy
echo "Starting Discord bot..."
exec node apps/bot/dist/index.js
