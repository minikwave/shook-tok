import type { ChatInputCommandInteraction } from "discord.js";
import { getProfileForGuild } from "../services/profile.service.js";
import { upsertDiscordUser } from "../services/user.service.js";
import { upsertServer } from "../services/server.service.js";
import { buildProfileEmbed } from "../ui/embeds.js";
import { deferThenRespond } from "../utils/respond.js";

export async function handleProfileCommand(
  interaction: ChatInputCommandInteraction,
) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "프로필은 서버 안에서만 확인할 수 있어요.",
      ephemeral: true,
    });
  }

  return deferThenRespond(interaction, async () => {
    await upsertServer(interaction.guild!.id, interaction.guild!.name);
    const target = interaction.options.getUser("user") ?? interaction.user;
    await upsertDiscordUser(target);

    const profile = await getProfileForGuild(interaction.guild!.id, target.id);
    if (!profile) {
      return {
        ok: false,
        content:
          "아직 이 서버에서 TOK 기록이 없어요. `/tok`으로 먼저 TOK을 내보세요.",
      };
    }

    return { ok: true, embeds: [buildProfileEmbed(profile)] };
  });
}
