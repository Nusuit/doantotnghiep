-- Migration: Add profile fields to users table
-- Date: 2025-09-17

USE knowledge;

-- Add profile columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS date_of_birth DATE NULL AFTER email,
ADD COLUMN IF NOT EXISTS gender ENUM('male', 'female', 'other') NULL AFTER date_of_birth,
ADD COLUMN IF NOT EXISTS food_preferences JSON NULL AFTER gender,
ADD COLUMN IF NOT EXISTS price_range VARCHAR(50) NULL AFTER food_preferences,
ADD COLUMN IF NOT EXISTS preferred_location VARCHAR(255) NULL AFTER price_range,
ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN NOT NULL DEFAULT FALSE AFTER preferred_location;

-- Update existing schema columns for OAuth support
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULL UNIQUE AFTER email,
ADD COLUMN IF NOT EXISTS given_name VARCHAR(100) NULL AFTER google_id,
ADD COLUMN IF NOT EXISTS family_name VARCHAR(100) NULL AFTER given_name,
ADD COLUMN IF NOT EXISTS full_name VARCHAR(200) NULL AFTER family_name,
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500) NULL AFTER full_name,
ADD COLUMN IF NOT EXISTS locale VARCHAR(10) NULL AFTER profile_picture,
ADD COLUMN IF NOT EXISTS auth_provider ENUM('local', 'google') NOT NULL DEFAULT 'local' AFTER locale,
ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'user' AFTER auth_provider;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);
CREATE INDEX IF NOT EXISTS idx_users_profile_complete ON users(profile_complete);

-- Show table structure
DESCRIBE users;