/*
  Warnings:

  - You are about to drop the `_ArticleToCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category_id` to the `articles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "article_tier" AS ENUM ('tier_0_pending', 'tier_1_discovery', 'tier_2_growth', 'tier_3_viral', 'archived');

-- CreateEnum
CREATE TYPE "kv_score" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "interaction_type" AS ENUM ('view', 'save', 'suggest', 'report', 'upvote');

-- CreateEnum
CREATE TYPE "suggestion_status" AS ENUM ('pending', 'accepted', 'rejected');

-- DropForeignKey
ALTER TABLE "_ArticleToCategory" DROP CONSTRAINT "_ArticleToCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArticleToCategory" DROP CONSTRAINT "_ArticleToCategory_B_fkey";

-- DropIndex
DROP INDEX "idx_password_reset_token";

-- DropIndex
DROP INDEX "idx_reputation_score";

-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "category_id" INTEGER NOT NULL,
ADD COLUMN     "is_evergreen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kv_score" "kv_score" NOT NULL DEFAULT 'medium',
ADD COLUMN     "ranking_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "save_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "suggestion_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tier" "article_tier" NOT NULL DEFAULT 'tier_0_pending',
ADD COLUMN     "upvote_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "_ArticleToCategory";

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "token" VARCHAR(10) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "article_id" INTEGER NOT NULL,
    "type" "interaction_type" NOT NULL,
    "time_spent_ms" INTEGER,
    "scroll_depth_percent" INTEGER,
    "location_lat" DOUBLE PRECISION,
    "location_long" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestions" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "article_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "status" "suggestion_status" NOT NULL DEFAULT 'pending',
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_tx_user" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "idx_tx_token" ON "transactions"("token");

-- CreateIndex
CREATE INDEX "idx_tx_created" ON "transactions"("created_at");

-- CreateIndex
CREATE INDEX "idx_interaction_user" ON "interactions"("user_id");

-- CreateIndex
CREATE INDEX "idx_interaction_article" ON "interactions"("article_id");

-- CreateIndex
CREATE INDEX "idx_interaction_type" ON "interactions"("type");

-- CreateIndex
CREATE INDEX "idx_suggestion_author" ON "suggestions"("author_id");

-- CreateIndex
CREATE INDEX "idx_suggestion_article" ON "suggestions"("article_id");

-- CreateIndex
CREATE INDEX "idx_suggestion_status" ON "suggestions"("status");

-- CreateIndex
CREATE INDEX "idx_article_tier" ON "articles"("tier");

-- CreateIndex
CREATE INDEX "idx_ranking_score" ON "articles"("ranking_score" DESC);

-- CreateIndex
CREATE INDEX "idx_kv_score" ON "articles"("kv_score");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
