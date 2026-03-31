CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFY', 'SUSPENDED', 'BANNED');
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE,
  "phone_number" VARCHAR(20) UNIQUE,
  "wallet_address" VARCHAR(44) UNIQUE,
  "ks_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reputation_score" INTEGER NOT NULL DEFAULT 0,
  "know_u_balance" INTEGER NOT NULL DEFAULT 0,
  "know_g_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "chk_users_identity" CHECK (
    "email" IS NOT NULL OR "phone_number" IS NOT NULL OR "wallet_address" IS NOT NULL
  )
);

CREATE TABLE "user_security" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "password_hash" VARCHAR(255),
  "is_email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_phone_verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "last_login_at" TIMESTAMP,
  "login_attempts" INTEGER NOT NULL DEFAULT 0,
  "locked_until" TIMESTAMP,
  "email_otp" VARCHAR(255),
  "email_otp_attempts" INTEGER NOT NULL DEFAULT 0,
  "email_otp_last_sent_at" TIMESTAMP,
  "email_otp_locked_until" TIMESTAMP,
  "password_reset_token" VARCHAR(255),
  "password_reset_expires_at" TIMESTAMP,
  "email_verification_token" VARCHAR(255),
  "email_verification_expires_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "refresh_tokens" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" VARCHAR(255) NOT NULL UNIQUE,
  "revoked" BOOLEAN NOT NULL DEFAULT FALSE,
  "expires_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "user_agent" VARCHAR(255),
  "ip_address" VARCHAR(64),
  "replaced_by" VARCHAR(255),
  "last_used_at" TIMESTAMP
);

CREATE INDEX "idx_users_ks_score" ON "users" ("ks_score" DESC);
CREATE INDEX "idx_users_account_status" ON "users" ("account_status");
CREATE INDEX "idx_users_role" ON "users" ("role");
CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens" ("user_id");
CREATE INDEX "idx_refresh_tokens_revoked" ON "refresh_tokens" ("revoked");
CREATE INDEX "idx_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at");
