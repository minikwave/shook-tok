# SHOOK / TOK Discord Bot (MVP)

`tok dev docs.txt` 기준으로 구성한 pnpm 모노레포입니다.

## 구조

- `apps/bot` — discord.js 슬래시 명령어 (`/tok`, `/tokback`, `/profile`, `/rank`, `/tokhelp`)
- `apps/api` — `GET /health` (배포 확장용 최소 API)
- `packages/db` — Prisma + PostgreSQL 스키마
- `packages/shared` — `TOK_LIMITS`, `TOK_POINTS`, 기본 이모지 상수

## 로컬 실행

1. `.env.example`을 복사해 `.env`를 만들고 `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `DATABASE_URL`을 채웁니다.  
   (`.env`는 **저장소 루트** 또는 **`apps/bot`** 에 두면 자동으로 읽힙니다.)
2. `pnpm install`
3. DB: [Supabase](https://supabase.com/dashboard/project/zzkjlcyyvnaaauzrfoox) 또는 로컬 Postgres → `pnpm db:migrate:deploy`  
   (클라우드 배포·연동은 **`DEPLOY.md`** 참고)
4. `pnpm commands:register` — 슬래시 명령 등록 (`DISCORD_GUILD_ID`를 넣으면 **해당 서버만** 등록·즉시 반영, 비우면 **전역** 등록)  
5. `pnpm invite` — 브라우저에서 열 초대 URL 출력 (`.env`에 `DISCORD_CLIENT_ID` 필요)  
6. `pnpm dev` — shared/db 빌드 후 봇 실행

전체 패키지 빌드만 확인할 때는 `pnpm build`. 프로덕션 실행 예: `pnpm build` 후 `pnpm start:bot`.

Discord Developer Portal에서 Bot 토큰·Application ID를 발급하고, 봇에 **applications.commands** 및 서버 권한을 부여하세요.

## Docker (Railway / 수동)

프로덕션은 **Railway**가 루트 `Dockerfile`로 배포합니다. 로컬에서 이미지만 테스트할 때:

```bash
docker build -t shook-tok-bot .
docker run --env-file .env shook-tok-bot
```

## 배포

Supabase + Railway + Vercel 연동 절차는 **`DEPLOY.md`** 를 보세요.

## 참고

문서에 있던 Redis·PostHog는 MVP에서 제외했습니다. `REDIS_URL`은 예약용입니다.

