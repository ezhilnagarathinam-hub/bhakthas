-- Add quick_info field to temples table for featured temple information
ALTER TABLE public.temples 
ADD COLUMN quick_info text;