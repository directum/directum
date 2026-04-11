-- Create servers table for Discord servers
CREATE TABLE public.servers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  server_id TEXT NOT NULL UNIQUE, -- Discord server ID
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  invite_url TEXT NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  votes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;

-- Create policies for servers
CREATE POLICY "Servers visibility policy" 
ON public.servers 
FOR SELECT 
USING (
  status = 'approved' OR 
  owner_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.discord_id = '1374705890565029988')
);

CREATE POLICY "Users can insert their own servers" 
ON public.servers 
FOR INSERT 
WITH CHECK (owner_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Server update policy" 
ON public.servers 
FOR UPDATE 
USING (
  owner_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.discord_id = '1374705890565029988')
);

CREATE POLICY "Users can delete their own servers" 
ON public.servers 
FOR DELETE 
USING (owner_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid()));

-- Create server_tags table for server categorization
CREATE TABLE public.server_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id UUID NOT NULL,
  tag_id UUID NOT NULL
);

-- Enable RLS for server_tags
ALTER TABLE public.server_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for server_tags
CREATE POLICY "Server tags are viewable by everyone" 
ON public.server_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Server owners can manage their server tags" 
ON public.server_tags 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM servers 
    WHERE servers.id = server_tags.server_id 
    AND servers.owner_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid())
  )
);

-- Create server_votes table
CREATE TABLE public.server_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  server_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, server_id)
);

-- Enable RLS for server_votes
ALTER TABLE public.server_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for server_votes
CREATE POLICY "Users can view their own server votes" 
ON public.server_votes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own server votes" 
ON public.server_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own server votes" 
ON public.server_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own server votes" 
ON public.server_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on servers
CREATE TRIGGER update_servers_updated_at
  BEFORE UPDATE ON public.servers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();