import { prisma } from "@shook/db";

export type RankPeriod = "daily" | "weekly" | "all";

function periodStart(period: RankPeriod): Date | null {
  const now = Date.now();
  if (period === "all") return null;
  if (period === "daily") return new Date(now - 24 * 60 * 60 * 1000);
  const d = new Date(now);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getServerRankings(
  guildId: string,
  period: RankPeriod,
) {
  const server = await prisma.server.findUnique({
    where: { discordGuildId: guildId },
  });
  if (!server) return null;

  const from = periodStart(period);
  const rows = await prisma.pointLedger.groupBy({
    by: ["userId"],
    where: {
      serverId: server.id,
      ...(from ? { createdAt: { gte: from } } : {}),
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 10,
  });

  const userIds = rows.map((r) => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true },
  });
  const nameById = new Map(users.map((u) => [u.id, u.username ?? "유저"]));

  return rows.map((r, i) => ({
    rank: i + 1,
    name: nameById.get(r.userId) ?? "유저",
    points: r._sum.amount ?? 0,
  }));
}
