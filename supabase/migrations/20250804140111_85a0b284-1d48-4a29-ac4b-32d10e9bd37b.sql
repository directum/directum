-- Update the RLS policy to allow admins to see all bots (including pending ones)
-- First, drop the existing policy
DROP POLICY IF EXISTS "Approved bots are viewable by everyone" ON public.bots;

-- Create a new policy that allows:
-- 1. Everyone to see approved bots
-- 2. Bot owners to see their own bots (any status)
-- 3. Admins (identified by Discord ID) to see all bots
CREATE POLICY "Bots visibility policy" ON public.bots
FOR SELECT 
USING (
  -- Approved bots are viewable by everyone
  (status = 'approved'::bot_status) 
  OR 
  -- Users can see their own bots regardless of status
  (owner_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid()))
  OR
  -- Admins can see all bots (including pending ones)
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.discord_id IN ('1374705890565029988')
  ))
);