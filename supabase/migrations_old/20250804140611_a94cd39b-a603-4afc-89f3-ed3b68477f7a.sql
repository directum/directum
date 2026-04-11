-- Update the UPDATE policy to allow admins to update any bot (for approval/rejection)
-- First, drop the existing policy
DROP POLICY IF EXISTS "Users can update their own bots" ON public.bots;

-- Create a new policy that allows:
-- 1. Bot owners to update their own bots
-- 2. Admins to update any bot (for approval/rejection)
CREATE POLICY "Bot update policy" ON public.bots
FOR UPDATE 
USING (
  -- Users can update their own bots
  (owner_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid()))
  OR
  -- Admins can update any bot for approval/rejection
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.discord_id IN ('1374705890565029988')
  ))
);