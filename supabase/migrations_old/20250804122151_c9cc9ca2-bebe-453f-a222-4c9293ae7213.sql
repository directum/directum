-- Add UPDATE policy for votes table to allow upsert operations
CREATE POLICY "Users can update their own votes" 
ON public.votes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add DELETE policy for votes table to allow cleanup
CREATE POLICY "Users can delete their own votes" 
ON public.votes 
FOR DELETE 
USING (auth.uid() = user_id);