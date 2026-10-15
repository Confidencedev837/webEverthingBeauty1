-- Social graph for agent profile tabs (Followers / Following / Liked)
-- Run once in the Supabase SQL editor.

create table if not exists public.agent_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  agent_id    uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, agent_id),
  check (follower_id <> agent_id)
);

create table if not exists public.service_likes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, service_id)
);

alter table public.agent_follows enable row level security;
alter table public.service_likes enable row level security;

create policy "follows readable by all" on public.agent_follows for select using (true);
create policy "users follow as themselves" on public.agent_follows for insert with check (auth.uid() = follower_id);
create policy "users unfollow as themselves" on public.agent_follows for delete using (auth.uid() = follower_id);

create policy "likes readable by all" on public.service_likes for select using (true);
create policy "users like as themselves" on public.service_likes for insert with check (auth.uid() = user_id);
create policy "users unlike as themselves" on public.service_likes for delete using (auth.uid() = user_id);
