-- Add reputation-related fields to users
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "ks_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "trust_level" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "know_g_balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

CREATE INDEX IF NOT EXISTS "idx_ks_score" ON "users"("ks_score" DESC);

-- Align know_u_balance type to integer (schema expects Int)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'know_u_balance'
  ) THEN
    ALTER TABLE "users"
      ALTER COLUMN "know_u_balance" TYPE INTEGER USING ROUND("know_u_balance")::INTEGER,
      ALTER COLUMN "know_u_balance" SET DEFAULT 0;
  END IF;
END $$;
