-- Add Google OAuth2 fields to users table
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) NULL UNIQUE,
ADD COLUMN given_name VARCHAR(100) NULL,
ADD COLUMN family_name VARCHAR(100) NULL,
ADD COLUMN full_name VARCHAR(200) NULL,
ADD COLUMN profile_picture VARCHAR(500) NULL,
ADD COLUMN locale VARCHAR(10) NULL DEFAULT 'en',
ADD COLUMN auth_provider ENUM('local', 'google') NOT NULL DEFAULT 'local',
ADD INDEX idx_google_id (google_id),
ADD INDEX idx_auth_provider (auth_provider);

-- Make password_hash nullable for OAuth users
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;