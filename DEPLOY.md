# 배포 가이드 (Supabase + Railway + Vercel)

## 리소스

| 서비스 | URL |
|--------|-----|
| GitHub | https://github.com/minikwave/shook-tok |
| Supabase | https://supabase.com/dashboard/project/zzkjlcyyvnaaauzrfoox |
| Railway | https://railway.com/project/5c4b1aab-a80b-4210-ba16-869784b50804 |
| Vercel | https://vercel.com/minik-kims-projects/shook-tok |

## 1. Supabase (PostgreSQL)

- 프로젝트: **shook-tok** (`zzkjlcyyvnaaauzrfoox`, Seoul)
- 스키마는 `packages/db/prisma/migrations` 기준으로 적용됨
- 로컬/CI에서 Management API로 적용 (IPv6-only direct 호스트 이슈 회피):
  ```bash
  supabase link --project-ref zzkjlcyyvnaaauzrfoox
  supabase db query --linked -f packages/db/prisma/migrations/20250515120000_init/migration.sql
  ```
- Railway/Prisma 런타임 URL: **Session pooler** (port 5432, `aws-1-ap-northeast-2.pooler.supabase.com`)

## 2. Railway (Discord Bot)

### Discord 앱 만들기 (최초 1회)

1. https://discord.com/developers/applications → **New Application**
2. **Bot** → **Reset Token** → `DISCORD_BOT_TOKEN` 복사
3. **General Information** → Application ID → `DISCORD_CLIENT_ID`
4. Bot → **Privileged Gateway Intents**: MVP는 **Guilds만** 사용 (특권 인텐트 불필요)
5. `pnpm invite` 로 초대 URL 생성 후 테스트 서버에 추가

### Railway 변수

1. GitHub repo 연결 또는 `railway up`
2. **Variables** (서비스 `shook-tok`):
   - `DISCORD_BOT_TOKEN` ← **필수**
   - `DISCORD_CLIENT_ID` ← **필수**
   - `DATABASE_URL` ← Supabase pooler URI (이미 설정됨)
   - `NODE_ENV=production`
   - (선택) `DISCORD_GUILD_ID` — 테스트 서버 ID, 명령 즉시 반영용

로컬 `.env` 작성 후 Railway에 한 번에 넣기:

```powershell
.\scripts\sync-railway-env.ps1
```

3. `Dockerfile` → 시작 시 `pnpm db:migrate:deploy` 후 봇 실행
4. 슬래시 명령 등록 (택 1):
   - 로컬: `pnpm commands:register`
   - GitHub: **Actions → Register Discord Commands** (repo Secrets에 `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID` 등록)

## 3. Vercel (Health API)

- `api/health.js`만 배포 (모노레포 전체 빌드 없음)
- `/api/health` 또는 `/` → `{ "ok": true, "service": "shook-tok-api" }`
- Git push 시 Vercel 자동 배포 (GitHub 연동됨)

## 4. 점검 체크리스트

- [ ] Supabase 테이블: User, Server, Poke, PointLedger, Relationship
- [ ] Railway Variables에 Discord 토큰 설정
- [ ] Railway 로그: `DB 연결됨`, `로그인: <봇#tag>`
- [ ] Vercel `/api/health` 200
- [ ] Discord `/tokhelp` 동작

## 5. 보안

- DB 비밀번호·Bot 토큰은 **저장소에 커밋하지 않음**
- Supabase Dashboard에서 비밀번호 로테이션 권장
