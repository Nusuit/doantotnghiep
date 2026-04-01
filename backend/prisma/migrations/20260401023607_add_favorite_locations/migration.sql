/*
  Warnings:

  - You are about to drop the column `has_completed_onboarding` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `Place` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `context_reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `point_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `restaurants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `votes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "article_taxonomies" DROP CONSTRAINT "article_taxonomies_article_id_fkey";

-- DropForeignKey
ALTER TABLE "article_taxonomies" DROP CONSTRAINT "article_taxonomies_taxonomy_id_fkey";

-- DropForeignKey
ALTER TABLE "article_versions" DROP CONSTRAINT "article_versions_article_id_fkey";

-- DropForeignKey
ALTER TABLE "article_versions" DROP CONSTRAINT "article_versions_editor_id_fkey";

-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_author_id_fkey";

-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_context_id_fkey";

-- DropForeignKey
ALTER TABLE "collection_items" DROP CONSTRAINT "collection_items_article_id_fkey";

-- DropForeignKey
ALTER TABLE "collection_items" DROP CONSTRAINT "collection_items_collection_id_fkey";

-- DropForeignKey
ALTER TABLE "collection_items" DROP CONSTRAINT "collection_items_context_id_fkey";

-- DropForeignKey
ALTER TABLE "collections" DROP CONSTRAINT "collections_user_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_article_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_follower_id_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_following_id_fkey";

-- DropForeignKey
ALTER TABLE "interactions" DROP CONSTRAINT "interactions_article_id_fkey";

-- DropForeignKey
ALTER TABLE "interactions" DROP CONSTRAINT "interactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "suggestions" DROP CONSTRAINT "suggestions_article_id_fkey";

-- DropForeignKey
ALTER TABLE "suggestions" DROP CONSTRAINT "suggestions_author_id_fkey";

-- DropForeignKey
ALTER TABLE "taxonomies" DROP CONSTRAINT "taxonomies_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "user_badges" DROP CONSTRAINT "user_badges_badge_id_fkey";

-- DropForeignKey
ALTER TABLE "user_badges" DROP CONSTRAINT "user_badges_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_security" DROP CONSTRAINT "user_security_user_id_fkey";

-- DropForeignKey
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_user_id_fkey";

-- DropIndex
DROP INDEX "idx_has_completed_onboarding";

-- AlterTable
ALTER TABLE "article_versions" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "articles" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "collection_items" ALTER COLUMN "added_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "collections" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "contexts" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "follows" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "interactions" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "refresh_tokens" ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "last_used_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "suggestions" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_badges" ALTER COLUMN "awarded_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_profiles" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_security" ALTER COLUMN "last_login_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "locked_until" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "email_otp_last_sent_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "email_otp_locked_until" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "password_reset_expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "email_verification_expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "has_completed_onboarding",
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "wallet_transactions" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- DropTable
DROP TABLE "Place";

-- DropTable
DROP TABLE "context_reviews";

-- DropTable
DROP TABLE "point_transactions";

-- DropTable
DROP TABLE "restaurants";

-- DropTable
DROP TABLE "transactions";

-- DropTable
DROP TABLE "votes";

-- DropEnum
DROP TYPE "account_status";

-- DropEnum
DROP TYPE "article_tier";

-- DropEnum
DROP TYPE "context_review_status";

-- DropEnum
DROP TYPE "context_type";

-- DropEnum
DROP TYPE "gender";

-- DropEnum
DROP TYPE "interaction_type";

-- DropEnum
DROP TYPE "kv_score";

-- DropEnum
DROP TYPE "role";

-- DropEnum
DROP TYPE "suggestion_status";

-- AddForeignKey
ALTER TABLE "user_security" ADD CONSTRAINT "user_security_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "contexts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxonomies" ADD CONSTRAINT "taxonomies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "taxonomies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_taxonomies" ADD CONSTRAINT "article_taxonomies_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_taxonomies" ADD CONSTRAINT "article_taxonomies_taxonomy_id_fkey" FOREIGN KEY ("taxonomy_id") REFERENCES "taxonomies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_versions" ADD CONSTRAINT "article_versions_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_versions" ADD CONSTRAINT "article_versions_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "contexts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_locations" ADD CONSTRAINT "favorite_locations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
