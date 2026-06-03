import type { ChatInputCommandInteraction } from "discord.js";
import { sendTok } from "../services/tok.service.js";
import { buildTokSentEmbed } from "../ui/embeds.js";
import { deferThenRespond } from "../utils/respond.js";

export async function handleTokCommand(
  interaction: ChatInputCommandInteraction,
) {
  const receiver = interaction.options.getUser("user", true);
  const emotion = interaction.options.getString("emotion") ?? "🔥";
  const message = interaction.options.getString("message");

  if (!interaction.guild) {
    return interaction.reply({
      content: "TOK은 서버 안에서만 사용할 수 있어요.",
      ephemeral: true,
    });
  }

  return deferThenRespond(interaction, async () => {
    const result = await sendTok({
      guildId: interaction.guild!.id,
      guildName: interaction.guild!.name,
      sender: interaction.user,
      receiver,
      emotion,
      message,
    });

    if (!result.ok) {
      return { ok: false, content: result.message };
    }
    return { ok: true, embeds: [buildTokSentEmbed(result.data)] };
  });
}
