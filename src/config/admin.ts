export const ADMIN_DISCORD_IDS = [
  '1254195552808206429',
  '1264330413820739630',
  '745685458952126474',
  // Add more admin Discord IDs as needed
];

export const isAdminDiscordId = (discordId?: string | null) => {
  return !!discordId && ADMIN_DISCORD_IDS.includes(discordId);
};
