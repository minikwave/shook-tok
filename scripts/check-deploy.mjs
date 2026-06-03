#!/usr/bin/env node
/**
 * 배포 상태 간단 점검 (Vercel health + 로컬 env 필수값)
 */
const healthUrl =
  process.env.HEALTH_URL ?? "https://shook-tok.vercel.app/api/health";

async function main() {
  let ok = true;

  try {
    const res = await fetch(healthUrl);
    const body = await res.json();
    if (res.ok && body.ok) {
      console.log(`✓ Vercel health: ${healthUrl}`);
    } else {
      console.error(`✗ Vercel health failed: ${res.status}`, body);
      ok = false;
    }
  } catch (e) {
    console.error("✗ Vercel health unreachable:", e.message);
    ok = false;
  }

  const required = ["DISCORD_BOT_TOKEN", "DISCORD_CLIENT_ID", "DATABASE_URL"];
  const missing = required.filter((k) => !process.env[k]?.trim());
  if (missing.length) {
    console.log(`○ 로컬 .env 미설정 (Railway만 쓸 경우 무시): ${missing.join(", ")}`);
  } else {
    console.log("✓ 로컬 .env Discord/DB 변수 존재");
  }

  console.log("\nRailway 로그 확인:");
  console.log(
    "  railway logs -s 12b8d33e-3d7f-448c-b170-dacca55c4fc2 --lines 20",
  );
  console.log("\nDiscord 슬래시 명령 등록:");
  console.log("  pnpm commands:register");
  console.log("  또는 GitHub Actions → Register Discord Commands");

  process.exit(ok ? 0 : 1);
}

void main();
