-- Create premium_purchases table to track premium listing purchases
CREATE TABLE public.premium_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bot_id UUID NOT NULL,
  stripe_session_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  featured_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.premium_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own purchases" 
ON public.premium_purchases 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert purchases" 
ON public.premium_purchases 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update purchases" 
ON public.premium_purchases 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_premium_purchases_updated_at
BEFORE UPDATE ON public.premium_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();