-- Allow admins to delete any bot
CREATE POLICY "Admins can delete any bot" 
ON public.bots 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.discord_id = ANY (ARRAY['1254195552808206429'::text])
  )
);