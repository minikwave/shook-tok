import type {
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

/**
 * 공개 defer 후 성공은 editReply, 실패는 thinking 제거 + ephemeral followUp.
 */
export async function deferThenRespond(
  interaction: ChatInputCommandInteraction,
  run: () => Promise<
    | { ok: true; embeds: EmbedBuilder[] }
    | { ok: false; content: string }
  >,
) {
  await interaction.deferReply();
  try {
    const out = await run();
    if (out.ok) {
      return interaction.editReply({ embeds: out.embeds });
    }
    await interaction.deleteReply().catch(() => undefined);
    return interaction.followUp({ content: out.content, ephemeral: true });
  } catch (e) {
    console.error(e);
    await interaction.deleteReply().catch(() => undefined);
    return interaction.followUp({
      content: "처리 중 오류가 났어요. 잠시 후 다시 시도해주세요.",
      ephemeral: true,
    });
  }
}
