-- Create a table to store Discord OAuth state and tokens
CREATE TABLE IF NOT EXISTS public.discord_auth_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  state_token TEXT NOT NULL UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discord_auth_state ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own Discord auth state" 
ON public.discord_auth_state 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_discord_auth_state_updated_at
BEFORE UPDATE ON public.discord_auth_state
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();