-- Add webhook_url column to bots table for vote notifications
ALTER TABLE public.bots 
ADD COLUMN webhook_url text;