-- Fix user_profiles table updated_at column
-- Run this SQL in your MySQL client

USE knowledge;

-- Fix updated_at column to have proper default value
ALTER TABLE user_profiles 
MODIFY COLUMN updated_at DATETIME(3) NOT NULL 
DEFAULT CURRENT_TIMESTAMP(3) 
ON UPDATE CURRENT_TIMESTAMP(3);

-- Verify the change
DESCRIBE user_profiles;