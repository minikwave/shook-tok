import type { User as DiscordUser } from "discord.js";
import { PokeStatus } from "@prisma/client";
import { prisma } from "@shook/db";
import { TOK_LIMITS, TOK_POINTS } from "@shook/shared";
import { grantPointsTx } from "./point.service.js";
import { upsertDiscordUser } from "./user.service.js";
import { updateRelationship } from "./relationship.service.js";

type SendTokInput = {
  guildId: string;
  guildName: string;
  sender: DiscordUser;
  receiver: DiscordUser;
  emotion?: string;
  message?: string | null;
};

export async function expirePendingPokes() {
  const cutoff = new Date(
    Date.now() - TOK_LIMITS.TOK_EXPIRE_MINUTES * 60 * 1000,
  );
  await prisma.poke.updateMany({
    where: {
      status: PokeStatus.PENDING,
      createdAt: { lt: cutoff },
    },
    data: { status: PokeStatus.EXPIRED },
  });
}

function initiatedDailyLimit(isNewUser: boolean) {
  return isNewUser
    ? TOK_LIMITS.NEW_USER_DAILY_LIMIT
    : TOK_LIMITS.DAILY_INITIATED_TOK_LIMIT;
}

export async function sendTok(input: SendTokInput) {
  const { guildId, guildName, sender, receiver, emotion, message } = input;

  if (sender.id === receiver.id) {
    return {
      ok: false as const,
      message: "자기 자신에게는 TOK할 수 없어요.",
    };
  }

  if (receiver.bot) {
    return {
      ok: false as const,
      message: "봇에게는 TOK할 수 없어요.",
    };
  }

  const normalizedMessage =
    message === null || message === undefined
      ? null
      : message.trim() || null;

  if (
    normalizedMessage &&
    normalizedMessage.length > TOK_LIMITS.MAX_TOK_MESSAGE_CHARS
  ) {
    return {
      ok: false as const,
      message: `메시지는 ${TOK_LIMITS.MAX_TOK_MESSAGE_CHARS}자 이하로 작성해주세요.`,
    };
  }

  const server = await prisma.server.upsert({
    where: { discordGuildId: guildId },
    update: { name: guildName },
    create: { discordGuildId: guildId, name: guildName },
  });

  const senderUser = await upsertDiscordUser(sender);
  const receiverUser = await upsertDiscordUser(receiver);

  const isNewUser =
    Date.now() - senderUser.createdAt.getTime() < 24 * 60 * 60 * 1000;
  const dailyCap = initiatedDailyLimit(isNewUser);

  const cooldownSince = new Date(
    Date.now() - TOK_LIMITS.SAME_RECEIVER_COOLDOWN_MINUTES * 60 * 1000,
  );

  const recentSameReceiverTok = await prisma.poke.findFirst({
    where: {
      serverId: server.id,
      senderId: senderUser.id,
      receiverId: receiverUser.id,
      createdAt: { gte: cooldownSince },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentSameReceiverTok) {
    const nextAt = new Date(
      recentSameReceiverTok.createdAt.getTime() +
        TOK_LIMITS.SAME_RECEIVER_COOLDOWN_MINUTES * 60 * 1000,
    );
    const waitMin = Math.max(
      1,
      Math.ceil((nextAt.getTime() - Date.now()) / 60000),
    );
    return {
      ok: false as const,
      message: `아직 같은 친구에게 다시 TOK할 수 없어요.\n다음 TOK 가능 시간: 약 ${waitMin}분 후`,
    };
  }

  const dailySince = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const dailyTokCount = await prisma.poke.count({
    where: {
      serverId: server.id,
      senderId: senderUser.id,
      createdAt: { gte: dailySince },
    },
  });

  if (dailyTokCount >= dailyCap) {
    return {
      ok: false as const,
      message:
        "오늘 먼저 보낼 수 있는 TOK을 모두 사용했어요.\n내일 다시 TOK해보세요.",
    };
  }

  const poke = await prisma.$transaction(async (tx) => {
    const created = await tx.poke.create({
      data: {
        serverId: server.id,
        senderId: senderUser.id,
        receiverId: receiverUser.id,
        emotion: emotion ?? "🔥",
        message: normalizedMessage ?? undefined,
        status: PokeStatus.PENDING,
      },
    });

    await grantPointsTx(tx, {
      userId: senderUser.id,
      serverId: server.id,
      amount: TOK_POINTS.SENT,
      reason: "tok_sent",
      refType: "poke",
      refId: created.id,
    });

    await grantPointsTx(tx, {
      userId: receiverUser.id,
      serverId: server.id,
      amount: TOK_POINTS.RECEIVED,
      reason: "tok_received",
      refType: "poke",
      refId: created.id,
    });

    return created;
  });

  const remainingToday = dailyCap - dailyTokCount - 1;

  return {
    ok: true as const,
    data: {
      pokeId: poke.id,
      senderName: sender.globalName ?? sender.username,
      receiverName: receiver.globalName ?? receiver.username,
      emotion: emotion ?? "🔥",
      message: normalizedMessage,
      remainingToday,
      dailyCap,
    },
  };
}

type TokBackInput = {
  guildId: string;
  responder: DiscordUser;
  sender: DiscordUser;
};

export async function tokBack(input: TokBackInput) {
  const { guildId, responder, sender } = input;

  const server = await prisma.server.findUnique({
    where: { discordGuildId: guildId },
  });

  if (!server) {
    return {
      ok: false as const,
      message: "아직 이 서버에서 TOK 기록이 없어요.",
    };
  }

  const responderUser = await upsertDiscordUser(responder);
  const senderUser = await upsertDiscordUser(sender);

  const expireSince = new Date(
    Date.now() - TOK_LIMITS.TOK_EXPIRE_MINUTES * 60 * 1000,
  );

  const pendingTok = await prisma.poke.findFirst({
    where: {
      serverId: server.id,
      senderId: senderUser.id,
      receiverId: responderUser.id,
      status: PokeStatus.PENDING,
      createdAt: { gte: expireSince },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!pendingTok) {
    return {
      ok: false as const,
      message: "응답할 수 있는 TOK을 찾지 못했어요.",
    };
  }

  const now = new Date();
  const responseSeconds = Math.floor(
    (now.getTime() - pendingTok.createdAt.getTime()) / 1000,
  );

  const withinBonusWindow =
    responseSeconds <= TOK_LIMITS.RESPONSE_BONUS_WINDOW_MINUTES * 60;

  const rel = await prisma.$transaction(async (tx) => {
    await tx.poke.update({
      where: { id: pendingTok.id },
      data: {
        status: PokeStatus.RESPONDED,
        respondedAt: now,
      },
    });

    if (withinBonusWindow) {
      await grantPointsTx(tx, {
        userId: responderUser.id,
        serverId: server.id,
        amount: TOK_POINTS.TOKBACK_BONUS,
        reason: "tokback_bonus",
        refType: "poke",
        refId: pendingTok.id,
      });
      await grantPointsTx(tx, {
        userId: senderUser.id,
        serverId: server.id,
        amount: TOK_POINTS.TOKBACK_BONUS,
        reason: "tokback_bonus",
        refType: "poke",
        refId: pendingTok.id,
      });
    }

    const r = await updateRelationship(tx, {
      serverId: server.id,
      userAId: senderUser.id,
      userBId: responderUser.id,
    });

    if (r.streakBonusEligible) {
      await grantPointsTx(tx, {
        userId: responderUser.id,
        serverId: server.id,
        amount: TOK_POINTS.STREAK_BONUS,
        reason: "streak_bonus",
        refType: "poke",
        refId: pendingTok.id,
      });
      await grantPointsTx(tx, {
        userId: senderUser.id,
        serverId: server.id,
        amount: TOK_POINTS.STREAK_BONUS,
        reason: "streak_bonus",
        refType: "poke",
        refId: pendingTok.id,
      });
    }

    return r;
  });

  return {
    ok: true as const,
    data: {
      senderName: sender.globalName ?? sender.username,
      responderName: responder.globalName ?? responder.username,
      responseSeconds,
      bonusGranted: withinBonusWindow,
      bonusPoints: withinBonusWindow ? TOK_POINTS.TOKBACK_BONUS : 0,
      streakCount: rel.streakCount,
      streakBonusGranted: rel.streakBonusEligible,
      streakBonus: rel.streakBonusEligible ? TOK_POINTS.STREAK_BONUS : 0,
    },
  };
}
