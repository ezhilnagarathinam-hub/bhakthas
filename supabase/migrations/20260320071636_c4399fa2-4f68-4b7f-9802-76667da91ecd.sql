-- Clear all demo data from all tables (order matters due to foreign keys)
TRUNCATE TABLE public.challenge_submissions CASCADE;
TRUNCATE TABLE public.challenge_submissions CASCADE;
TRUNCATE TABLE public.darshan_bookings CASCADE;
TRUNCATE TABLE public.temple_visits CASCADE;
TRUNCATE TABLE public.temple_contributions CASCADE;
TRUNCATE TABLE public.favorites CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.user_bhakthi_points CASCADE;
TRUNCATE TABLE public.volunteers CASCADE;
TRUNCATE TABLE public.darshan_packages CASCADE;
TRUNCATE TABLE public.promo_codes CASCADE;
TRUNCATE TABLE public.challenges CASCADE;
TRUNCATE TABLE public.mantras CASCADE;
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.temples CASCADE;