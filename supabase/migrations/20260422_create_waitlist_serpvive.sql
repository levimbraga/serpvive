-- Waitlist table for SerpVive pre-launch signups.
-- Named with suffix because the shared Supabase project already has a
-- generic `waitlist` table from another project.
create table public.waitlist_serpvive (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text default 'landing',
  created_at timestamptz default now()
);

create index waitlist_serpvive_created_at_idx
  on public.waitlist_serpvive (created_at desc);

-- RLS on, no policies: only the service role (admin client) can read/write.
-- Public API writes via /api/waitlist using getSupabaseAdmin().
alter table public.waitlist_serpvive enable row level security;
