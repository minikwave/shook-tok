/**
 * Full stack verification: Vercel, DB, Discord bot token (optional).
 */
import { config } from "dotenv";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.join(root, ".env") });

const tokenFile = path.join(root, "secrets/bot.token");
if (!process.env.DISCORD_BOT_TOKEN?.trim() && existsSync(tokenFile)) {
  process.env.DISCORD_BOT_TOKEN = readFileSync(tokenFile, "utf8").trim();
}

const BOT_TOKEN_RE = /^MT[\w\-_.]{20,}$/;

const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`OK ${name}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    results.push({ name, ok: false, error: msg });
    console.error(`FAIL ${name}: ${msg}`);
  }
}

await check("Vercel /api/health", async () => {
  const res = await fetch("https://shook-tok.vercel.app/api/health");
  const body = await res.json();
  if (!res.ok || !body.ok) throw new Error(JSON.stringify(body));
});

await check("DATABASE_URL", async () => {
  if (!process.env.DATABASE_URL?.trim()) throw new Error("missing");
});

await check("Prisma DB connect", async () => {
  const dbUrl = pathToFileURL(
    path.join(root, "packages/db/dist/client.js"),
  ).href;
  const { prisma } = await import(dbUrl);
  await prisma.$queryRaw`SELECT 1`;
  await prisma.$disconnect();
});

await check("DB tables", async () => {
  const dbUrl = pathToFileURL(
    path.join(root, "packages/db/dist/client.js"),
  ).href;
  const { prisma } = await import(dbUrl);
  const n = await prisma.user.count();
  console.log(`  User rows: ${n}`);
  await prisma.$disconnect();
});

await check("DISCORD_CLIENT_ID", async () => {
  if (!process.env.DISCORD_CLIENT_ID?.trim()) throw new Error("missing");
});

await check("Discord bot token", async () => {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "no token — Discord Portal > Bot > Reset Token, then pnpm setup:token",
    );
  }
  if (!BOT_TOKEN_RE.test(token)) {
    throw new Error("invalid token format");
  }
  const res = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) throw new Error(`Discord API ${res.status}`);
  const me = await res.json();
  console.log(`  bot: ${me.username}`);
});

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
