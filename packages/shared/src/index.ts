export const TOK_LIMITS = {
  SAME_RECEIVER_COOLDOWN_MINUTES: 60,
  DAILY_INITIATED_TOK_LIMIT: 10,
  NEW_USER_DAILY_LIMIT: 5,
  RESPONSE_BONUS_WINDOW_MINUTES: 10,
  TOK_EXPIRE_MINUTES: 60,
  /** `/tok` message 옵션 최대 길이 (Discord 슬래시 옵션과 맞춤) */
  MAX_TOK_MESSAGE_CHARS: 200,
} as const;

export const TOK_POINTS = {
  SENT: 1,
  RECEIVED: 1,
  TOKBACK_BONUS: 5,
  STREAK_BONUS: 2,
} as const;

export const DEFAULT_EMOTIONS = [
  { key: "fire", emoji: "🔥", label: "생각남" },
  { key: "eyes", emoji: "👀", label: "뭐함" },
  { key: "melt", emoji: "🫠", label: "심심함" },
  { key: "zap", emoji: "⚡", label: "빨리 와" },
  { key: "skull", emoji: "💀", label: "죽었냐" },
  { key: "coffee", emoji: "☕", label: "커피" },
] as const;
