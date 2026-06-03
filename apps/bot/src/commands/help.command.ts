import type { ChatInputCommandInteraction } from "discord.js";
import { buildHelpEmbed } from "../ui/embeds.js";

export async function handleHelpCommand(
  interaction: ChatInputCommandInteraction,
) {
  return interaction.reply({ embeds: [buildHelpEmbed()], ephemeral: true });
}
