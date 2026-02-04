-- AlterTable
ALTER TABLE "contexts" ADD COLUMN IF NOT EXISTS "category" VARCHAR(100);

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_context_category" ON "contexts"("category");
