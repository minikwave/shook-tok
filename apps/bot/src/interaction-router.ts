import type { Interaction } from "discord.js";
import { handleTokCommand } from "./commands/tok.command.js";
import { handleTokBackCommand } from "./commands/tokback.command.js";
import { handleProfileCommand } from "./commands/profile.command.js";
import { handleRankCommand } from "./commands/rank.command.js";
import { handleHelpCommand } from "./commands/help.command.js";

export async function handleInteraction(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  try {
    switch (interaction.commandName) {
      case "tok":
        return await handleTokCommand(interaction);
      case "tokback":
        return await handleTokBackCommand(interaction);
      case "profile":
        return await handleProfileCommand(interaction);
      case "rank":
        return await handleRankCommand(interaction);
      case "tokhelp":
        return await handleHelpCommand(interaction);
      default:
        return interaction.reply({
          content: "알 수 없는 명령어입니다.",
          ephemeral: true,
        });
    }
  } catch (error) {
    console.error(error);
    const payload = {
      content: "처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.",
      ephemeral: true as const,
    };
    if (interaction.replied || interaction.deferred) {
      return interaction.followUp(payload);
    }
    return interaction.reply(payload);
  }
}
