-- Esquema da base de dados (Supabase / Postgres)
-- Corre isto UMA vez no SQL Editor do Supabase (copia tudo e clica em "Run").

create extension if not exists pgcrypto;

-- Utilizadores (login por nome + palavra-passe; sem email)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Jogos do Mundial (id = id do jogo na football-data.org)
create table if not exists matches (
  id bigint primary key,
  stage text,
  grp text,
  matchday int,
  kickoff_utc timestamptz not null,
  home_name text,
  home_code text,
  home_crest text,
  away_name text,
  away_code text,
  away_crest text,
  home_score int,
  away_score int,
  status text not null default 'scheduled',
  updated_at timestamptz not null default now()
);

-- Palpites (um por utilizador e por jogo)
create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  match_id bigint not null references matches(id) on delete cascade,
  pred_home int not null,
  pred_away int not null,
  points int,
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create index if not exists idx_pred_match on predictions(match_id);
create index if not exists idx_pred_user on predictions(user_id);
create index if not exists idx_matches_kickoff on matches(kickoff_utc);

-- Seguranca: ligar RLS sem politicas publicas. A aplicacao acede sempre pelo
-- servidor com a SERVICE ROLE KEY (que ignora o RLS), por isso o acesso anonimo
-- fica totalmente bloqueado.
alter table users enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;
