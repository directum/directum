-- Remove all server-related functionality
-- Drop server-related tables in proper order due to foreign key constraints

-- Drop junction tables first
DROP TABLE IF EXISTS public.server_tags CASCADE;
DROP TABLE IF EXISTS public.server_votes CASCADE;

-- Drop the main servers table
DROP TABLE IF EXISTS public.servers CASCADE;

-- Drop Discord OAuth state table since we're removing Discord integration
DROP TABLE IF EXISTS public.discord_auth_state CASCADE;

-- Clean up any orphaned data
-- Note: We're keeping the tags table as it might be used for other purposes