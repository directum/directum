-- Create categories table for bot categorization
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories are viewable by everyone
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

-- Create bot_categories junction table
CREATE TABLE public.bot_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bot_id, category_id)
);

-- Enable RLS
ALTER TABLE public.bot_categories ENABLE ROW LEVEL SECURITY;

-- Bot categories are viewable by everyone
CREATE POLICY "Bot categories are viewable by everyone" 
ON public.bot_categories 
FOR SELECT 
USING (true);

-- Bot owners can manage their bot categories
CREATE POLICY "Bot owners can manage their bot categories" 
ON public.bot_categories 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM bots 
  WHERE bots.id = bot_categories.bot_id 
  AND bots.owner_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid())
));

-- Create collections table for user-created bot lists
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Public collections are viewable by everyone, private collections only by owner
CREATE POLICY "Collections visibility policy" 
ON public.collections 
FOR SELECT 
USING (is_public = true OR user_id = auth.uid());

-- Users can create their own collections
CREATE POLICY "Users can create their own collections" 
ON public.collections 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can update their own collections
CREATE POLICY "Users can update their own collections" 
ON public.collections 
FOR UPDATE 
USING (user_id = auth.uid());

-- Users can delete their own collections
CREATE POLICY "Users can delete their own collections" 
ON public.collections 
FOR DELETE 
USING (user_id = auth.uid());

-- Create collection_bots junction table
CREATE TABLE public.collection_bots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, bot_id)
);

-- Enable RLS
ALTER TABLE public.collection_bots ENABLE ROW LEVEL SECURITY;

-- Collection bots are viewable based on collection visibility
CREATE POLICY "Collection bots visibility policy" 
ON public.collection_bots 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM collections 
  WHERE collections.id = collection_bots.collection_id 
  AND (collections.is_public = true OR collections.user_id = auth.uid())
));

-- Collection owners can manage their collection bots
CREATE POLICY "Collection owners can manage their collection bots" 
ON public.collection_bots 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM collections 
  WHERE collections.id = collection_bots.collection_id 
  AND collections.user_id = auth.uid()
));

-- Create user_follows table for user following system
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Users can view follows
CREATE POLICY "Users can view follows" 
ON public.user_follows 
FOR SELECT 
USING (true);

-- Users can create their own follows
CREATE POLICY "Users can create their own follows" 
ON public.user_follows 
FOR INSERT 
WITH CHECK (follower_id = auth.uid());

-- Users can delete their own follows
CREATE POLICY "Users can delete their own follows" 
ON public.user_follows 
FOR DELETE 
USING (follower_id = auth.uid());

-- Create activities table for activity feeds
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  related_bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,
  related_collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Activities are viewable by everyone for public activities
CREATE POLICY "Activities are viewable by everyone" 
ON public.activities 
FOR SELECT 
USING (true);

-- System can insert activities
CREATE POLICY "System can insert activities" 
ON public.activities 
FOR INSERT 
WITH CHECK (true);

-- Add additional fields to bots table for advanced filtering
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS server_count INTEGER;
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS permissions TEXT[];
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE;

-- Create trigger for collections updated_at
CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, description, icon, color) VALUES
('Utility', 'Helpful tools and productivity bots', 'Settings', '#6366f1'),
('Moderation', 'Server management and moderation bots', 'Shield', '#ef4444'),
('Music', 'Music and audio entertainment bots', 'Music', '#8b5cf6'),
('Gaming', 'Gaming-related bots and integrations', 'Gamepad2', '#f59e0b'),
('Fun', 'Entertainment and fun bots', 'Smile', '#ec4899'),
('Economy', 'Virtual economy and currency bots', 'Coins', '#10b981'),
('Social', 'Social features and community bots', 'Users', '#06b6d4'),
('Information', 'News, weather, and information bots', 'Info', '#64748b');