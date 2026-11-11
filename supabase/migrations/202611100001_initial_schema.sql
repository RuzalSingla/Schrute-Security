create extension if not exists pgcrypto;
create table if not exists public.data_sources (
  id uuid primary key default gen_random_uuid(), name text not null unique,
  source_type text not null check (source_type in ('incident','indicator')),
  source_url text not null, enabled boolean not null default false,
  last_successful_sync timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(), external_id text not null,
  source_id uuid not null references public.data_sources(id), title text not null,
  description text not null default '', category text not null check (category in ('Ransomware','Phishing','Data breach','Malware','DDoS')),
  affected_country char(2), affected_region text, occurred_at timestamptz, published_at timestamptz not null,
  source_url text not null, verification_status text not null default 'unverified',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(source_id,external_id)
);
create table if not exists public.threat_indicators (
  id uuid primary key default gen_random_uuid(), external_id text not null,
  source_id uuid not null references public.data_sources(id), indicator_type text not null,
  indicator_value text not null, confidence_score smallint check(confidence_score between 0 and 100),
  observed_country char(2), observed_region text, first_seen timestamptz, last_seen timestamptz,
  indicator_metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), unique(source_id,external_id)
);
create table if not exists public.ingestion_logs (
  id uuid primary key default gen_random_uuid(), source_id uuid references public.data_sources(id),
  status text not null check(status in ('started','success','partial','failed')),
  records_received integer not null default 0, records_inserted integer not null default 0,
  records_updated integer not null default 0, records_skipped integer not null default 0,
  error_message text, started_at timestamptz not null default now(), completed_at timestamptz
);
create index if not exists incidents_category_idx on public.incidents(category);
create index if not exists incidents_country_idx on public.incidents(affected_country);
create index if not exists incidents_published_idx on public.incidents(published_at desc);
create index if not exists incidents_occurred_idx on public.incidents(occurred_at desc);
create index if not exists indicators_type_idx on public.threat_indicators(indicator_type);
create index if not exists indicators_source_idx on public.threat_indicators(source_id);
alter table public.data_sources enable row level security;
alter table public.incidents enable row level security;
alter table public.threat_indicators enable row level security;
alter table public.ingestion_logs enable row level security;
create policy "Public may read enabled sources" on public.data_sources for select using(enabled);
create policy "Public may read reported incidents" on public.incidents for select using(true);
create policy "Public may read technical indicators" on public.threat_indicators for select using(true);
-- Ingestion writes use the server-only service role; no public write policies are created.
