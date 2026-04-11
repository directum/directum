-- 1. Drop the trigger first (This is the crucial missing step)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Now drop the function using CASCADE to be safe
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Re-create the function with the secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, discord_id, username, discriminator, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'provider_id',
    NEW.raw_user_meta_data ->> 'user_name',
    NEW.raw_user_meta_data ->> 'discriminator',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- 4. Re-attach the trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();