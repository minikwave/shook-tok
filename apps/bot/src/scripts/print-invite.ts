/**
 * Discord 봇 초대 URL을 출력합니다.
 * `.env`의 DISCORD_CLIENT_ID(Application ID)를 사용합니다.
 */
import "../load-env.js";

/** ViewChannel + SendMessages + EmbedLinks + ReadMessageHistory */
const DEFAULT_PERMISSIONS = 1024 + 2048 + 16384 + 65536;

function buildInviteUrl(clientId: string, permissions: number) {
  const params = new URLSearchParams({
    client_id: clientId,
    permissions: String(permissions),
    scope: "bot applications.commands",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

const clientId = process.env.DISCORD_CLIENT_ID?.trim();
const permissions = Number(process.env.DISCORD_INVITE_PERMISSIONS ?? DEFAULT_PERMISSIONS);

if (!clientId) {
  console.error(
    "DISCORD_CLIENT_ID가 .env에 없습니다. Developer Portal → Application → General Information의 Application ID를 넣으세요.",
  );
  process.exit(1);
}

if (!Number.isFinite(permissions) || permissions < 0) {
  console.error("DISCORD_INVITE_PERMISSIONS는 0 이상의 정수여야 합니다.");
  process.exit(1);
}

const url = buildInviteUrl(clientId, permissions);
console.log("아래 링크로 서버에 봇을 추가하세요 (관리 권한이 있는 서버만 선택 가능):\n");
console.log(url);
console.log(
  "\n권한 비트를 바꾸려면 .env에 DISCORD_INVITE_PERMISSIONS=숫자 를 설정하세요.",
);
