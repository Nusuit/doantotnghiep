-- ENUMS
CREATE TYPE "AccountStatus" AS ENUM ('pending_verify', 'active', 'inactive', 'suspended', 'banned', 'deleted');
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');
CREATE TYPE "ContextType" AS ENUM ('place', 'entity', 'topic');
CREATE TYPE "ArticleTier" AS ENUM ('tier_0_pending', 'tier_1_discovery', 'tier_2_growth', 'tier_3_viral', 'archived');
CREATE TYPE "KVScore" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "InteractionType" AS ENUM ('view', 'save', 'suggest', 'report', 'upvote');
CREATE TYPE "SuggestionStatus" AS ENUM ('pending', 'accepted', 'rejected');

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

-- BẢNG PROFILE - Thông tin cá nhân chi tiết
CREATE TABLE "user_profiles" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT UNIQUE NOT NULL,
  "display_name" VARCHAR(100) NOT NULL,
  "first_name" VARCHAR(50),
  "last_name" VARCHAR(50),
  "avatar_url" VARCHAR(500),
  "bio" TEXT,
  "birth_date" DATE,
  "gender" "Gender",
  "phone_number" VARCHAR(20),
  "country" VARCHAR(100),
  "city" VARCHAR(100),
  "address" TEXT,
  "language" VARCHAR(5) DEFAULT 'vi',
  "timezone" VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
  "is_profile_public" BOOLEAN DEFAULT true,
  "email_notifications" BOOLEAN DEFAULT true,
  "push_notifications" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL
);

-- CHATBOT MODELS
CREATE TABLE "conversations" (
  "id" VARCHAR(30) PRIMARY KEY,
  "user_id" INT NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL
);

CREATE TABLE "messages" (
  "id" VARCHAR(30) PRIMARY KEY,
  "conversation_id" VARCHAR(30) NOT NULL,
  "content" TEXT NOT NULL,
  "is_user" BOOLEAN NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- MAP MODELS
CREATE TABLE "favorite_locations" (
  "id" VARCHAR(30) PRIMARY KEY,
  "user_id" INT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "address" VARCHAR(500),
  "lat" FLOAT NOT NULL,
  "lng" FLOAT NOT NULL,
  "category" VARCHAR(50) DEFAULT 'general',
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Place" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "address" TEXT,
  "latitude" FLOAT NOT NULL,
  "longitude" FLOAT NOT NULL,
  "category" TEXT DEFAULT 'GENERAL',
  "coverImage" TEXT,
  "authorId" INT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- USER CREATED RESTAURANTS
CREATE TABLE "restaurants" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "address" VARCHAR(500) NOT NULL,
  "latitude" FLOAT NOT NULL,
  "longitude" FLOAT NOT NULL,
  "phone" VARCHAR(20),
  "website" VARCHAR(500),
  "image_url" VARCHAR(500),
  "category" VARCHAR(100),
  "price_level" INT,
  "is_active" BOOLEAN DEFAULT true,
  "is_verified" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL
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

-- KNOWLEDGE PLATFORM MODELS
CREATE TABLE "articles" (
  "id" SERIAL PRIMARY KEY,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "title" VARCHAR(500) NOT NULL,
  "content" TEXT NOT NULL,
  "arweave_hash" VARCHAR(100),
  "status" VARCHAR(20) DEFAULT 'PUBLISHED',
  "tier" "ArticleTier" DEFAULT 'tier_0_pending',
  "ranking_score" FLOAT DEFAULT 0.0,
  "kv_score" "KVScore" DEFAULT 'medium',
  "is_evergreen" BOOLEAN DEFAULT false,
  "view_count" INT DEFAULT 0,
  "suggestion_count" INT DEFAULT 0,
  "save_count" INT DEFAULT 0,
  "upvote_count" INT DEFAULT 0,
  "category_id" INT NOT NULL,
  "author_id" INT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL
);

CREATE TABLE "article_histories" (
  "id" SERIAL PRIMARY KEY,
  "article_id" INT NOT NULL,
  "editor_id" INT NOT NULL,
  "title" VARCHAR(500) NOT NULL,
  "content" TEXT NOT NULL,
  "change_note" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) UNIQUE NOT NULL,
  "slug" VARCHAR(100) UNIQUE NOT NULL,
  "description" TEXT,
  "parent_id" INT
);

CREATE TABLE "tags" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(50) UNIQUE NOT NULL,
  "slug" VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE "contexts" (
  "id" SERIAL PRIMARY KEY,
  "type" "ContextType" NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "category" VARCHAR(100),
  "address" VARCHAR(500),
  "latitude" FLOAT,
  "longitude" FLOAT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL
);

CREATE TABLE "article_contexts" (
  "article_id" INT NOT NULL,
  "context_id" INT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY ("article_id", "context_id")
);

-- DISCOVERY MODELS
CREATE TABLE "series" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "author_id" INT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL
);

CREATE TABLE "series_articles" (
  "series_id" INT NOT NULL,
  "article_id" INT NOT NULL,
  "order" INT NOT NULL,
  PRIMARY KEY ("series_id", "article_id")
);

-- GAMIFICATION MODELS
CREATE TABLE "badges" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) UNIQUE NOT NULL,
  "description" TEXT,
  "icon_url" VARCHAR(500),
  "criteria" TEXT
);

CREATE TABLE "user_badges" (
  "user_id" INT NOT NULL,
  "badge_id" INT NOT NULL,
  "awarded_at" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY ("user_id", "badge_id")
);

CREATE TABLE "votes" (
  "id" SERIAL PRIMARY KEY,
  "type" VARCHAR(10) NOT NULL,
  "user_id" INT NOT NULL,
  "article_id" INT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "point_transactions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "amount" FLOAT NOT NULL,
  "reason_code" VARCHAR(50) NOT NULL,
  "ref_id" INT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "transactions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "type" VARCHAR(20) NOT NULL,
  "token" VARCHAR(10) NOT NULL,
  "amount" FLOAT NOT NULL,
  "metadata" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- NEW MODELS FOR MVP
CREATE TABLE "interactions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "article_id" INT NOT NULL,
  "type" "InteractionType" NOT NULL,
  "time_spent_ms" INT,
  "scroll_depth_percent" INT,
  "location_lat" FLOAT,
  "location_long" FLOAT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "suggestions" (
  "id" SERIAL PRIMARY KEY,
  "author_id" INT NOT NULL,
  "article_id" INT NOT NULL,
  "content" TEXT NOT NULL,
  "status" "SuggestionStatus" DEFAULT 'pending',
  "comment" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL
);

-- FOREIGN KEYS
ALTER TABLE "refresh_tokens" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "user_profiles" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "conversations" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "messages" ADD FOREIGN KEY ("conversation_id") REFERENCES "conversations" ("id") ON DELETE CASCADE;
ALTER TABLE "favorite_locations" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "Place" ADD FOREIGN KEY ("authorId") REFERENCES "users" ("id");
ALTER TABLE "restaurants" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "articles" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");
ALTER TABLE "articles" ADD FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "article_histories" ADD FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE;
ALTER TABLE "article_histories" ADD FOREIGN KEY ("editor_id") REFERENCES "users" ("id");
ALTER TABLE "categories" ADD FOREIGN KEY ("parent_id") REFERENCES "categories" ("id");
ALTER TABLE "article_contexts" ADD FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE;
ALTER TABLE "article_contexts" ADD FOREIGN KEY ("context_id") REFERENCES "contexts" ("id") ON DELETE CASCADE;
ALTER TABLE "series" ADD FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "series_articles" ADD FOREIGN KEY ("series_id") REFERENCES "series" ("id") ON DELETE CASCADE;
ALTER TABLE "series_articles" ADD FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE;
ALTER TABLE "user_badges" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "user_badges" ADD FOREIGN KEY ("badge_id") REFERENCES "badges" ("id") ON DELETE CASCADE;
ALTER TABLE "votes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "votes" ADD FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE;
ALTER TABLE "point_transactions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "transactions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "interactions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "interactions" ADD FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE;
ALTER TABLE "suggestions" ADD FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "suggestions" ADD FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE;

-- MANY-TO-MANY RELATIONSHIPS (Implied by Prisma)
-- Article <-> Tag
CREATE TABLE "_ArticleToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    FOREIGN KEY ("A") REFERENCES "articles"("id") ON DELETE CASCADE,
    FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "_ArticleToTag_AB_unique" ON "_ArticleToTag"("A", "B");
CREATE INDEX "_ArticleToTag_B_index" ON "_ArticleToTag"("B");
