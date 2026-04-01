CREATE TYPE "ArticleType" AS ENUM ('POST', 'REVIEW');
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'FLAGGED', 'HIDDEN');
CREATE TYPE "ArticleTier" AS ENUM ('TIER_0', 'TIER_1', 'TIER_2', 'TIER_3');
CREATE TYPE "KVScore" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "ContextType" AS ENUM ('PLACE', 'ENTITY', 'TOPIC');
CREATE TYPE "TaxonomyType" AS ENUM ('CATEGORY', 'TAG');

CREATE TABLE "contexts" (
  "id" SERIAL PRIMARY KEY,
  "type" "ContextType" NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "category" VARCHAR(100),
  "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "source" VARCHAR(64),
  "source_ref" VARCHAR(128),
  "description" TEXT,
  "address" VARCHAR(500),
  "is_reviewed" BOOLEAN NOT NULL DEFAULT FALSE,
  "review_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "uq_contexts_latitude_longitude" UNIQUE ("latitude", "longitude"),
  CONSTRAINT "uq_contexts_source_source_ref" UNIQUE ("source", "source_ref"),
  CONSTRAINT "chk_contexts_place_coordinates" CHECK (
    ("type" = 'PLACE' AND "latitude" IS NOT NULL AND "longitude" IS NOT NULL)
    OR ("type" <> 'PLACE' AND "latitude" IS NULL AND "longitude" IS NULL)
  )
);

CREATE TABLE "articles" (
  "id" SERIAL PRIMARY KEY,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "title" VARCHAR(500) NOT NULL,
  "content" TEXT NOT NULL,
  "type" "ArticleType" NOT NULL,
  "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
  "tier" "ArticleTier" NOT NULL DEFAULT 'TIER_0',
  "ranking_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "kv_score" "KVScore" NOT NULL DEFAULT 'LOW',
  "context_id" INTEGER NOT NULL REFERENCES "contexts"("id") ON DELETE RESTRICT,
  "author_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "view_count" INTEGER NOT NULL DEFAULT 0,
  "save_count" INTEGER NOT NULL DEFAULT 0,
  "upvote_count" INTEGER NOT NULL DEFAULT 0,
  "is_evergreen" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "taxonomies" (
  "id" SERIAL PRIMARY KEY,
  "type" "TaxonomyType" NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "slug" VARCHAR(100) NOT NULL UNIQUE,
  "parent_id" INTEGER REFERENCES "taxonomies"("id") ON DELETE SET NULL,
  "description" TEXT
);

CREATE TABLE "article_taxonomies" (
  "article_id" INTEGER NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "taxonomy_id" INTEGER NOT NULL REFERENCES "taxonomies"("id") ON DELETE CASCADE,
  PRIMARY KEY ("article_id", "taxonomy_id")
);

CREATE INDEX "idx_contexts_type" ON "contexts" ("type");
CREATE INDEX "idx_contexts_category" ON "contexts" ("category");
CREATE INDEX "idx_contexts_is_reviewed" ON "contexts" ("is_reviewed");
CREATE INDEX "idx_contexts_avg_rating" ON "contexts" ("avg_rating" DESC);
CREATE INDEX "idx_articles_author_id" ON "articles" ("author_id");
CREATE INDEX "idx_articles_context_id" ON "articles" ("context_id");
CREATE INDEX "idx_articles_status" ON "articles" ("status");
CREATE INDEX "idx_articles_type" ON "articles" ("type");
CREATE INDEX "idx_articles_tier" ON "articles" ("tier");
CREATE INDEX "idx_articles_ranking_score" ON "articles" ("ranking_score" DESC);
CREATE INDEX "idx_articles_feed" ON "articles" ("status", "tier", "ranking_score" DESC);
CREATE INDEX "idx_articles_kv_score" ON "articles" ("kv_score");
CREATE INDEX "idx_taxonomies_type" ON "taxonomies" ("type");
CREATE INDEX "idx_taxonomies_parent_id" ON "taxonomies" ("parent_id");
CREATE INDEX "idx_article_taxonomies_taxonomy_id" ON "article_taxonomies" ("taxonomy_id");

CREATE OR REPLACE FUNCTION "enforce_review_context_rule"()
RETURNS TRIGGER AS $$
DECLARE
  v_context_type "ContextType";
BEGIN
  SELECT "type" INTO v_context_type
  FROM "contexts"
  WHERE "id" = NEW."context_id";

  IF NEW."type" = 'REVIEW' THEN
    IF v_context_type IS DISTINCT FROM 'PLACE' THEN
      RAISE EXCEPTION 'REVIEW articles must reference a PLACE context';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM "articles"
      WHERE "context_id" = NEW."context_id"
        AND "type" = 'REVIEW'
        AND "id" <> COALESCE(NEW."id", -1)
    ) THEN
      RAISE EXCEPTION 'Only one REVIEW article is allowed per PLACE context';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_review_context_rule"
BEFORE INSERT OR UPDATE ON "articles"
FOR EACH ROW EXECUTE FUNCTION "enforce_review_context_rule"();
