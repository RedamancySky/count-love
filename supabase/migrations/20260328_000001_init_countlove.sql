-- Count Love initial schema for Supabase
-- Run in Supabase SQL Editor or via supabase migration tooling.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  nickname text,
  birth_date date,
  bio text,
  avatar_url text,
  onboarding_step int not null default 1,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid not null references public.profiles(id) on delete cascade,
  user2_id uuid references public.profiles(id) on delete set null,
  start_date date,
  couple_code varchar(6) not null unique,
  theme_name text not null default 'rose',
  couple_title text,
  status text not null default 'PENDING' check (status in ('PENDING', 'ACTIVE', 'PAUSED')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user1_id),
  unique(user2_id)
);

create table if not exists public.couple_settings (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null unique references public.couples(id) on delete cascade,
  allow_diary_read boolean not null default true,
  notify_days int[] not null default array[1, 7],
  language text not null default 'vi',
  timezone text not null default 'Asia/Ho_Chi_Minh',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null,
  description text,
  cover_image text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.albums(id) on delete set null,
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  public_id text not null,
  type text not null check (type in ('IMAGE', 'VIDEO', 'AUDIO')),
  caption text,
  taken_at timestamptz,
  location text,
  latitude double precision,
  longitude double precision,
  width int,
  height int,
  duration int,
  size int,
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  content text not null,
  mood text check (mood in ('HAPPY', 'LOVED', 'EXCITED', 'CALM', 'NOSTALGIC', 'SAD', 'MISSING', 'GRATEFUL', 'ROMANTIC', 'SILLY')),
  weather text,
  is_private boolean not null default false,
  is_shared boolean not null default true,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diary_media (
  diary_id uuid not null references public.diary_entries(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete cascade,
  primary key(diary_id, media_id)
);

create table if not exists public.diary_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  diary_id uuid not null references public.diary_entries(id) on delete cascade
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  type text not null default 'TEXT' check (type in ('TEXT', 'IMAGE', 'VIDEO', 'STICKER', 'LOVE_LETTER', 'AUDIO', 'LOCATION', 'TIME_CAPSULE')),
  media_url text,
  is_read boolean not null default false,
  read_at timestamptz,
  reply_to_id uuid references public.messages(id) on delete set null,
  scheduled_at timestamptz,
  sent_at timestamptz,
  is_time_capsule boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  unique(message_id, user_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null,
  description text,
  type text not null check (type in ('ANNIVERSARY', 'BIRTHDAY', 'DATE', 'TRAVEL', 'MILESTONE', 'OTHER')),
  date timestamptz not null,
  end_date timestamptz,
  is_recurring boolean not null default false,
  recurring_rule text,
  color text,
  reminder_days int[] not null default array[1],
  cover_image text,
  location text,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  send_at timestamptz not null,
  is_sent boolean not null default false,
  sent_at timestamptz
);

create table if not exists public.bucket_items (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null,
  description text,
  category text not null check (category in ('TRAVEL', 'FOOD', 'EXPERIENCE', 'FAMILY', 'ADVENTURE', 'LEARNING', 'ROMANTIC', 'OTHER')),
  target_date date,
  is_completed boolean not null default false,
  completed_at timestamptz,
  completed_note text,
  cover_image text,
  priority int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  icon_url text not null,
  condition jsonb not null,
  points int not null default 10
);

create table if not exists public.couple_achievements (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique(couple_id, achievement_id)
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  type text not null check (type in ('DAILY_30', 'WEEKLY', 'CUSTOM')),
  title text not null,
  description text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'COMPLETED', 'ABANDONED')),
  tasks jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_type text not null,
  score int not null,
  metadata jsonb,
  played_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('MESSAGE', 'ANNIVERSARY', 'BIRTHDAY', 'ACHIEVEMENT', 'DIARY_SHARED', 'CHALLENGE', 'TIME_CAPSULE', 'SYSTEM')),
  title text not null,
  body text not null,
  data jsonb,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_couple_user1 on public.couples(user1_id);
create index if not exists idx_couple_user2 on public.couples(user2_id);
create index if not exists idx_messages_couple_created on public.messages(couple_id, created_at desc);
create index if not exists idx_diary_author_date on public.diary_entries(author_id, date desc);
create index if not exists idx_media_album on public.media(album_id, created_at desc);
create index if not exists idx_events_couple_date on public.events(couple_id, date asc);
create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read, created_at desc);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_couples_updated_at on public.couples;
create trigger trg_couples_updated_at
before update on public.couples
for each row execute function public.set_updated_at();

drop trigger if exists trg_couple_settings_updated_at on public.couple_settings;
create trigger trg_couple_settings_updated_at
before update on public.couple_settings
for each row execute function public.set_updated_at();

drop trigger if exists trg_albums_updated_at on public.albums;
create trigger trg_albums_updated_at
before update on public.albums
for each row execute function public.set_updated_at();

drop trigger if exists trg_diary_entries_updated_at on public.diary_entries;
create trigger trg_diary_entries_updated_at
before update on public.diary_entries
for each row execute function public.set_updated_at();

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists trg_bucket_items_updated_at on public.bucket_items;
create trigger trg_bucket_items_updated_at
before update on public.bucket_items
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do update set full_name = excluded.full_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.couples enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "couples_select_member" on public.couples;
create policy "couples_select_member"
on public.couples
for select
using (auth.uid() = user1_id or auth.uid() = user2_id);

drop policy if exists "couples_insert_owner" on public.couples;
create policy "couples_insert_owner"
on public.couples
for insert
with check (auth.uid() = user1_id);

drop policy if exists "couples_update_member" on public.couples;
create policy "couples_update_member"
on public.couples
for update
using (auth.uid() = user1_id or auth.uid() = user2_id)
with check (auth.uid() = user1_id or auth.uid() = user2_id);
