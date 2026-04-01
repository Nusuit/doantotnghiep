-- Search + Map mobile optimization layer for Supabase
-- Run AFTER the canonical Prisma migrations have created the base tables.
-- Expected base tables:
--   users, user_profiles, categories, articles, contexts,
--   article_contexts, context_reviews, interactions, votes

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists unaccent;
create extension if not exists postgis;
create extension if not exists vector;

alter table public.contexts
  add column if not exists geog geography(Point, 4326),
  add column if not exists canonical_name text,
  add column if not exists city_name text,
  add column if not exists district_name text,
  add column if not exists ward_name text,
  add column if not exists source_priority smallint not null default 50;

alter table public.articles
  add column if not exists summary text,
  add column if not exists language_code text not null default 'vi',
  add column if not exists normalized_title text,
  add column if not exists content_sha256 text,
  add column if not exists quality_score double precision not null default 0.50,
  add column if not exists evidence_score double precision not null default 0.00,
  add column if not exists uniqueness_score double precision not null default 1.00;

update public.contexts
set geog = st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
where latitude is not null
  and longitude is not null
  and geog is null;

update public.contexts
set city_name = coalesce(city_name, 'Ho Chi Minh City')
where type = 'place'
  and latitude between 10.30 and 11.20
  and longitude between 106.30 and 107.15;

update public.articles
set normalized_title = lower(unaccent(trim(regexp_replace(coalesce(title, ''), '\s+', ' ', 'g'))))
where normalized_title is null;

update public.articles
set content_sha256 = encode(digest(coalesce(content, ''), 'sha256'), 'hex')
where content_sha256 is null;

update public.articles
set summary = left(regexp_replace(coalesce(content, ''), '\s+', ' ', 'g'), 320)
where summary is null or btrim(summary) = '';

create or replace function public.normalize_search_text(p_input text)
returns text
language sql
immutable
as $$
  select lower(unaccent(trim(regexp_replace(coalesce(p_input, ''), '\s+', ' ', 'g'))));
$$;

create or replace function public.sync_context_geo_and_canonical()
returns trigger
language plpgsql
as $$
begin
  new.canonical_name := public.normalize_search_text(new.name);

  if new.latitude is not null and new.longitude is not null then
    new.geog := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  else
    new.geog := null;
  end if;

  if new.city_name is null
     and new.latitude is not null
     and new.longitude is not null
     and new.latitude between 10.30 and 11.20
     and new.longitude between 106.30 and 107.15 then
    new.city_name := 'Ho Chi Minh City';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_context_geo_and_canonical on public.contexts;
create trigger trg_sync_context_geo_and_canonical
before insert or update of name, latitude, longitude, city_name
on public.contexts
for each row
execute function public.sync_context_geo_and_canonical();

create or replace function public.prepare_article_search_fields()
returns trigger
language plpgsql
as $$
begin
  new.normalized_title := public.normalize_search_text(new.title);
  new.content_sha256 := encode(digest(coalesce(new.content, ''), 'sha256'), 'hex');

  if new.summary is null or btrim(new.summary) = '' then
    new.summary := left(regexp_replace(coalesce(new.content, ''), '\s+', ' ', 'g'), 320);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prepare_article_search_fields on public.articles;
create trigger trg_prepare_article_search_fields
before insert or update of title, content, summary
on public.articles
for each row
execute function public.prepare_article_search_fields();

create index if not exists idx_contexts_geog on public.contexts using gist (geog);
create index if not exists idx_contexts_city_name on public.contexts (city_name);
create index if not exists idx_contexts_district_name on public.contexts (district_name);
create index if not exists idx_contexts_canonical_name_trgm on public.contexts using gin (canonical_name gin_trgm_ops);
create index if not exists idx_articles_normalized_title_trgm on public.articles using gin (normalized_title gin_trgm_ops);
create index if not exists idx_articles_content_sha256 on public.articles (content_sha256);

create table if not exists public.knowledge_sources (
  id bigserial primary key,
  source_key text not null unique,
  name text not null,
  source_type text not null default 'reference'
    check (source_type in ('official', 'publisher', 'journal', 'news', 'community', 'reference', 'user_generated')),
  domain text,
  authority_score double precision not null default 0.40
    check (authority_score >= 0 and authority_score <= 1),
  is_verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.article_source_links (
  article_id integer not null references public.articles(id) on delete cascade,
  source_id bigint not null references public.knowledge_sources(id) on delete cascade,
  citation_url text,
  evidence_type text not null default 'citation'
    check (evidence_type in ('citation', 'manual_review', 'publisher_page', 'doi', 'government_reference')),
  confidence_score double precision not null default 0.60
    check (confidence_score >= 0 and confidence_score <= 1),
  created_at timestamptz not null default now(),
  primary key (article_id, source_id)
);

create table if not exists public.search_documents (
  id bigserial primary key,
  entity_type text not null check (entity_type in ('ARTICLE', 'USER', 'PLACE')),
  entity_id bigint not null,
  title text not null,
  subtitle text,
  body text not null default '',
  tags text[] not null default array[]::text[],
  visibility text not null default 'PUBLIC' check (visibility in ('PUBLIC', 'PRIVATE', 'PREMIUM')),
  language_code text not null default 'vi',
  city_name text,
  district_name text,
  geog geography(Point, 4326),
  author_id integer,
  quality_score double precision not null default 0.0 check (quality_score >= 0 and quality_score <= 1),
  authority_score double precision not null default 0.0 check (authority_score >= 0 and authority_score <= 1),
  eeat_score double precision not null default 0.0 check (eeat_score >= 0 and eeat_score <= 1),
  popularity_score double precision not null default 0.0 check (popularity_score >= 0 and popularity_score <= 1),
  freshness_score double precision not null default 0.0 check (freshness_score >= 0 and freshness_score <= 1),
  uniqueness_score double precision not null default 0.0 check (uniqueness_score >= 0 and uniqueness_score <= 1),
  tsv tsvector,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id)
);

create index if not exists idx_search_documents_type on public.search_documents (entity_type);
create index if not exists idx_search_documents_updated_at on public.search_documents (updated_at desc);
create index if not exists idx_search_documents_eeat on public.search_documents (eeat_score desc);
create index if not exists idx_search_documents_popularity on public.search_documents (popularity_score desc);
create index if not exists idx_search_documents_title_trgm on public.search_documents using gin (title gin_trgm_ops);
create index if not exists idx_search_documents_tsv on public.search_documents using gin (tsv);
create index if not exists idx_search_documents_geog on public.search_documents using gist (geog);

create table if not exists public.search_feedback_events (
  id bigserial primary key,
  session_id uuid not null default gen_random_uuid(),
  user_id integer references public.users(id) on delete set null,
  query_text text not null,
  entity_type text not null check (entity_type in ('ARTICLE', 'USER', 'PLACE')),
  entity_id bigint not null,
  position integer,
  event_type text not null
    check (event_type in ('impression', 'click', 'long_click', 'save', 'open', 'hide', 'report', 'route_start', 'revisit_7d')),
  dwell_ms integer,
  policy_arm text,
  reward_hint double precision,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_search_feedback_events_user on public.search_feedback_events (user_id, created_at desc);
create index if not exists idx_search_feedback_events_query on public.search_feedback_events using gin (to_tsvector('simple', coalesce(query_text, '')));
create index if not exists idx_search_feedback_events_entity on public.search_feedback_events (entity_type, entity_id, created_at desc);

create table if not exists public.map_visit_events (
  id bigserial primary key,
  user_id integer references public.users(id) on delete set null,
  context_id integer references public.contexts(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  arrived_at timestamptz not null,
  left_at timestamptz,
  dwell_seconds integer generated always as (
    case
      when left_at is null then null
      else extract(epoch from (left_at - arrived_at))::integer
    end
  ) stored,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_map_visit_events_user on public.map_visit_events (user_id, created_at desc);
create index if not exists idx_map_visit_events_context on public.map_visit_events (context_id, created_at desc);

create or replace function public.prepare_search_document()
returns trigger
language plpgsql
as $$
begin
  new.tsv :=
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.subtitle, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.body, '')), 'C') ||
    setweight(to_tsvector('simple', array_to_string(coalesce(new.tags, array[]::text[]), ' ')), 'B');
  return new;
end;
$$;

drop trigger if exists trg_prepare_search_document on public.search_documents;
create trigger trg_prepare_search_document
before insert or update of title, subtitle, body, tags
on public.search_documents
for each row
execute function public.prepare_search_document();

create or replace function public.recalculate_context_review_stats(p_context_id integer)
returns void
language plpgsql
as $$
begin
  update public.contexts c
  set review_count = agg.review_count,
      avg_rating = agg.avg_rating,
      is_reviewed = agg.review_count > 0,
      updated_at = now()
  from (
    select
      cr.context_id,
      count(*) filter (where cr.status = 'published')::integer as review_count,
      coalesce(avg(cr.stars) filter (where cr.status = 'published'), 0)::double precision as avg_rating
    from public.context_reviews cr
    where cr.context_id = p_context_id
    group by cr.context_id
  ) agg
  where c.id = agg.context_id;

  update public.contexts
  set review_count = 0,
      avg_rating = 0,
      is_reviewed = false,
      updated_at = now()
  where id = p_context_id
    and not exists (
      select 1
      from public.context_reviews
      where context_id = p_context_id
        and status = 'published'
    );
end;
$$;

create or replace view public.article_exact_duplicates as
select
  content_sha256,
  count(*) as article_count,
  array_agg(id order by id) as article_ids
from public.articles
where content_sha256 is not null
group by content_sha256
having count(*) > 1;

create or replace function public.refresh_article_search_document(p_article_id integer)
returns void
language sql
as $$
with source_stats as (
  select
    asl.article_id,
    coalesce(avg(ks.authority_score), 0.35) as authority_score,
    count(*)::integer as source_count
  from public.article_source_links asl
  join public.knowledge_sources ks on ks.id = asl.source_id
  where asl.article_id = p_article_id
  group by asl.article_id
),
primary_context as (
  select
    ac.article_id,
    c.id as context_id,
    c.category as context_category,
    c.city_name,
    c.district_name,
    c.geog
  from public.article_contexts ac
  join public.contexts c on c.id = ac.context_id
  where ac.article_id = p_article_id
  order by case when c.type = 'place' then 0 else 1 end, c.review_count desc, c.updated_at desc
  limit 1
),
dup_stats as (
  select
    content_sha256,
    count(*)::integer as dup_count
  from public.articles
  where content_sha256 is not null
  group by content_sha256
),
article_base as (
  select
    a.id,
    a.author_id,
    a.title,
    coalesce(a.summary, left(regexp_replace(coalesce(a.content, ''), '\s+', ' ', 'g'), 320)) as summary,
    coalesce(a.content, '') as body,
    coalesce(up.display_name, u.email, 'Unknown author') as author_name,
    coalesce(cat.name, 'Knowledge') as category_name,
    pc.context_id,
    pc.city_name,
    pc.district_name,
    pc.geog,
    array_remove(array[cat.slug, pc.context_category, pc.city_name], null) as tags,
    least(1.0, greatest(0.0,
      (coalesce(a.upvote_count, 0)::double precision * 1.20 +
       coalesce(a.save_count, 0)::double precision * 1.50 +
       coalesce(a.view_count, 0)::double precision * 0.02) / 150.0
    )) as popularity_score,
    greatest(0.0, 1.0 - (extract(epoch from (now() - a.created_at)) / 86400.0) / 180.0) as freshness_score,
    least(1.0, greatest(0.0, coalesce(a.quality_score, 0.50))) as quality_score,
    least(1.0, greatest(0.0, coalesce(a.evidence_score, 0.00))) as evidence_score,
    least(1.0, greatest(0.05,
      case
        when ds.dup_count is null or ds.dup_count <= 1 then coalesce(a.uniqueness_score, 1.00)
        else 1.0 / ds.dup_count
      end
    )) as uniqueness_score,
    least(1.0, greatest(0.0, coalesce(ss.authority_score, 0.35))) as authority_score,
    jsonb_build_object(
      'entity', 'article',
      'article_id', a.id,
      'author_id', a.author_id,
      'category_id', a.category_id,
      'source_count', coalesce(ss.source_count, 0),
      'context_id', pc.context_id
    ) as metadata
  from public.articles a
  join public.users u on u.id = a.author_id
  left join public.user_profiles up on up.user_id = u.id
  left join public.categories cat on cat.id = a.category_id
  left join source_stats ss on ss.article_id = a.id
  left join primary_context pc on pc.article_id = a.id
  left join dup_stats ds on ds.content_sha256 = a.content_sha256
  where a.id = p_article_id
)
insert into public.search_documents (
  entity_type,
  entity_id,
  title,
  subtitle,
  body,
  tags,
  visibility,
  language_code,
  city_name,
  district_name,
  geog,
  author_id,
  quality_score,
  authority_score,
  eeat_score,
  popularity_score,
  freshness_score,
  uniqueness_score,
  metadata,
  created_at,
  updated_at
)
select
  'ARTICLE',
  ab.id,
  ab.title,
  ab.author_name || ' - ' || ab.category_name,
  ab.body,
  ab.tags,
  'PUBLIC',
  'vi',
  ab.city_name,
  ab.district_name,
  ab.geog,
  ab.author_id,
  ab.quality_score,
  ab.authority_score,
  least(1.0, greatest(0.0,
    ab.quality_score * 0.35 +
    ab.authority_score * 0.30 +
    ab.evidence_score * 0.20 +
    ab.uniqueness_score * 0.15
  )),
  ab.popularity_score,
  ab.freshness_score,
  ab.uniqueness_score,
  ab.metadata,
  now(),
  now()
from article_base ab
on conflict (entity_type, entity_id)
do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  body = excluded.body,
  tags = excluded.tags,
  visibility = excluded.visibility,
  language_code = excluded.language_code,
  city_name = excluded.city_name,
  district_name = excluded.district_name,
  geog = excluded.geog,
  author_id = excluded.author_id,
  quality_score = excluded.quality_score,
  authority_score = excluded.authority_score,
  eeat_score = excluded.eeat_score,
  popularity_score = excluded.popularity_score,
  freshness_score = excluded.freshness_score,
  uniqueness_score = excluded.uniqueness_score,
  metadata = excluded.metadata,
  updated_at = now();
$$;

create or replace function public.refresh_user_search_document(p_user_id integer)
returns void
language sql
as $$
with author_stats as (
  select
    u.id as user_id,
    count(a.id)::integer as article_count,
    coalesce(sum(a.upvote_count), 0)::double precision as total_upvotes,
    coalesce(sum(a.save_count), 0)::double precision as total_saves,
    coalesce(max(a.updated_at), u.updated_at, u.created_at) as last_activity_at,
    coalesce(string_agg(a.title, ' ' order by a.created_at desc), '') as article_titles
  from public.users u
  left join public.articles a on a.author_id = u.id and a.status = 'PUBLISHED'
  where u.id = p_user_id
  group by u.id, u.updated_at, u.created_at
)
insert into public.search_documents (
  entity_type,
  entity_id,
  title,
  subtitle,
  body,
  tags,
  visibility,
  language_code,
  city_name,
  district_name,
  geog,
  author_id,
  quality_score,
  authority_score,
  eeat_score,
  popularity_score,
  freshness_score,
  uniqueness_score,
  metadata,
  created_at,
  updated_at
)
select
  'USER',
  u.id,
  coalesce(up.display_name, u.email, 'User ' || u.id::text) as title,
  coalesce(u.role::text, 'user') || ' - articles: ' || coalesce(ast.article_count, 0)::text as subtitle,
  concat_ws(' ', coalesce(up.bio, ''), coalesce(ast.article_titles, '')) as body,
  array_remove(array[coalesce(up.city, null), coalesce(up.country, null), coalesce(u.role::text, null)], null) as tags,
  'PUBLIC',
  'vi',
  up.city,
  null,
  null,
  u.id,
  least(1.0, greatest(0.0,
    (coalesce(u.ks_score, 0)::double precision / 5000.0) +
    least(coalesce(u.trust_level, 1), 5)::double precision * 0.08
  )) as quality_score,
  least(1.0, greatest(0.0,
    (coalesce(u.ks_score, 0)::double precision / 8000.0) +
    least(coalesce(u.trust_level, 1), 5)::double precision * 0.10
  )) as authority_score,
  least(1.0, greatest(0.0,
    ((coalesce(u.ks_score, 0)::double precision / 8000.0) * 0.45) +
    (least(coalesce(u.trust_level, 1), 5)::double precision * 0.08 * 0.35) +
    (least(coalesce(ast.article_count, 0), 20)::double precision / 20.0 * 0.20)
  )) as eeat_score,
  least(1.0, greatest(0.0,
    (coalesce(ast.total_upvotes, 0) * 1.20 + coalesce(ast.total_saves, 0) * 1.60 + coalesce(ast.article_count, 0) * 2.00) / 200.0
  )) as popularity_score,
  greatest(0.0, 1.0 - (extract(epoch from (now() - coalesce(ast.last_activity_at, u.updated_at, u.created_at))) / 86400.0) / 365.0) as freshness_score,
  1.0,
  jsonb_build_object(
    'entity', 'user',
    'user_id', u.id,
    'article_count', coalesce(ast.article_count, 0),
    'ks_score', coalesce(u.ks_score, 0),
    'trust_level', coalesce(u.trust_level, 1)
  ) as metadata,
  now(),
  now()
from public.users u
left join public.user_profiles up on up.user_id = u.id
left join author_stats ast on ast.user_id = u.id
where u.id = p_user_id
on conflict (entity_type, entity_id)
do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  body = excluded.body,
  tags = excluded.tags,
  visibility = excluded.visibility,
  language_code = excluded.language_code,
  city_name = excluded.city_name,
  district_name = excluded.district_name,
  geog = excluded.geog,
  author_id = excluded.author_id,
  quality_score = excluded.quality_score,
  authority_score = excluded.authority_score,
  eeat_score = excluded.eeat_score,
  popularity_score = excluded.popularity_score,
  freshness_score = excluded.freshness_score,
  uniqueness_score = excluded.uniqueness_score,
  metadata = excluded.metadata,
  updated_at = now();
$$;

create or replace function public.refresh_context_search_document(p_context_id integer)
returns void
language sql
as $$
with review_excerpt as (
  select
    cr.context_id,
    string_agg(left(coalesce(cr.comment, ''), 180), ' ' order by cr.updated_at desc) as review_body
  from public.context_reviews cr
  where cr.context_id = p_context_id
    and cr.status = 'published'
  group by cr.context_id
)
insert into public.search_documents (
  entity_type,
  entity_id,
  title,
  subtitle,
  body,
  tags,
  visibility,
  language_code,
  city_name,
  district_name,
  geog,
  author_id,
  quality_score,
  authority_score,
  eeat_score,
  popularity_score,
  freshness_score,
  uniqueness_score,
  metadata,
  created_at,
  updated_at
)
select
  'PLACE',
  c.id,
  c.name,
  concat_ws(' - ', coalesce(c.category, 'place'), coalesce(c.district_name, c.city_name), coalesce(c.address, '')) as subtitle,
  concat_ws(' ', coalesce(c.description, ''), coalesce(c.address, ''), coalesce(rev.review_body, '')) as body,
  array_remove(array[c.category, c.city_name, c.district_name], null) as tags,
  'PUBLIC',
  'vi',
  c.city_name,
  c.district_name,
  c.geog,
  null,
  least(1.0, greatest(0.0,
    ((coalesce(c.avg_rating, 0) / 5.0) * 0.70) +
    (least(coalesce(c.review_count, 0), 100)::double precision / 100.0 * 0.30)
  )) as quality_score,
  least(1.0, greatest(0.0,
    0.30 +
    ((100 - least(coalesce(c.source_priority, 50), 100))::double precision / 100.0 * 0.20) +
    case when coalesce(c.source, '') = 'osm' then 0.10 else 0.00 end
  )) as authority_score,
  least(1.0, greatest(0.0,
    (((coalesce(c.avg_rating, 0) / 5.0) * 0.70) +
     (least(coalesce(c.review_count, 0), 100)::double precision / 100.0 * 0.30)) * 0.55 +
    (0.30 +
     ((100 - least(coalesce(c.source_priority, 50), 100))::double precision / 100.0 * 0.20) +
     case when coalesce(c.source, '') = 'osm' then 0.10 else 0.00 end) * 0.25 +
    0.20
  )) as eeat_score,
  least(1.0, greatest(0.0,
    ((coalesce(c.avg_rating, 0) / 5.0) * 0.40) +
    (least(coalesce(c.review_count, 0), 150)::double precision / 150.0 * 0.60)
  )) as popularity_score,
  greatest(0.0, 1.0 - (extract(epoch from (now() - c.updated_at)) / 86400.0) / 365.0) as freshness_score,
  0.90,
  jsonb_build_object(
    'entity', 'place',
    'context_id', c.id,
    'source', c.source,
    'source_ref', c.source_ref,
    'review_count', c.review_count,
    'avg_rating', c.avg_rating
  ) as metadata,
  now(),
  now()
from public.contexts c
left join review_excerpt rev on rev.context_id = c.id
where c.id = p_context_id
  and c.type = 'place'
on conflict (entity_type, entity_id)
do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  body = excluded.body,
  tags = excluded.tags,
  visibility = excluded.visibility,
  language_code = excluded.language_code,
  city_name = excluded.city_name,
  district_name = excluded.district_name,
  geog = excluded.geog,
  author_id = excluded.author_id,
  quality_score = excluded.quality_score,
  authority_score = excluded.authority_score,
  eeat_score = excluded.eeat_score,
  popularity_score = excluded.popularity_score,
  freshness_score = excluded.freshness_score,
  uniqueness_score = excluded.uniqueness_score,
  metadata = excluded.metadata,
  updated_at = now();
$$;

create or replace function public.trg_refresh_article_search_document()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_article_search_document(new.id);
  perform public.refresh_user_search_document(new.author_id);
  return new;
end;
$$;

create or replace function public.trg_delete_article_search_document()
returns trigger
language plpgsql
as $$
begin
  delete from public.search_documents
  where entity_type = 'ARTICLE'
    and entity_id = old.id;

  perform public.refresh_user_search_document(old.author_id);
  return old;
end;
$$;

drop trigger if exists trg_refresh_article_search_document on public.articles;
create trigger trg_refresh_article_search_document
after insert or update
on public.articles
for each row
execute function public.trg_refresh_article_search_document();

drop trigger if exists trg_delete_article_search_document on public.articles;
create trigger trg_delete_article_search_document
after delete
on public.articles
for each row
execute function public.trg_delete_article_search_document();

create or replace function public.trg_refresh_user_search_document_from_users()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_user_search_document(new.id);
  return new;
end;
$$;

create or replace function public.trg_delete_user_search_document()
returns trigger
language plpgsql
as $$
begin
  delete from public.search_documents
  where entity_type = 'USER'
    and entity_id = old.id;
  return old;
end;
$$;

drop trigger if exists trg_refresh_user_search_document_users on public.users;
create trigger trg_refresh_user_search_document_users
after insert or update
on public.users
for each row
execute function public.trg_refresh_user_search_document_from_users();

create or replace function public.trg_refresh_user_search_document_from_profiles()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_user_search_document(new.user_id);
  return new;
end;
$$;

drop trigger if exists trg_refresh_user_search_document_profiles on public.user_profiles;
create trigger trg_refresh_user_search_document_profiles
after insert or update
on public.user_profiles
for each row
execute function public.trg_refresh_user_search_document_from_profiles();

drop trigger if exists trg_delete_user_search_document on public.users;
create trigger trg_delete_user_search_document
after delete
on public.users
for each row
execute function public.trg_delete_user_search_document();

create or replace function public.trg_refresh_context_search_document()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_context_search_document(new.id);
  return new;
end;
$$;

create or replace function public.trg_delete_context_search_document()
returns trigger
language plpgsql
as $$
begin
  delete from public.search_documents
  where entity_type = 'PLACE'
    and entity_id = old.id;
  return old;
end;
$$;

drop trigger if exists trg_refresh_context_search_document on public.contexts;
create trigger trg_refresh_context_search_document
after insert or update
on public.contexts
for each row
execute function public.trg_refresh_context_search_document();

drop trigger if exists trg_delete_context_search_document on public.contexts;
create trigger trg_delete_context_search_document
after delete
on public.contexts
for each row
execute function public.trg_delete_context_search_document();

create or replace function public.trg_refresh_context_search_document_from_review()
returns trigger
language plpgsql
as $$
declare
  v_context_id integer;
begin
  if tg_op = 'DELETE' then
    v_context_id := old.context_id;
  else
    v_context_id := new.context_id;
  end if;

  perform public.recalculate_context_review_stats(v_context_id);
  perform public.refresh_context_search_document(v_context_id);

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_refresh_context_search_document_from_review on public.context_reviews;
create trigger trg_refresh_context_search_document_from_review
after insert or update or delete
on public.context_reviews
for each row
execute function public.trg_refresh_context_search_document_from_review();

create or replace function public.trg_refresh_article_from_article_context()
returns trigger
language plpgsql
as $$
declare
  v_article_id integer;
begin
  if tg_op = 'DELETE' then
    v_article_id := old.article_id;
  else
    v_article_id := new.article_id;
  end if;

  perform public.refresh_article_search_document(v_article_id);

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_refresh_article_from_article_context on public.article_contexts;
create trigger trg_refresh_article_from_article_context
after insert or update or delete
on public.article_contexts
for each row
execute function public.trg_refresh_article_from_article_context();

create or replace function public.trg_refresh_article_from_source_link()
returns trigger
language plpgsql
as $$
declare
  v_article_id integer;
begin
  if tg_op = 'DELETE' then
    v_article_id := old.article_id;
  else
    v_article_id := new.article_id;
  end if;

  perform public.refresh_article_search_document(v_article_id);

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_refresh_article_from_source_link on public.article_source_links;
create trigger trg_refresh_article_from_source_link
after insert or update or delete
on public.article_source_links
for each row
execute function public.trg_refresh_article_from_source_link();

create or replace function public.refresh_all_search_documents()
returns void
language plpgsql
as $$
declare
  v_article_id integer;
  v_user_id integer;
  v_context_id integer;
begin
  for v_article_id in select id from public.articles loop
    perform public.refresh_article_search_document(v_article_id);
  end loop;

  for v_user_id in select id from public.users loop
    perform public.refresh_user_search_document(v_user_id);
  end loop;

  for v_context_id in select id from public.contexts where type = 'place' loop
    perform public.refresh_context_search_document(v_context_id);
  end loop;
end;
$$;

create or replace function public.search_suggest_v1(
  p_q text,
  p_limit integer default 10,
  p_entity_types text[] default array['ARTICLE', 'USER', 'PLACE']
)
returns table (
  entity_type text,
  entity_id bigint,
  title text,
  subtitle text,
  city_name text,
  score double precision
)
language sql
stable
as $$
with params as (
  select
    nullif(public.normalize_search_text(p_q), '') as q,
    greatest(1, least(coalesce(p_limit, 10), 20)) as max_rows
),
query_data as (
  select
    q,
    case when q is null then null else websearch_to_tsquery('simple', q) end as tsq,
    max_rows
  from params
),
candidates as (
  select
    sd.entity_type,
    sd.entity_id,
    sd.title,
    sd.subtitle,
    sd.city_name,
    greatest(
      similarity(public.normalize_search_text(sd.title), qd.q),
      similarity(public.normalize_search_text(coalesce(sd.subtitle, '')), qd.q) * 0.70,
      coalesce(ts_rank_cd(sd.tsv, qd.tsq), 0)
    ) as lexical_score,
    sd.eeat_score,
    sd.popularity_score,
    case sd.entity_type
      when 'ARTICLE' then 1.15
      when 'USER' then 1.05
      else 0.75
    end as entity_boost
  from public.search_documents sd
  cross join query_data qd
  where qd.q is not null
    and sd.entity_type = any(p_entity_types)
    and (
      sd.tsv @@ qd.tsq or
      public.normalize_search_text(sd.title) % qd.q or
      public.normalize_search_text(coalesce(sd.subtitle, '')) % qd.q
    )
)
select
  c.entity_type,
  c.entity_id,
  c.title,
  c.subtitle,
  c.city_name,
  round((c.entity_boost * (
    c.lexical_score * 0.70 +
    c.eeat_score * 0.20 +
    c.popularity_score * 0.10
  ))::numeric, 6)::double precision as score
from candidates c
order by score desc, c.entity_type, c.entity_id
limit (select max_rows from params);
$$;

create or replace function public.search_full_v1(
  p_q text,
  p_limit integer default 20,
  p_offset integer default 0,
  p_entity_types text[] default array['ARTICLE', 'USER', 'PLACE'],
  p_city_name text default null,
  p_lat double precision default null,
  p_lng double precision default null,
  p_query_embedding vector(1536) default null
)
returns table (
  entity_type text,
  entity_id bigint,
  title text,
  subtitle text,
  city_name text,
  district_name text,
  metadata jsonb,
  score double precision
)
language sql
stable
as $$
with params as (
  select
    nullif(public.normalize_search_text(p_q), '') as q,
    greatest(1, least(coalesce(p_limit, 20), 50)) as max_rows,
    greatest(0, coalesce(p_offset, 0)) as start_row
),
query_data as (
  select
    q,
    case when q is null then null else websearch_to_tsquery('simple', q) end as tsq,
    max_rows,
    start_row
  from params
),
candidates as (
  select
    sd.entity_type,
    sd.entity_id,
    sd.title,
    sd.subtitle,
    sd.city_name,
    sd.district_name,
    sd.metadata,
    greatest(
      similarity(public.normalize_search_text(sd.title), qd.q),
      similarity(public.normalize_search_text(coalesce(sd.subtitle, '')), qd.q) * 0.60,
      coalesce(ts_rank_cd(sd.tsv, qd.tsq), 0)
    ) as lexical_score,
    case
      when p_query_embedding is null or sd.embedding is null then 0.0
      else greatest(0.0, 1.0 - (sd.embedding <=> p_query_embedding))
    end as semantic_score,
    case
      when p_lat is null or p_lng is null or sd.geog is null then 0.0
      else greatest(
        0.0,
        1.0 - least(
          st_distance(
            sd.geog,
            st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography
          ) / 12000.0,
          1.0
        )
      )
    end as geo_score,
    sd.eeat_score,
    sd.popularity_score,
    sd.freshness_score,
    sd.uniqueness_score,
    case sd.entity_type
      when 'ARTICLE' then 1.18
      when 'USER' then 1.08
      else 0.72
    end as entity_boost
  from public.search_documents sd
  cross join query_data qd
  where qd.q is not null
    and sd.entity_type = any(p_entity_types)
    and (
      p_city_name is null or
      sd.city_name is null or
      public.normalize_search_text(sd.city_name) = public.normalize_search_text(p_city_name)
    )
    and (
      sd.tsv @@ qd.tsq or
      public.normalize_search_text(sd.title) % qd.q or
      public.normalize_search_text(coalesce(sd.subtitle, '')) % qd.q or
      (p_query_embedding is not null and sd.embedding is not null)
    )
)
select
  c.entity_type,
  c.entity_id,
  c.title,
  c.subtitle,
  c.city_name,
  c.district_name,
  c.metadata,
  round((c.entity_boost * (
    c.lexical_score * 0.42 +
    c.semantic_score * 0.23 +
    c.eeat_score * 0.12 +
    c.uniqueness_score * 0.10 +
    c.popularity_score * 0.08 +
    c.freshness_score * 0.03 +
    c.geo_score * 0.02
  ))::numeric, 6)::double precision as score
from candidates c
order by score desc, c.entity_type, c.entity_id
offset (select start_row from params)
limit (select max_rows from params);
$$;

create or replace function public.map_places_hcm_v1(
  p_min_lat double precision,
  p_min_lng double precision,
  p_max_lat double precision,
  p_max_lng double precision,
  p_limit integer default 300,
  p_min_rating double precision default 0
)
returns table (
  id integer,
  name text,
  category text,
  address text,
  latitude double precision,
  longitude double precision,
  avg_rating double precision,
  review_count integer,
  city_name text,
  district_name text,
  source text,
  score double precision
)
language sql
stable
as $$
select
  c.id,
  c.name,
  c.category,
  c.address,
  c.latitude,
  c.longitude,
  c.avg_rating,
  c.review_count,
  c.city_name,
  c.district_name,
  c.source,
  round((
    ((coalesce(c.avg_rating, 0) / 5.0) * 0.55) +
    (least(coalesce(c.review_count, 0), 120)::double precision / 120.0 * 0.30) +
    (case when coalesce(c.source, '') = 'osm' then 0.05 else 0.10 end) +
    (case when c.is_reviewed then 0.05 else 0.00 end)
  )::numeric, 6)::double precision as score
from public.contexts c
where c.type = 'place'
  and coalesce(c.city_name, 'Ho Chi Minh City') = 'Ho Chi Minh City'
  and c.latitude between p_min_lat and p_max_lat
  and c.longitude between p_min_lng and p_max_lng
  and coalesce(c.avg_rating, 0) >= coalesce(p_min_rating, 0)
order by score desc, c.updated_at desc
limit greatest(1, least(coalesce(p_limit, 300), 500));
$$;

select public.refresh_all_search_documents();
