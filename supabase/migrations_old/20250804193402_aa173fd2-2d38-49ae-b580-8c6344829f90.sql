-- Fix the foreign key relationship for servers
ALTER TABLE public.servers 
ADD CONSTRAINT servers_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create server-specific tags (different from bot tags)
INSERT INTO public.tags (name, color) VALUES
('Community', '#FF6B6B'),
('Gaming', '#4ECDC4'),
('Music', '#45B7D1'),
('Art', '#96CEB4'),
('Learning', '#FFEAA7'),
('Tech', '#DDA0DD'),
('Anime', '#FFB6C1'),
('Social', '#98D8C8'),
('Roleplay', '#F7DC6F'),
('Business', '#BB8FCE'),
('Streaming', '#85C1E9'),
('Sports', '#82E0AA'),
('Coding', '#F8C471'),
('Memes', '#EC7063'),
('Support', '#A9DFBF')
ON CONFLICT (name) DO NOTHING;