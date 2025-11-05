-- Add deity field to temples table for god/deity filtering
ALTER TABLE public.temples ADD COLUMN IF NOT EXISTS deity TEXT;

-- Add bhaktha_details JSONB column to darshan_bookings to store multiple bhaktha information
ALTER TABLE public.darshan_bookings ADD COLUMN IF NOT EXISTS bhaktha_details JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.darshan_bookings ADD COLUMN IF NOT EXISTS number_of_tickets INTEGER DEFAULT 1;
ALTER TABLE public.darshan_bookings ADD COLUMN IF NOT EXISTS main_bhaktha_index INTEGER DEFAULT 0;