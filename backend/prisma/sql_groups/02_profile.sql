CREATE TABLE "user_profiles" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "display_name" VARCHAR(100) NOT NULL,
  "avatar_url" VARCHAR(500),
  "bio" TEXT,
  "is_profile_public" BOOLEAN NOT NULL DEFAULT TRUE,
  "first_name" VARCHAR(50),
  "last_name" VARCHAR(50),
  "language" VARCHAR(5) NOT NULL DEFAULT 'vi',
  "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  "email_notifications" BOOLEAN NOT NULL DEFAULT TRUE,
  "push_notifications" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_user_profiles_display_name" ON "user_profiles" ("display_name");
CREATE INDEX "idx_user_profiles_is_public" ON "user_profiles" ("is_profile_public");
