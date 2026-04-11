-- Fix the security issue by setting search_path
CREATE OR REPLACE FUNCTION refresh_bot_avatar(bot_client_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    result TEXT;
BEGIN
    -- This function will be called by an edge function that fetches the real avatar from Discord
    -- For now, just return a placeholder
    RETURN 'pending_refresh';
END;
$$;