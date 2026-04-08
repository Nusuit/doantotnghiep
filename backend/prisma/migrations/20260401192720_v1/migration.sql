-- CreateIndex
CREATE INDEX "idx_articles_visibility" ON "articles"("visibility");

-- CreateIndex
CREATE INDEX "idx_articles_feed_v2" ON "articles"("status", "visibility", "ranking_score" DESC);

-- CreateIndex
CREATE INDEX "idx_articles_author_status_visibility" ON "articles"("author_id", "status", "visibility", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_interactions_user_type_created" ON "interactions"("user_id", "type", "created_at" DESC);
