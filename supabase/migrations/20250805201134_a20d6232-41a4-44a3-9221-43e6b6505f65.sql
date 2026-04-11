-- Update RLS policies to include both admin Discord IDs

-- Update bots table policies
DROP POLICY IF EXISTS "Bots visibility policy" ON public.bots;
CREATE POLICY "Bots visibility policy" ON public.bots
FOR SELECT 
USING (
  -- Approved bots are viewable by everyone
  (status = 'approved'::bot_status) 
  OR
  -- Bot owners can see their own bots regardless of status
  (owner_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid()))
  OR
  -- Admins can see all bots (including pending ones)
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.discord_id IN ('1374705890565029988', '1230645006440595614')
  ))
);

DROP POLICY IF EXISTS "Bot update policy" ON public.bots;
CREATE POLICY "Bot update policy" ON public.bots
FOR UPDATE 
USING (
  -- Bot owners can update their own bots
  (owner_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid()))
  OR
  -- Admins can update any bot for approval/rejection
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.discord_id IN ('1374705890565029988', '1230645006440595614')
  ))
);

-- Safely update servers table policies ONLY if the table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'servers') THEN
        DROP POLICY IF EXISTS "Servers visibility policy" ON public.servers;
        CREATE POLICY "Servers visibility policy" 
        ON public.servers 
        FOR SELECT 
        USING (
          status = 'approved' OR 
          owner_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid()) OR
          EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.discord_id IN ('1374705890565029988', '1230645006440595614'))
        );

        DROP POLICY IF EXISTS "Server update policy" ON public.servers;
        CREATE POLICY "Server update policy" 
        ON public.servers 
        FOR UPDATE 
        USING (
          owner_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid()) OR
          EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.discord_id IN ('1374705890565029988', '1230645006440595614'))
        );
    END IF;
END $$;