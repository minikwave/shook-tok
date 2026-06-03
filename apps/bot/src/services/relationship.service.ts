import type { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "@shook/db";

type Db = PrismaClient | Prisma.TransactionClient;

type UpdateRelationshipResult = {
  streakCount: number;
  /** 24~48시간 내 연속 상호작용으로 스트릭이 늘어난 경우에만 보너스 지급 */
  streakBonusEligible: boolean;
};

export async function updateRelationship(
  db: Db,
  {
    serverId,
    userAId,
    userBId,
  }: {
    serverId: string;
    userAId: string;
    userBId: string;
  },
): Promise<UpdateRelationshipResult> {
  const [a, b] = [userAId, userBId].sort();

  const existing = await db.relationship.findUnique({
    where: {
      serverId_userAId_userBId: {
        serverId,
        userAId: a,
        userBId: b,
      },
    },
  });

  const now = new Date();

  if (!existing) {
    await db.relationship.create({
      data: {
        serverId,
        userAId: a,
        userBId: b,
        streakCount: 1,
        totalInteractions: 1,
        lastInteractionAt: now,
        lastStreakDate: now,
      },
    });
    return { streakCount: 1, streakBonusEligible: false };
  }

  const last = existing.lastStreakDate;
  let nextStreak = existing.streakCount;
  let streakBonusEligible = false;

  if (last) {
    const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);

    if (diffHours >= 24 && diffHours <= 48) {
      nextStreak += 1;
      streakBonusEligible = true;
    } else if (diffHours > 48) {
      nextStreak = 1;
    }
  }

  await db.relationship.update({
    where: { id: existing.id },
    data: {
      streakCount: nextStreak,
      totalInteractions: { increment: 1 },
      lastInteractionAt: now,
      lastStreakDate: now,
    },
  });

  return { streakCount: nextStreak, streakBonusEligible };
}

export async function getBestStreakForUser(
  serverId: string,
  userId: string,
): Promise<number> {
  const rows = await prisma.relationship.findMany({
    where: {
      serverId,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    select: { streakCount: true },
    orderBy: { streakCount: "desc" },
    take: 1,
  });
  return rows[0]?.streakCount ?? 0;
}
