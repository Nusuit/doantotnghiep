-- Create enum for context type if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'context_type') THEN
    CREATE TYPE "context_type" AS ENUM ('place', 'entity', 'topic');
  END IF;
END $$;

-- Create contexts table if missing
CREATE TABLE IF NOT EXISTS "contexts" (
  "id" SERIAL NOT NULL,
  "type" "context_type" NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "category" VARCHAR(100),
  "address" VARCHAR(500),
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "contexts_pkey" PRIMARY KEY ("id")
);

-- Create article_contexts table if missing
CREATE TABLE IF NOT EXISTS "article_contexts" (
  "article_id" INTEGER NOT NULL,
  "context_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "article_contexts_pkey" PRIMARY KEY ("article_id", "context_id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_context_type" ON "contexts"("type");
CREATE INDEX IF NOT EXISTS "idx_context_coords" ON "contexts"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "idx_context_category" ON "contexts"("category");
CREATE INDEX IF NOT EXISTS "idx_article_context_context" ON "article_contexts"("context_id");

-- Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'article_contexts_article_id_fkey'
  ) THEN
    ALTER TABLE "article_contexts"
      ADD CONSTRAINT "article_contexts_article_id_fkey"
      FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'article_contexts_context_id_fkey'
  ) THEN
    ALTER TABLE "article_contexts"
      ADD CONSTRAINT "article_contexts_context_id_fkey"
      FOREIGN KEY ("context_id") REFERENCES "contexts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
