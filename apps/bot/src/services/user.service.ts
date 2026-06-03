import type { User as DiscordUser } from "discord.js";
import { prisma } from "@shook/db";

export async function upsertDiscordUser(user: DiscordUser) {
  return prisma.user.upsert({
    where: { discordUserId: user.id },
    update: {
      username: user.username,
      avatarUrl: user.displayAvatarURL({ size: 128 }),
    },
    create: {
      discordUserId: user.id,
      username: user.username,
      avatarUrl: user.displayAvatarURL({ size: 128 }),
    },
  });
}
