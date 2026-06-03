import {
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import "./load-env.js";

const commands = [
  new SlashCommandBuilder()
    .setName("tok")
    .setDescription("친구에게 TOK을 보냅니다.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("TOK을 받을 유저")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("emotion")
        .setDescription("감정 태그")
        .setRequired(false)
        .addChoices(
          { name: "🔥 생각남", value: "🔥" },
          { name: "👀 뭐함", value: "👀" },
          { name: "🫠 심심함", value: "🫠" },
          { name: "⚡ 빨리 와", value: "⚡" },
          { name: "💀 죽었냐", value: "💀" },
          { name: "☕ 커피", value: "☕" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("짧은 메시지 (최대 200자)")
        .setRequired(false)
        .setMaxLength(200),
    ),

  new SlashCommandBuilder()
    .setName("tokback")
    .setDescription("받은 TOK에 응답합니다.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("TOK을 보낸 유저")
        .setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("TOK 프로필을 확인합니다.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("조회할 유저")
        .setRequired(false),
    ),

  new SlashCommandBuilder()
    .setName("rank")
    .setDescription("서버 TOK 랭킹을 확인합니다.")
    .addStringOption((option) =>
      option
        .setName("period")
        .setDescription("랭킹 기간")
        .setRequired(false)
        .addChoices(
          { name: "오늘", value: "daily" },
          { name: "이번 주", value: "weekly" },
          { name: "전체", value: "all" },
        ),
    ),

  new SlashCommandBuilder()
    .setName("tokhelp")
    .setDescription("TOK 사용법을 확인합니다."),
].map((command) => command.toJSON());

async function registerCommands() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!token || !clientId) {
    throw new Error("DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID가 필요합니다.");
  }

  const rest = new REST({ version: "10" }).setToken(token);

  const guildId = process.env.DISCORD_GUILD_ID?.trim();
  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log(`슬래시 명령어 등록 완료 (길드 단위, 즉시 반영): ${guildId}`);
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log("슬래시 명령어 등록 완료 (전역, 반영까지 최대 ~1시간)");
  }
}

void registerCommands().catch((err) => {
  console.error(err);
  process.exit(1);
});
