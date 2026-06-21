-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)
-- Safe to re-run in full: every statement below is idempotent.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- shops (shared reference data, not per-user)
-- ─────────────────────────────────────────────

create table if not exists shops (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  website text not null,
  contact_url text,
  phone text,
  mail text,
  account_fresh boolean not null default false,
  notes text,
  shipping_delivery text[] not null default '{}',
  shipping_return text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists shop_methods (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  vouches int not null default 0,
  fails int not null default 0,
  avg_delay int,
  max_amount numeric not null default 0
);

-- ─────────────────────────────────────────────
-- orders (private per-user)
-- ─────────────────────────────────────────────

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shop_slug text,
  order_number text not null default '',
  carrier text not null default '',
  tracking_number text not null default '',
  items int not null default 1,
  amount numeric not null default 0,
  payment_date date,
  status text not null default 'En attente',
  return_status text not null default 'waiting',
  tech text,
  note text,
  frozen_delay int,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on orders(user_id);

-- shop_slug has no FK: orders can reference shop names not yet in `shops`
-- (this also retroactively removes the constraint if it was created by an older
-- version of this file run against this database)
alter table orders drop constraint if exists orders_shop_slug_fkey;

-- ─────────────────────────────────────────────
-- profiles (username login: maps a username to its auth email)
-- ─────────────────────────────────────────────

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text not null,
  created_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_-]{3,20}$')
);

-- populates `profiles` automatically from the `username` passed in
-- auth.signUp's options.data, regardless of email-confirmation timing
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (new.id, new.raw_user_meta_data->>'username', new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────

alter table shops enable row level security;
alter table shop_methods enable row level security;
alter table orders enable row level security;
alter table profiles enable row level security;

drop policy if exists "shops readable by authenticated users" on shops;
create policy "shops readable by authenticated users"
  on shops for select
  to authenticated
  using (true);

-- shared catalog: any logged-in user can fill in missing shop info
-- (carrier, phone, notes...), there's no admin/owner concept here
drop policy if exists "shops: authenticated update" on shops;
create policy "shops: authenticated update"
  on shops for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "shop_methods readable by authenticated users" on shop_methods;
create policy "shop_methods readable by authenticated users"
  on shop_methods for select
  to authenticated
  using (true);

drop policy if exists "orders: owner select" on orders;
create policy "orders: owner select"
  on orders for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "orders: owner insert" on orders;
create policy "orders: owner insert"
  on orders for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "orders: owner update" on orders;
create policy "orders: owner update"
  on orders for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "orders: owner delete" on orders;
create policy "orders: owner delete"
  on orders for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "profiles: owner select" on profiles;
create policy "profiles: owner select"
  on profiles for select
  to authenticated
  using (id = auth.uid());
