-- Update existing bots to use proper Discord avatar URLs
UPDATE public.bots 
SET avatar_url = CONCAT('https://cdn.discordapp.com/app-icons/', client_id, '/icon.png')
WHERE avatar_url = 'https://cdn.discordapp.com/embed/avatars/0.png' 
   OR avatar_url IS NULL 
   OR avatar_url LIKE '%embed/avatars%';