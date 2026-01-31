create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  telegram text,
  seats integer not null default 1,
  company text,
  goal text,
  status text not null default 'new',
  notes text,
  assigned_to uuid references public.profiles(id),
  source text,
  last_contacted_at timestamptz
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.leads enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
for select using (auth.uid() = id);

create policy "Profiles are insertable by owner" on public.profiles
for insert with check (auth.uid() = id);

create policy "Profiles are updatable by owner" on public.profiles
for update using (auth.uid() = id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create policy "Anyone can create lead" on public.leads
for insert with check (true);

create policy "Admins can view leads" on public.leads
for select using (public.is_admin());

create policy "Admins can update leads" on public.leads
for update using (public.is_admin()) with check (public.is_admin());
