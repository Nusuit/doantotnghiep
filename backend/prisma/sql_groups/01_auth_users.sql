-- ENUMS
CREATE TYPE "AccountStatus" AS ENUM ('pending_verify', 'active', 'inactive', 'suspended', 'banned', 'deleted');
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'moderator');

-- BẢNG CHÍNH - User Authentication và thông tin cơ bản
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE,
  "phone_number" VARCHAR(20) UNIQUE,
  "password_hash" VARCHAR(255),
  "wallet_address" VARCHAR(44) UNIQUE,
  "ks_score" FLOAT DEFAULT 0.0,
  "trust_level" INT DEFAULT 1,
  "reputation_score" INT DEFAULT 0,
  "know_u_balance" INT DEFAULT 0,
  "know_g_balance" FLOAT DEFAULT 0.0,
  "account_status" "AccountStatus" DEFAULT 'active',
  "is_email_verified" BOOLEAN DEFAULT false,
  "is_phone_verified" BOOLEAN DEFAULT false,
  "role" "UserRole" DEFAULT 'user',
  "last_login_at" TIMESTAMP,
  "login_attempts" INT DEFAULT 0,
  "locked_until" TIMESTAMP,
  "email_otp_attempts" INT DEFAULT 0,
  "email_otp_last_sent_at" TIMESTAMP,
  "email_otp_locked_until" TIMESTAMP,
  "password_reset_token" VARCHAR(255),
  "password_reset_expires_at" TIMESTAMP,
  "email_verification_token" VARCHAR(255),
  "email_verification_expires_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL
);

CREATE TABLE "refresh_tokens" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "token_hash" VARCHAR(255) UNIQUE NOT NULL,
  "user_agent" VARCHAR(255),
  "ip_address" VARCHAR(64),
  "revoked" BOOLEAN DEFAULT false,
  "replaced_by" VARCHAR(255),
  "expires_at" TIMESTAMP NOT NULL,
  "last_used_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- OTP VERIFICATION (Legacy)
CREATE TABLE "otp_verifications" (
  "id" SERIAL PRIMARY KEY,
  "phone_number" VARCHAR(20) NOT NULL,
  "otp_code" VARCHAR(6) NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  "attempts" INT DEFAULT 0,
  "is_used" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- FOREIGN KEYS
ALTER TABLE "refresh_tokens" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
