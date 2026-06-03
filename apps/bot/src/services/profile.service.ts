import { prisma } from "@shook/db";
import { PokeStatus } from "@prisma/client";
import { TOK_LIMITS } from "@shook/shared";
import { getBestStreakForUser } from "./relationship.service.js";

function rolling24hStart() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000);
}

function isNewUser(createdAt: Date) {
  return Date.now() - createdAt.getTime() < 24 * 60 * 60 * 1000;
}

export async function getProfileForGuild(
  guildId: string,
  targetDiscordId: string,
) {
  const server = await prisma.server.findUnique({
    where: { discordGuildId: guildId },
  });
  if (!server) return null;

  const userRow = await prisma.user.findUnique({
    where: { discordUserId: targetDiscordId },
  });
  if (!userRow) return null;

  const dailySince = rolling24hStart();
  const dailyCap = isNewUser(userRow.createdAt)
    ? TOK_LIMITS.NEW_USER_DAILY_LIMIT
    : TOK_LIMITS.DAILY_INITIATED_TOK_LIMIT;

  const [serverPointsAgg, sentRolling, receivedCount, respondedCount, bestStreak] =
    await Promise.all([
      prisma.pointLedger.aggregate({
        where: { userId: userRow.id, serverId: server.id },
        _sum: { amount: true },
      }),
      prisma.poke.count({
        where: {
          serverId: server.id,
          senderId: userRow.id,
          createdAt: { gte: dailySince },
        },
      }),
      prisma.poke.count({
        where: { serverId: server.id, receiverId: userRow.id },
      }),
      prisma.poke.count({
        where: {
          serverId: server.id,
          receiverId: userRow.id,
          status: PokeStatus.RESPONDED,
        },
      }),
      getBestStreakForUser(server.id, userRow.id),
    ]);

  const serverPoints = serverPointsAgg._sum.amount ?? 0;
  const responseRate =
    receivedCount === 0
      ? 0
      : Math.round((respondedCount / receivedCount) * 100);

  return {
    displayName: userRow.username ?? "유저",
    serverPoints,
    sentRolling,
    sentCap: dailyCap,
    receivedCount,
    responseRate,
    bestStreak,
  };
}
