import type { ChatInputCommandInteraction } from "discord.js";
import { tokBack } from "../services/tok.service.js";
import { buildTokBackEmbed } from "../ui/embeds.js";
import { deferThenRespond } from "../utils/respond.js";

export async function handleTokBackCommand(
  interaction: ChatInputCommandInteraction,
) {
  const sender = interaction.options.getUser("user", true);

  if (!interaction.guild) {
    return interaction.reply({
      content: "TOKBACK은 서버 안에서만 사용할 수 있어요.",
      ephemeral: true,
    });
  }

  return deferThenRespond(interaction, async () => {
    const result = await tokBack({
      guildId: interaction.guild!.id,
      responder: interaction.user,
      sender,
    });

    if (!result.ok) {
      return { ok: false, content: result.message };
    }
    return { ok: true, embeds: [buildTokBackEmbed(result.data)] };
  });
}
