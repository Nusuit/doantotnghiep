BEGIN;

DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "conversations" CASCADE;
DROP TABLE IF EXISTS "otp_verifications" CASCADE;
DROP TABLE IF EXISTS "series_articles" CASCADE;
DROP TABLE IF EXISTS "series" CASCADE;
DROP TABLE IF EXISTS "article_contexts" CASCADE;
DROP TABLE IF EXISTS "_ArticleToTag" CASCADE;
DROP TABLE IF EXISTS "tags" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "article_histories" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "user_badges" CASCADE;
DROP TABLE IF EXISTS "badges" CASCADE;
DROP TABLE IF EXISTS "follows" CASCADE;
DROP TABLE IF EXISTS "wallet_transactions" CASCADE;
DROP TABLE IF EXISTS "collection_items" CASCADE;
DROP TABLE IF EXISTS "collections" CASCADE;
DROP TABLE IF EXISTS "interactions" CASCADE;
DROP TABLE IF EXISTS "article_versions" CASCADE;
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "suggestions" CASCADE;
DROP TABLE IF EXISTS "article_taxonomies" CASCADE;
DROP TABLE IF EXISTS "taxonomies" CASCADE;
DROP TABLE IF EXISTS "articles" CASCADE;
DROP TABLE IF EXISTS "contexts" CASCADE;
DROP TABLE IF EXISTS "refresh_tokens" CASCADE;
DROP TABLE IF EXISTS "user_profiles" CASCADE;
DROP TABLE IF EXISTS "user_security" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

DROP TYPE IF EXISTS "Currency" CASCADE;
DROP TYPE IF EXISTS "WalletTransactionType" CASCADE;
DROP TYPE IF EXISTS "SuggestionStatus" CASCADE;
DROP TYPE IF EXISTS "InteractionType" CASCADE;
DROP TYPE IF EXISTS "TaxonomyType" CASCADE;
DROP TYPE IF EXISTS "ContextType" CASCADE;
DROP TYPE IF EXISTS "KVScore" CASCADE;
DROP TYPE IF EXISTS "ArticleTier" CASCADE;
DROP TYPE IF EXISTS "ArticleStatus" CASCADE;
DROP TYPE IF EXISTS "ArticleType" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "AccountStatus" CASCADE;

CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFY', 'SUSPENDED', 'BANNED');
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');
CREATE TYPE "ArticleType" AS ENUM ('POST', 'REVIEW');
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'FLAGGED', 'HIDDEN');
CREATE TYPE "ArticleTier" AS ENUM ('TIER_0', 'TIER_1', 'TIER_2', 'TIER_3');
CREATE TYPE "KVScore" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "ContextType" AS ENUM ('PLACE', 'ENTITY', 'TOPIC');
CREATE TYPE "TaxonomyType" AS ENUM ('CATEGORY', 'TAG');
CREATE TYPE "InteractionType" AS ENUM ('VIEW', 'SHARE', 'SAVE', 'UPVOTE', 'DOWNVOTE', 'REPORT');
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
CREATE TYPE "WalletTransactionType" AS ENUM ('EARN', 'SPEND', 'DEPOSIT', 'WITHDRAW');
CREATE TYPE "Currency" AS ENUM ('POINTS', 'KNOW_U', 'KNOW_G');

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE,
  "phone_number" VARCHAR(20) UNIQUE,
  "wallet_address" VARCHAR(44) UNIQUE,
  "ks_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reputation_score" INTEGER NOT NULL DEFAULT 0,
  "know_u_balance" INTEGER NOT NULL DEFAULT 0,
  "know_g_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "chk_users_identity" CHECK (
    "email" IS NOT NULL OR "phone_number" IS NOT NULL OR "wallet_address" IS NOT NULL
  )
);

CREATE TABLE "user_security" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "password_hash" VARCHAR(255),
  "is_email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_phone_verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "last_login_at" TIMESTAMP,
  "login_attempts" INTEGER NOT NULL DEFAULT 0,
  "locked_until" TIMESTAMP,
  "email_otp" VARCHAR(255),
  "email_otp_attempts" INTEGER NOT NULL DEFAULT 0,
  "email_otp_last_sent_at" TIMESTAMP,
  "email_otp_locked_until" TIMESTAMP,
  "password_reset_token" VARCHAR(255),
  "password_reset_expires_at" TIMESTAMP,
  "email_verification_token" VARCHAR(255),
  "email_verification_expires_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "user_profiles" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "display_name" VARCHAR(100) NOT NULL,
  "avatar_url" VARCHAR(500),
  "bio" TEXT,
  "is_profile_public" BOOLEAN NOT NULL DEFAULT TRUE,
  "first_name" VARCHAR(50),
  "last_name" VARCHAR(50),
  "language" VARCHAR(5) NOT NULL DEFAULT 'vi',
  "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  "email_notifications" BOOLEAN NOT NULL DEFAULT TRUE,
  "push_notifications" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "refresh_tokens" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" VARCHAR(255) NOT NULL UNIQUE,
  "revoked" BOOLEAN NOT NULL DEFAULT FALSE,
  "expires_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "user_agent" VARCHAR(255),
  "ip_address" VARCHAR(64),
  "replaced_by" VARCHAR(255),
  "last_used_at" TIMESTAMP
);

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

CREATE TABLE "suggestions" (
  "id" SERIAL PRIMARY KEY,
  "author_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "article_id" INTEGER NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
  "comment" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "comments" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "article_id" INTEGER NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "parent_id" INTEGER REFERENCES "comments"("id") ON DELETE SET NULL,
  "content" TEXT NOT NULL,
  "upvote_count" INTEGER NOT NULL DEFAULT 0,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "article_versions" (
  "id" SERIAL PRIMARY KEY,
  "article_id" INTEGER NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "editor_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "version_number" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "uq_article_versions_article_version_number" UNIQUE ("article_id", "version_number")
);

CREATE TABLE "interactions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "article_id" INTEGER NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "type" "InteractionType" NOT NULL,
  "time_spent_ms" INTEGER,
  "location_lat" DOUBLE PRECISION,
  "location_long" DOUBLE PRECISION,
  "scroll_depth_percent" INTEGER,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "collections" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "is_public" BOOLEAN NOT NULL DEFAULT FALSE,
  "description" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "collection_items" (
  "id" SERIAL PRIMARY KEY,
  "collection_id" INTEGER NOT NULL REFERENCES "collections"("id") ON DELETE CASCADE,
  "article_id" INTEGER NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "context_id" INTEGER REFERENCES "contexts"("id") ON DELETE SET NULL,
  "added_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "order" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT
);

CREATE TABLE "wallet_transactions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" "WalletTransactionType" NOT NULL,
  "currency" "Currency" NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "reason_code" VARCHAR(100),
  "ref_id" INTEGER,
  "metadata" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "follows" (
  "following_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "follower_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("following_id", "follower_id")
);

CREATE TABLE "badges" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "description" TEXT,
  "icon_url" VARCHAR(500),
  "criteria" TEXT
);

CREATE TABLE "user_badges" (
  "badge_id" INTEGER NOT NULL REFERENCES "badges"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "awarded_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("badge_id", "user_id")
);

CREATE TABLE "notifications" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" VARCHAR(100) NOT NULL,
  "content" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "ref_id" INTEGER,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_users_ks_score" ON "users" ("ks_score" DESC);
CREATE INDEX "idx_users_account_status" ON "users" ("account_status");
CREATE INDEX "idx_users_role" ON "users" ("role");
CREATE INDEX "idx_user_profiles_display_name" ON "user_profiles" ("display_name");
CREATE INDEX "idx_user_profiles_is_public" ON "user_profiles" ("is_profile_public");
CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens" ("user_id");
CREATE INDEX "idx_refresh_tokens_revoked" ON "refresh_tokens" ("revoked");
CREATE INDEX "idx_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at");
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
CREATE INDEX "idx_suggestions_author_id" ON "suggestions" ("author_id");
CREATE INDEX "idx_suggestions_article_id" ON "suggestions" ("article_id");
CREATE INDEX "idx_suggestions_status" ON "suggestions" ("status");
CREATE INDEX "idx_comments_article_created_at" ON "comments" ("article_id", "created_at");
CREATE INDEX "idx_comments_user_id" ON "comments" ("user_id");
CREATE INDEX "idx_comments_parent_id" ON "comments" ("parent_id");
CREATE INDEX "idx_comments_deleted_at" ON "comments" ("deleted_at");
CREATE INDEX "idx_article_versions_article_id" ON "article_versions" ("article_id");
CREATE INDEX "idx_interactions_article_type" ON "interactions" ("article_id", "type");
CREATE INDEX "idx_interactions_user_type" ON "interactions" ("user_id", "type");
CREATE INDEX "idx_interactions_user_id" ON "interactions" ("user_id");
CREATE INDEX "idx_interactions_article_id" ON "interactions" ("article_id");
CREATE INDEX "idx_interactions_type" ON "interactions" ("type");
CREATE UNIQUE INDEX "uq_interactions_non_view_per_type"
  ON "interactions" ("user_id", "article_id", "type")
  WHERE "type" <> 'VIEW';
CREATE INDEX "idx_collections_user_public" ON "collections" ("user_id", "is_public");
CREATE INDEX "idx_collections_user_id" ON "collections" ("user_id");
CREATE INDEX "idx_collection_items_collection_id" ON "collection_items" ("collection_id");
CREATE INDEX "idx_collection_items_article_id" ON "collection_items" ("article_id");
CREATE INDEX "idx_collection_items_context_id" ON "collection_items" ("context_id");
CREATE INDEX "idx_wallet_transactions_user_currency" ON "wallet_transactions" ("user_id", "currency");
CREATE INDEX "idx_wallet_transactions_created_at" ON "wallet_transactions" ("created_at");
CREATE INDEX "idx_follows_follower_id" ON "follows" ("follower_id");
CREATE INDEX "idx_follows_following_id" ON "follows" ("following_id");
CREATE INDEX "idx_notifications_user_read_created_at" ON "notifications" ("user_id", "is_read", "created_at");

CREATE OR REPLACE FUNCTION "set_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION "enforce_comment_depth"()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_parent_id INTEGER;
BEGIN
  IF NEW."parent_id" IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT "parent_id" INTO v_parent_parent_id
  FROM "comments"
  WHERE "id" = NEW."parent_id";

  IF v_parent_parent_id IS NOT NULL THEN
    RAISE EXCEPTION 'Only one reply level is allowed in comments';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_users_updated_at"
BEFORE UPDATE ON "users"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "trg_user_security_updated_at"
BEFORE UPDATE ON "user_security"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "trg_user_profiles_updated_at"
BEFORE UPDATE ON "user_profiles"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "trg_contexts_updated_at"
BEFORE UPDATE ON "contexts"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "trg_articles_updated_at"
BEFORE UPDATE ON "articles"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "trg_suggestions_updated_at"
BEFORE UPDATE ON "suggestions"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "trg_comments_updated_at"
BEFORE UPDATE ON "comments"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "trg_collections_updated_at"
BEFORE UPDATE ON "collections"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "trg_review_context_rule"
BEFORE INSERT OR UPDATE ON "articles"
FOR EACH ROW EXECUTE FUNCTION "enforce_review_context_rule"();

CREATE TRIGGER "trg_comment_depth_rule"
BEFORE INSERT OR UPDATE ON "comments"
FOR EACH ROW EXECUTE FUNCTION "enforce_comment_depth"();

COMMIT;
