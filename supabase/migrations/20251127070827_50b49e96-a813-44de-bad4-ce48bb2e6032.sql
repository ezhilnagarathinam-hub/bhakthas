-- Add video_url field to temples table
ALTER TABLE public.temples
ADD COLUMN video_url TEXT;

COMMENT ON COLUMN public.temples.video_url IS 'YouTube video URL for the temple';