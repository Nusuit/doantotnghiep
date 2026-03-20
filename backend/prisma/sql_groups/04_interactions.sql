-- ENUMS
CREATE TYPE "InteractionType" AS ENUM ('view', 'save', 'suggest', 'report', 'upvote');
CREATE TYPE "SuggestionStatus" AS ENUM ('pending', 'accepted', 'rejected');

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
