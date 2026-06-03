import type { ChatInputCommandInteraction } from "discord.js";
import {
  getServerRankings,
  type RankPeriod,
} from "../services/rank.service.js";
import { upsertServer } from "../services/server.service.js";
import { buildRankEmbed } from "../ui/embeds.js";
import { deferThenRespond } from "../utils/respond.js";

const periodLabels: Record<RankPeriod, string> = {
  daily: "최근 24시간 TOK Point 랭킹",
  weekly: "이번 주 TOK Point 랭킹",
  all: "전체 TOK Point 랭킹",
};

export async function handleRankCommand(
  interaction: ChatInputCommandInteraction,
) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "랭킹은 서버 안에서만 확인할 수 있어요.",
      ephemeral: true,
    });
  }

  return deferThenRespond(interaction, async () => {
    await upsertServer(interaction.guild!.id, interaction.guild!.name);

    const period = (interaction.options.getString("period") ??
      "daily") as RankPeriod;
    const rows = await getServerRankings(interaction.guild!.id, period);

    if (!rows) {
      return { ok: false, content: "아직 이 서버에 TOK 데이터가 없어요." };
    }

    return {
      ok: true,
      embeds: [
        buildRankEmbed(periodLabels[period] ?? periodLabels.daily, rows),
      ],
    };
  });
}
