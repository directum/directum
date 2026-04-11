-- Fix the handle_new_user function to handle cases where Discord username might be null
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, discord_id, username, discriminator, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'provider_id',
    COALESCE(
      NEW.raw_user_meta_data ->> 'user_name', 
      NEW.raw_user_meta_data ->> 'name', 
      NEW.raw_user_meta_data ->> 'full_name',
      'Unknown User'
    ),
    NEW.raw_user_meta_data ->> 'discriminator',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$function$;