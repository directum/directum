-- Create votes table to track user votes with timestamps
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bot_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, bot_id)
);

-- Enable Row Level Security
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create policies for votes
CREATE POLICY "Users can view their own votes" 
ON public.votes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own votes" 
ON public.votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance on vote lookups
CREATE INDEX idx_votes_user_bot ON public.votes(user_id, bot_id);
CREATE INDEX idx_votes_created_at ON public.votes(created_at);