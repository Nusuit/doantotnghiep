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

-- FOREIGN KEYS
ALTER TABLE "conversations" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "messages" ADD FOREIGN KEY ("conversation_id") REFERENCES "conversations" ("id") ON DELETE CASCADE;
