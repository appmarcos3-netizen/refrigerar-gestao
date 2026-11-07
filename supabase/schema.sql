-- Execute este arquivo no SQL Editor do seu projeto Supabase.
create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  address text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  equipment text not null default 'Ar-condicionado Split',
  capacity text,
  service text not null,
  quantity integer not null default 1 check (quantity > 0),
  service_value numeric(12,2) not null default 0,
  materials numeric(12,2) not null default 0,
  travel numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  validity integer not null default 7,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  description text not null,
  type text not null check (type in ('income','expense')),
  amount numeric(12,2) not null check (amount > 0),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;
alter table public.quotes enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "clients own rows" on public.clients;
create policy "clients own rows" on public.clients for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "quotes own rows" on public.quotes;
create policy "quotes own rows" on public.quotes for all to authenticated
using (user_id = auth.uid()) with check (
  user_id = auth.uid() and exists (
    select 1 from public.clients c where c.id = client_id and c.user_id = auth.uid()
  )
);

drop policy if exists "transactions own rows" on public.transactions;
create policy "transactions own rows" on public.transactions for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists quotes_user_id_idx on public.quotes(user_id);
create index if not exists transactions_user_id_idx on public.transactions(user_id);
