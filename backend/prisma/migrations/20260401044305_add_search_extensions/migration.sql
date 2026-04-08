-- ── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ── normalize_search_text() ───────────────────────────────────────────────────
-- IMMUTABLE so GIN expression indexes can depend on it.
CREATE OR REPLACE FUNCTION public.normalize_search_text(p_input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(unaccent(trim(regexp_replace(coalesce(p_input, ''), '\s+', ' ', 'g'))));
$$;

-- ── New columns on contexts ───────────────────────────────────────────────────
ALTER TABLE "contexts"
  ADD COLUMN IF NOT EXISTS "canonical_name" TEXT,
  ADD COLUMN IF NOT EXISTS "city_name"      TEXT,
  ADD COLUMN IF NOT EXISTS "district_name"  TEXT,
  ADD COLUMN IF NOT EXISTS "ward_name"      TEXT;

-- ── New column on articles ────────────────────────────────────────────────────
ALTER TABLE "articles"
  ADD COLUMN IF NOT EXISTS "normalized_title" TEXT;

-- ── Backfill existing rows ────────────────────────────────────────────────────
UPDATE "contexts"
  SET "canonical_name" = public.normalize_search_text("name")
  WHERE "canonical_name" IS NULL;

UPDATE "articles"
  SET "normalized_title" = public.normalize_search_text("title")
  WHERE "normalized_title" IS NULL;

-- ── Trigger: keep canonical_name in sync with name ───────────────────────────
CREATE OR REPLACE FUNCTION public.sync_context_canonical_name()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.canonical_name := public.normalize_search_text(NEW.name);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_context_canonical_name ON "contexts";
CREATE TRIGGER trg_sync_context_canonical_name
  BEFORE INSERT OR UPDATE OF "name" ON "contexts"
  FOR EACH ROW EXECUTE FUNCTION public.sync_context_canonical_name();

-- ── Trigger: keep normalized_title in sync with title ────────────────────────
CREATE OR REPLACE FUNCTION public.sync_article_normalized_title()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.normalized_title := public.normalize_search_text(NEW.title);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_article_normalized_title ON "articles";
CREATE TRIGGER trg_sync_article_normalized_title
  BEFORE INSERT OR UPDATE OF "title" ON "articles"
  FOR EACH ROW EXECUTE FUNCTION public.sync_article_normalized_title();

-- ── GIN trigram indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_contexts_canonical_name_trgm
  ON "contexts" USING GIN ("canonical_name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_articles_normalized_title_trgm
  ON "articles" USING GIN ("normalized_title" gin_trgm_ops);

-- ── B-tree indexes for district/city filtering ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_contexts_district_name ON "contexts" ("district_name");
CREATE INDEX IF NOT EXISTS idx_contexts_city_name     ON "contexts" ("city_name");
