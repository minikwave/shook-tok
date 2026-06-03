import { EmbedBuilder } from "discord.js";

export function buildTokSentEmbed(data: {
  senderName: string;
  receiverName: string;
  emotion: string;
  message?: string | null;
  remainingToday: number;
  dailyCap: number;
}) {
  const description = [
    `${data.emotion} **${data.senderName}**님이 **${data.receiverName}**님을 TOK 했습니다.`,
    "",
    data.message ? `“${data.message}”` : null,
    "",
    "**10분 안에 응답하면 둘 다 보너스 TOK Point를 받을 수 있어요.**",
  ]
    .filter(Boolean)
    .join("\n");

  return new EmbedBuilder()
    .setTitle(`${data.emotion} TOK!`)
    .setDescription(description)
    .setFooter({
      text: `오늘 남은 TOK: ${data.remainingToday}/${data.dailyCap}`,
    });
}

export function buildTokBackEmbed(data: {
  senderName: string;
  responderName: string;
  responseSeconds: number;
  bonusGranted: boolean;
  bonusPoints: number;
  streakCount: number;
  streakBonusGranted: boolean;
  streakBonus: number;
}) {
  const minutes = Math.floor(data.responseSeconds / 60);
  const seconds = data.responseSeconds % 60;

  const lines = [
    `**${data.responderName}**님이 **${data.senderName}**님의 TOK에 응답했습니다.`,
    "",
    `응답 시간: ${minutes}분 ${seconds}초`,
    `Streak: ${data.streakCount}일`,
    data.bonusGranted
      ? `보너스: 둘 다 +${data.bonusPoints} TOK Point`
      : "보너스 시간은 지났지만 응답은 기록됐어요.",
  ];
  if (data.streakBonusGranted) {
    lines.push(`스트릭 보너스: 둘 다 +${data.streakBonus} TOK Point`);
  }

  return new EmbedBuilder()
    .setTitle("⚡ TOKBACK!")
    .setDescription(lines.join("\n"));
}

export function buildProfileEmbed(data: {
  displayName: string;
  serverPoints: number;
  sentRolling: number;
  sentCap: number;
  receivedCount: number;
  responseRate: number;
  bestStreak: number;
}) {
  return new EmbedBuilder()
    .setTitle(`${data.displayName}님의 TOK 프로필`)
    .setDescription(
      [
        `서버 TOK Point: **${data.serverPoints}**`,
        `최근 24시간 보낸 TOK: **${data.sentRolling}/${data.sentCap}**`,
        `이 서버에서 받은 TOK: **${data.receivedCount}**`,
        `응답률: **${data.responseRate}%**`,
        `이 서버 최고 Streak: **${data.bestStreak}일**`,
      ].join("\n"),
    );
}

export function buildRankEmbed(
  title: string,
  rows: { rank: number; name: string; points: number }[],
) {
  if (rows.length === 0) {
    return new EmbedBuilder()
      .setTitle(title)
      .setDescription("아직 랭킹에 올릴 만한 기록이 없어요. TOK을 내보세요!");
  }
  const body = rows
    .map((r) => `${r.rank}. **${r.name}** — ${r.points} TOK Point`)
    .join("\n");
  return new EmbedBuilder().setTitle(title).setDescription(body);
}

export function buildHelpEmbed() {
  return new EmbedBuilder()
    .setTitle("TOK 도움말")
    .setDescription(
      [
        "**`/tok`** — 친구에게 TOK을 보냅니다. (유저, 감정, 메시지 선택)",
        "**`/tokback`** — 받은 TOK에 응답합니다. (보낸 사람 지정)",
        "**`/profile`** — 이 서버에서의 TOK 프로필을 봅니다.",
        "**`/rank`** — 서버 TOK Point 랭킹 (오늘/이번 주/전체)",
        "",
        "같은 친구에게는 **1시간에 한 번**, 보내는 TOK은 **24시간에 최대 10회**(신규는 5회)예요.",
        "TOK은 **1시간** 안에 응답하지 않으면 만료돼요.",
      ].join("\n"),
    );
}
