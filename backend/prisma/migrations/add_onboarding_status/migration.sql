-- Add hasCompletedOnboarding field to users table
ALTER TABLE "users" ADD COLUMN "has_completed_onboarding" BOOLEAN NOT NULL DEFAULT false;

-- Create index for quick queries
CREATE INDEX "idx_has_completed_onboarding" ON "users"("has_completed_onboarding");
