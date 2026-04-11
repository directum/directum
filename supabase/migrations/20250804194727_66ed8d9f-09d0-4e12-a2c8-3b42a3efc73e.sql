-- Add missing foreign key constraints for server_tags table
DO $$
BEGIN
    -- Add foreign key from server_tags to servers table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'server_tags_server_id_fkey' 
        AND table_name = 'server_tags'
    ) THEN
        ALTER TABLE public.server_tags 
        ADD CONSTRAINT server_tags_server_id_fkey 
        FOREIGN KEY (server_id) REFERENCES public.servers(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key from server_tags to tags table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'server_tags_tag_id_fkey' 
        AND table_name = 'server_tags'
    ) THEN
        ALTER TABLE public.server_tags 
        ADD CONSTRAINT server_tags_tag_id_fkey 
        FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;
    END IF;
END $$;