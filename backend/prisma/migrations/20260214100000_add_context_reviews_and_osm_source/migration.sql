-- Create enum for context review status if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'context_review_status') THEN
    CREATE TYPE "context_review_status" AS ENUM ('published', 'hidden', 'deleted');
  END IF;
END $$;

-- Add columns to contexts for source tracking and review aggregates
ALTER TABLE "contexts"
  ADD COLUMN IF NOT EXISTS "source" VARCHAR(32),
  ADD COLUMN IF NOT EXISTS "source_ref" VARCHAR(128),
  ADD COLUMN IF NOT EXISTS "is_reviewed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "review_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- Create context_reviews table
CREATE TABLE IF NOT EXISTS "context_reviews" (
  "id" SERIAL NOT NULL,
  "context_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "stars" INTEGER NOT NULL,
  "comment" TEXT,
  "status" "context_review_status" NOT NULL DEFAULT 'published',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "context_reviews_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "chk_context_reviews_stars" CHECK ("stars" >= 1 AND "stars" <= 5)
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "uq_context_source_ref" ON "contexts"("source", "source_ref");
CREATE INDEX IF NOT EXISTS "idx_context_is_reviewed" ON "contexts"("is_reviewed");
CREATE INDEX IF NOT EXISTS "idx_context_avg_rating" ON "contexts"("avg_rating" DESC);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_context_review_user" ON "context_reviews"("context_id", "user_id");
CREATE INDEX IF NOT EXISTS "idx_context_review_context" ON "context_reviews"("context_id");
CREATE INDEX IF NOT EXISTS "idx_context_review_user" ON "context_reviews"("user_id");
CREATE INDEX IF NOT EXISTS "idx_context_review_status" ON "context_reviews"("status");

-- Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'context_reviews_context_id_fkey'
  ) THEN
    ALTER TABLE "context_reviews"
      ADD CONSTRAINT "context_reviews_context_id_fkey"
      FOREIGN KEY ("context_id") REFERENCES "contexts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'context_reviews_user_id_fkey'
  ) THEN
    ALTER TABLE "context_reviews"
      ADD CONSTRAINT "context_reviews_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
