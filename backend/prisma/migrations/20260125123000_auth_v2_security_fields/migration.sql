-- Add lifecycle statuses
DO $$
BEGIN
  ALTER TYPE "account_status" ADD VALUE IF NOT EXISTS 'pending_verify';
  ALTER TYPE "account_status" ADD VALUE IF NOT EXISTS 'banned';
  ALTER TYPE "account_status" ADD VALUE IF NOT EXISTS 'deleted';
END $$;

-- OTP abuse protection fields
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "email_otp_attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "email_otp_last_sent_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "email_otp_locked_until" TIMESTAMPTZ;

-- Refresh token metadata
ALTER TABLE "refresh_tokens"
  ADD COLUMN IF NOT EXISTS "user_agent" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "ip_address" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "last_used_at" TIMESTAMPTZ;
