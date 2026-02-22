-- Create table to track user uploaded images
create table if not exists public.user_images (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  temple_id uuid,
  bucket text not null,
  path text not null,
  url text,
  filename text,
  uploaded_at timestamptz default now()
);

create index if not exists idx_user_images_user on public.user_images(user_id);
create index if not exists idx_user_images_temple on public.user_images(temple_id);
