-- Knowledge Share: Supabase/Postgres proposal for Mobile Search + Map scale
-- Date: 2026-03-09
-- Notes:
-- 1) Keep existing tables (users, contexts, context_reviews, articles, interactions, transactions).
-- 2) Add spatial/search/reputation layers for Open World + Private World product rules.

-- Required extensions
create extension if not exists pg_trgm;
create extension if not exists postgis;
create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- 1) Spatial optimization on contexts (PLACE)
-- ---------------------------------------------------------------------------

alter table contexts
  add column if not exists geog geography(point, 4326);

update contexts
set geog = st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
where type = 'PLACE' and latitude is not null and longitude is not null;

create index if not exists idx_contexts_geog on contexts using gist (geog);
create index if not exists idx_contexts_type_category on contexts (type, category);
create index if not exists idx_contexts_review_rank on contexts (is_reviewed desc, avg_rating desc, updated_at desc);

-- Keep geog in sync
create or replace function sync_context_geog()
returns trigger as $$
begin
  if new.type = 'PLACE' and new.latitude is not null and new.longitude is not null then
    new.geog := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  else
    new.geog := null;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_context_geog on contexts;
create trigger trg_sync_context_geog
before insert or update of latitude, longitude, type
on contexts
for each row
execute function sync_context_geog();

-- ---------------------------------------------------------------------------
-- 2) Stay detection ingestion (foreground/background events)
-- ---------------------------------------------------------------------------

create table if not exists place_stay_events (
  id bigserial primary key,
  user_id int not null references users(id) on delete cascade,
  context_id int references contexts(id) on delete set null,
  latitude double precision not null,
  longitude double precision not null,
  arrived_at timestamptz not null,
  left_at timestamptz,
  dwell_seconds int generated always as (
    case
      when left_at is null then null
      else extract(epoch from (left_at - arrived_at))::int
    end
  ) stored,
  confidence real not null default 0.5,
  source text not null default 'mobile',
  created_at timestamptz not null default now()
);

create index if not exists idx_place_stay_user_time on place_stay_events (user_id, created_at desc);
create index if not exists idx_place_stay_context_time on place_stay_events (context_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 3) Review contribution drafts + deposit policy
-- ---------------------------------------------------------------------------

create type if not exists review_visibility as enum ('PUBLIC', 'PRIVATE', 'PREMIUM');
create type if not exists contribution_status as enum ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED');

create table if not exists place_review_contributions (
  id bigserial primary key,
  user_id int not null references users(id) on delete cascade,
  context_id int not null references contexts(id) on delete cascade,
  visibility review_visibility not null default 'PRIVATE',
  status contribution_status not null default 'DRAFT',
  content text not null,
  word_count int not null,
  is_premium boolean not null default false,
  required_deposit_u int not null default 0,
  deposit_tx_id bigint,
  moderation_notes text,
  published_review_id int references context_reviews(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_review_contrib_user on place_review_contributions (user_id, created_at desc);
create index if not exists idx_review_contrib_context on place_review_contributions (context_id, created_at desc);
create index if not exists idx_review_contrib_status on place_review_contributions (status, visibility);

create table if not exists place_deposits (
  id bigserial primary key,
  user_id int not null references users(id) on delete cascade,
  context_id int not null references contexts(id) on delete cascade,
  contribution_id bigint references place_review_contributions(id) on delete set null,
  token text not null check (token in ('KNOW_U')),
  amount int not null check (amount > 0),
  status text not null default 'LOCKED' check (status in ('LOCKED', 'RELEASED', 'FORFEITED', 'REFUNDED')),
  reason text,
  created_at timestamptz not null default now(),
  released_at timestamptz
);

create index if not exists idx_place_deposit_user on place_deposits (user_id, created_at desc);
create index if not exists idx_place_deposit_context on place_deposits (context_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 4) Open world snapshot -> private world import
-- ---------------------------------------------------------------------------

create type if not exists world_snapshot_scope as enum ('FULL', 'REGION');

create table if not exists private_world_snapshots (
  id bigserial primary key,
  user_id int not null references users(id) on delete cascade,
  scope world_snapshot_scope not null,
  region_bbox text,
  source_version text,
  item_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists private_world_snapshot_items (
  snapshot_id bigint not null references private_world_snapshots(id) on delete cascade,
  context_id int not null references contexts(id) on delete cascade,
  copied_at timestamptz not null default now(),
  primary key (snapshot_id, context_id)
);

create index if not exists idx_snapshot_user on private_world_snapshots (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 5) Reputation metrics for premium eligibility
-- ---------------------------------------------------------------------------

create table if not exists user_reputation_metrics (
  user_id int primary key references users(id) on delete cascade,
  upvote_count bigint not null default 0,
  downvote_count bigint not null default 0,
  public_review_count bigint not null default 0,
  public_review_avg_rating real not null default 0,
  premium_eligible boolean not null default false,
  updated_at timestamptz not null default now()
);

create or replace function refresh_user_reputation_metrics(target_user_id int)
returns void as $$
declare
  v_up bigint;
  v_down bigint;
  v_public_count bigint;
  v_public_avg real;
begin
  select
    coalesce(sum(case when v.type = 'UP' then 1 else 0 end), 0),
    coalesce(sum(case when v.type = 'DOWN' then 1 else 0 end), 0)
  into v_up, v_down
  from votes v
  join articles a on a.id = v.article_id
  where a.author_id = target_user_id;

  select
    count(*),
    coalesce(avg(cr.stars), 0)::real
  into v_public_count, v_public_avg
  from context_reviews cr
  where cr.user_id = target_user_id
    and cr.status = 'PUBLISHED';

  insert into user_reputation_metrics (
    user_id, upvote_count, downvote_count, public_review_count, public_review_avg_rating, premium_eligible, updated_at
  )
  values (
    target_user_id,
    v_up,
    v_down,
    v_public_count,
    v_public_avg,
    (v_up >= 1000 and (case when v_up = 0 then 1 else v_down::numeric / v_up end) <= 0.05 and v_public_avg >= 4.5),
    now()
  )
  on conflict (user_id)
  do update set
    upvote_count = excluded.upvote_count,
    downvote_count = excluded.downvote_count,
    public_review_count = excluded.public_review_count,
    public_review_avg_rating = excluded.public_review_avg_rating,
    premium_eligible = excluded.premium_eligible,
    updated_at = now();
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- 6) Unified search document index (ready for NLP phase)
-- ---------------------------------------------------------------------------

create table if not exists search_documents (
  id bigserial primary key,
  entity_type text not null check (entity_type in ('PLACE', 'ARTICLE', 'TOPIC', 'USER')),
  entity_id bigint not null,
  title text not null,
  subtitle text,
  body text not null default '',
  visibility text not null default 'PUBLIC' check (visibility in ('PUBLIC', 'PRIVATE', 'PREMIUM')),
  popularity_score real not null default 0,
  freshness_score real not null default 0,
  geog geography(point, 4326),
  tsv tsvector,
  embedding vector(1536),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id)
);

create index if not exists idx_search_docs_tsv on search_documents using gin (tsv);
create index if not exists idx_search_docs_title_trgm on search_documents using gin (title gin_trgm_ops);
create index if not exists idx_search_docs_geog on search_documents using gist (geog);
create index if not exists idx_search_docs_popularity on search_documents (popularity_score desc);
-- Optional (enable when vector volume is high):
-- create index idx_search_docs_embedding on search_documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create or replace function search_documents_tsv_sync()
returns trigger as $$
begin
  new.tsv := to_tsvector('simple', coalesce(new.title, '') || ' ' || coalesce(new.subtitle, '') || ' ' || coalesce(new.body, ''));
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_search_docs_tsv_sync on search_documents;
create trigger trg_search_docs_tsv_sync
before insert or update of title, subtitle, body
on search_documents
for each row
execute function search_documents_tsv_sync();

-- ---------------------------------------------------------------------------
-- 7) Guard function: validate public review publish rule
-- ---------------------------------------------------------------------------

create or replace function validate_public_review_rule(
  p_word_count int,
  p_visibility review_visibility,
  p_deposit_amount int
)
returns boolean as $$
begin
  if p_visibility = 'PUBLIC' and p_word_count < 100 and coalesce(p_deposit_amount, 0) <= 0 then
    return false;
  end if;
  return true;
end;
$$ language plpgsql;

-- End of proposal
