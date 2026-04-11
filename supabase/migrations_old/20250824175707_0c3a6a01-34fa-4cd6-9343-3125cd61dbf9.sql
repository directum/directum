-- Allow admins to delete any bot
CREATE POLICY "Admins can delete any bot" 
ON public.bots 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.discord_id = ANY (ARRAY['1374705890565029988'::text, '1230645006440595614'::text])
  )
);