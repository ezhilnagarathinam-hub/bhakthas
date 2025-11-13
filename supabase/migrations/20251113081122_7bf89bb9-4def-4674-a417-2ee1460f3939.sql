-- Add foreign key constraint to temple_contributions table
-- This ensures data integrity and proper cleanup when users are deleted
ALTER TABLE public.temple_contributions 
ADD CONSTRAINT temple_contributions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;