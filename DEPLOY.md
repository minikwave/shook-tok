# 배포 가이드 (Supabase + Railway + Vercel)

## 1. Supabase (PostgreSQL)

1. [Supabase Dashboard](https://supabase.com/dashboard) → New project → 이름 `shook-tok` (또는 CLI)
2. **Project Settings → Database → Connection string → URI** 복사  
   - Railway 봇(상시 연결): **Direct connection** (`db.xxx.supabase.co:5432`)  
   - Prisma: `?sslmode=require` 추가 권장
3. SQL Editor 또는 로컬에서 마이그레이션:
   ```bash
   DATABASE_URL="postgresql://..." pnpm db:migrate:deploy
   ```

## 2. Railway (Discord Bot)

1. [Railway](https://railway.app) → New Project → **Deploy from GitHub repo** (`shook-tok` 등)
2. 루트 `Dockerfile` + `railway.toml` 사용 (자동 감지)
3. **Variables** 설정:
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `DATABASE_URL` (Supabase URI)
   - `NODE_ENV=production`
4. 배포 후 로컬/CI에서 한 번:
   ```bash
   pnpm commands:register
   ```
   (`DISCORD_GUILD_ID`로 테스트 서버만 등록 가능)

## 3. Vercel (Health API)

1. [Vercel](https://vercel.com) → Import Git repo
2. Framework Preset: **Other**, Root Directory: **`.`** (모노레포 루트)
3. `vercel.json`의 `installCommand: pnpm install` 적용
4. 배포 후 `https://<project>.vercel.app/api/health` 확인

## 4. 환경 변수 요약

| 변수 | Railway (Bot) | Vercel (API) |
|------|---------------|--------------|
| `DISCORD_BOT_TOKEN` | ✅ | — |
| `DISCORD_CLIENT_ID` | ✅ | — |
| `DATABASE_URL` | ✅ | — |
| `NODE_ENV` | `production` | `production` |

## 5. 점검 체크리스트

- [ ] Supabase 테이블 생성 (`pnpm db:migrate:deploy`)
- [ ] Railway 로그: `DB 연결됨`, `로그인: <봇#tag>`
- [ ] Vercel `/api/health` → `{ "ok": true }`
- [ ] Discord 테스트 서버에서 `/tokhelp` 동작
- [ ] 슬래시 명령 등록 (`pnpm commands:register`)
