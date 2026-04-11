-- Create enum for bot status
CREATE TYPE bot_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table for Discord users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  discriminator TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create predefined tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bots table
CREATE TABLE public.bots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  invite_url TEXT NOT NULL,
  support_server_url TEXT,
  status bot_status NOT NULL DEFAULT 'pending',
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot_tags junction table
CREATE TABLE public.bot_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(bot_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for tags (read-only for users)
CREATE POLICY "Tags are viewable by everyone" 
ON public.tags FOR SELECT USING (true);

-- RLS Policies for bots
CREATE POLICY "Approved bots are viewable by everyone" 
ON public.bots FOR SELECT USING (status = 'approved' OR owner_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own bots" 
ON public.bots FOR INSERT WITH CHECK (owner_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own bots" 
ON public.bots FOR UPDATE USING (owner_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own bots" 
ON public.bots FOR DELETE USING (owner_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for bot_tags
CREATE POLICY "Bot tags are viewable by everyone" 
ON public.bot_tags FOR SELECT USING (true);

CREATE POLICY "Bot owners can manage their bot tags" 
ON public.bot_tags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.bots 
    WHERE bots.id = bot_tags.bot_id 
    AND bots.owner_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
  )
);

-- Insert predefined tags
INSERT INTO public.tags (name, color) VALUES
('Music', '#FF6B6B'),
('Moderation', '#4ECDC4'),
('Utility', '#45B7D1'),
('Fun', '#96CEB4'),
('Gaming', '#FECA57'),
('Economy', '#FF9FF3'),
('Social', '#54A0FF'),
('Automation', '#5F27CD'),
('Logging', '#00D2D3'),
('Administration', '#FF6348'),
('Entertainment', '#2ED573'),
('Productivity', '#FFA502'),
('Community', '#3742FA'),
('Bot Lists', '#F8B500'),
('Educational', '#A4B0BE');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bots_updated_at
  BEFORE UPDATE ON public.bots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();