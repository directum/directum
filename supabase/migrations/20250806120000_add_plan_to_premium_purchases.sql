-- Add plan column to premium_purchases so monthly/yearly purchases can be tracked.
ALTER TABLE public.premium_purchases
  ADD COLUMN plan TEXT NOT NULL DEFAULT 'monthly';

-- Optional: set new default currency for future premium purchases to euros
ALTER TABLE public.premium_purchases
  ALTER COLUMN currency SET DEFAULT 'eur';
