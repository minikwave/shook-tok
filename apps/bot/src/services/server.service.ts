import { prisma } from "@shook/db";

export async function upsertServer(guildId: string, name: string | null) {
  return prisma.server.upsert({
    where: { discordGuildId: guildId },
    update: { name: name ?? undefined },
    create: { discordGuildId: guildId, name: name ?? undefined },
  });
}
