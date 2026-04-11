-- First, let's check if the foreign key exists and fix the servers table relationship
DO $$
BEGIN
    -- Drop the existing foreign key if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'servers_owner_id_fkey' 
        AND table_name = 'servers'
    ) THEN
        ALTER TABLE public.servers DROP CONSTRAINT servers_owner_id_fkey;
    END IF;
    
    -- Add the correct foreign key constraint
    ALTER TABLE public.servers 
    ADD CONSTRAINT servers_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

-- Update the RLS policies to ensure they work correctly
DROP POLICY IF EXISTS "Servers visibility policy" ON public.servers;
CREATE POLICY "Servers visibility policy" 
ON public.servers 
FOR SELECT 
USING (
  status = 'approved' OR 
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.discord_id = '1374705890565029988'
  )
);