import "./load-env.js";
import {
  Client,
  GatewayIntentBits,
} from "discord.js";
import { handleInteraction } from "./interaction-router.js";
import { prisma } from "@shook/db";
import { expirePendingPokes } from "./services/tok.service.js";

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error("DISCORD_BOT_TOKEN이 설정되어 있지 않습니다.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const expireIntervalMs = 5 * 60 * 1000;
let expireTimer: ReturnType<typeof setInterval> | undefined;

client.once("ready", async (c) => {
  console.log(`로그인: ${c.user.tag}`);
  try {
    await prisma.$connect();
    console.log("DB 연결됨");
  } catch (e) {
    console.error("DB 연결 실패", e);
  }
  await expirePendingPokes();
  expireTimer = setInterval(() => {
    void expirePendingPokes();
  }, expireIntervalMs);
});

client.on("interactionCreate", (i) => {
  void handleInteraction(i);
});

client.on("guildCreate", async (guild) => {
  const { upsertServer } = await import("./services/server.service.js");
  await upsertServer(guild.id, guild.name);
});

void client.login(token);

async function shutdown(signal: string) {
  console.log(`${signal} 수신, 종료 중…`);
  if (expireTimer) {
    clearInterval(expireTimer);
    expireTimer = undefined;
  }
  client.removeAllListeners();
  await client.destroy().catch(() => undefined);
  await prisma.$disconnect().catch(() => undefined);
  process.exit(0);
}

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    void shutdown(sig);
  });
}

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
