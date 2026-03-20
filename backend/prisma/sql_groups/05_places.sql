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

-- FOREIGN KEYS
ALTER TABLE "favorite_locations" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "Place" ADD FOREIGN KEY ("authorId") REFERENCES "users" ("id");
ALTER TABLE "restaurants" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
