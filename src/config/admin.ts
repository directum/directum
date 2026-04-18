export const ADMIN_DISCORD_IDS = [
  '1254195552808206429',
  // Add more admin Discord IDs as needed
];

export const isAdminDiscordId = (discordId?: string | null) => {
  return !!discordId && ADMIN_DISCORD_IDS.includes(discordId);
};
