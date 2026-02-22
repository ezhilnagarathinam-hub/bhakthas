-- Create table to record admin reports against user accounts
create table if not exists public.user_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  reported_by uuid not null,
  image_id uuid,
  reason text,
  reported_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by uuid
);

create index if not exists idx_user_reports_user on public.user_reports(user_id);
create index if not exists idx_user_reports_reported_by on public.user_reports(reported_by);
