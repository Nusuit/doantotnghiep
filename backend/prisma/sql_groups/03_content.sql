-- ENUMS
CREATE TYPE "ArticleTier" AS ENUM ('tier_0_pending', 'tier_1_discovery', 'tier_2_growth', 'tier_3_viral', 'archived');
CREATE TYPE "KVScore" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "ContextType" AS ENUM ('place', 'entity', 'topic');

-- KNOWLEDGE PLATFORM MODELS
CREATE TABLE "articles" (
  "id" SERIAL PRIMARY KEY,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "title" VARCHAR(500) NOT NULL,
  "content" TEXT NOT NULL,
  "arweave_hash" VARCHAR(100),
  "status" VARCHAR(20) DEFAULT 'PUBLISHED',
  "tier" "ArticleTier" DEFAULT 'tier_0_pending',
  "ranking_score" FLOAT DEFAULT 0.0,
  "kv_score" "KVScore" DEFAULT 'medium',
  "is_evergreen" BOOLEAN DEFAULT false,
  "view_count" INT DEFAULT 0,
  "suggestion_count" INT DEFAULT 0,
  "save_count" INT DEFAULT 0,
  "upvote_count" INT DEFAULT 0,
  "category_id" INT NOT NULL,
  "author_id" INT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL
);

CREATE TABLE "article_histories" (
  "id" SERIAL PRIMARY KEY,
  "article_id" INT NOT NULL,
  "editor_id" INT NOT NULL,
  "title" VARCHAR(500) NOT NULL,
  "content" TEXT NOT NULL,
  "change_note" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) UNIQUE NOT NULL,
  "slug" VARCHAR(100) UNIQUE NOT NULL,
  "description" TEXT,
  "parent_id" INT
);

CREATE TABLE "tags" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(50) UNIQUE NOT NULL,
  "slug" VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE "contexts" (
  "id" SERIAL PRIMARY KEY,
  "type" "ContextType" NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "category" VARCHAR(100),
  "address" VARCHAR(500),
  "latitude" FLOAT,
  "longitude" FLOAT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL
);

CREATE TABLE "article_contexts" (
  "article_id" INT NOT NULL,
  "context_id" INT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY ("article_id", "context_id")
);

-- DISCOVERY MODELS
CREATE TABLE "series" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "author_id" INT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL
);

CREATE TABLE "series_articles" (
  "series_id" INT NOT NULL,
  "article_id" INT NOT NULL,
  "order" INT NOT NULL,
  PRIMARY KEY ("series_id", "article_id")
);

-- FOREIGN KEYS
ALTER TABLE "articles" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");
ALTER TABLE "articles" ADD FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "article_histories" ADD FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE;
ALTER TABLE "article_histories" ADD FOREIGN KEY ("editor_id") REFERENCES "users" ("id");
ALTER TABLE "categories" ADD FOREIGN KEY ("parent_id") REFERENCES "categories" ("id");
ALTER TABLE "article_contexts" ADD FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE;
ALTER TABLE "article_contexts" ADD FOREIGN KEY ("context_id") REFERENCES "contexts" ("id") ON DELETE CASCADE;
ALTER TABLE "series" ADD FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "series_articles" ADD FOREIGN KEY ("series_id") REFERENCES "series" ("id") ON DELETE CASCADE;
ALTER TABLE "series_articles" ADD FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE;

-- MANY-TO-MANY RELATIONSHIPS
-- Article <-> Tag
CREATE TABLE "_ArticleToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    FOREIGN KEY ("A") REFERENCES "articles"("id") ON DELETE CASCADE,
    FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "_ArticleToTag_AB_unique" ON "_ArticleToTag"("A", "B");
CREATE INDEX "_ArticleToTag_B_index" ON "_ArticleToTag"("B");
