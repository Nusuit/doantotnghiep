CREATE TYPE "InteractionType" AS ENUM ('VIEW', 'SHARE', 'SAVE', 'UPVOTE', 'DOWNVOTE', 'REPORT');
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
CREATE TYPE "WalletTransactionType" AS ENUM ('EARN', 'SPEND', 'DEPOSIT', 'WITHDRAW');
CREATE TYPE "Currency" AS ENUM ('POINTS', 'KNOW_U', 'KNOW_G');

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

CREATE TRIGGER "trg_comment_depth_rule"
BEFORE INSERT OR UPDATE ON "comments"
FOR EACH ROW EXECUTE FUNCTION "enforce_comment_depth"();
