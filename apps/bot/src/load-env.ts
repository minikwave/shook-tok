import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { readFileSync, existsSync } from "node:fs";

const here = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(here, "../.env") });
config({ path: path.join(here, "../../../.env") });

/** gitignore: secrets/bot.token (한 줄, Bot Token만) */
const tokenFile = path.join(here, "../../../secrets/bot.token");
const BOT_TOKEN_RE = /^MT[\w\-_.]{20,}$/;
if (!process.env.DISCORD_BOT_TOKEN?.trim() && existsSync(tokenFile)) {
  const t = readFileSync(tokenFile, "utf8").trim();
  if (BOT_TOKEN_RE.test(t)) process.env.DISCORD_BOT_TOKEN = t;
}
