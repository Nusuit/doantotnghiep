-- CreateEnum
CREATE TYPE "ArticleVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'PREMIUM');

-- DropIndex
DROP INDEX "idx_articles_normalized_title_trgm";

-- DropIndex
DROP INDEX "idx_contexts_canonical_name_trgm";

-- DropIndex
DROP INDEX "idx_contexts_city_name";

-- DropIndex
DROP INDEX "idx_contexts_district_name";

-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "visibility" "ArticleVisibility" NOT NULL DEFAULT 'PUBLIC';
