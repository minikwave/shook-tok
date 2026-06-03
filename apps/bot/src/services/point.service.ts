import type { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "@shook/db";

type Db = PrismaClient | Prisma.TransactionClient;

export async function grantPointsTx(
  db: Db,
  {
    userId,
    serverId,
    amount,
    reason,
    refType,
    refId,
  }: {
    userId: string;
    serverId: string;
    amount: number;
    reason: string;
    refType?: string;
    refId?: string;
  },
) {
  await db.pointLedger.create({
    data: {
      userId,
      serverId,
      amount,
      reason,
      refType,
      refId,
    },
  });
  await db.user.update({
    where: { id: userId },
    data: {
      pointsBalance: { increment: amount },
    },
  });
}

export async function grantPoints({
  userId,
  serverId,
  amount,
  reason,
  refType,
  refId,
}: {
  userId: string;
  serverId: string;
  amount: number;
  reason: string;
  refType?: string;
  refId?: string;
}) {
  await prisma.$transaction(async (tx) => {
    await grantPointsTx(tx, {
      userId,
      serverId,
      amount,
      reason,
      refType,
      refId,
    });
  });
}
