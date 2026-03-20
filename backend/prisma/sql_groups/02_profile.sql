-- ENUMS
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

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

-- FOREIGN KEYS
ALTER TABLE "user_profiles" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
