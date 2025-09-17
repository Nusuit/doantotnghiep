-- MIGRATION SCRIPT: Split Users Table into Authentication and Profile Tables
-- This script safely migrates data from the old users table to the new normalized structure

-- Step 1: Create the new tables (run user_split_schema.sql first)

-- Step 2: Backup existing users table
CREATE TABLE users_backup AS SELECT * FROM users;

-- Step 3: Migrate data to user_authentications table
INSERT INTO user_authentications (
    id,
    email,
    password_hash,
    is_email_verified,
    last_login_at,
    account_status,
    two_factor_enabled,
    login_attempts,
    locked_until,
    password_reset_token,
    password_reset_expires_at,
    email_verification_token,
    email_verification_expires_at,
    created_at,
    updated_at
)
SELECT 
    id,
    email,
    password_hash,
    is_email_verified,
    last_login_at,
    account_status,
    two_factor_enabled,
    0, -- login_attempts default
    NULL, -- locked_until default
    NULL, -- password_reset_token default
    NULL, -- password_reset_expires_at default
    NULL, -- email_verification_token default
    NULL, -- email_verification_expires_at default
    created_at,
    updated_at
FROM users;

-- Step 4: Migrate data to user_profiles table
INSERT INTO user_profiles (
    auth_user_id,
    display_name,
    first_name,
    last_name,
    bio,
    profile_picture_url,
    birth_date,
    gender,
    phone_number,
    country,
    city,
    language,
    timezone,
    is_profile_public,
    receive_notifications,
    receive_marketing,
    profile_completed_at,
    profile_completion_percentage,
    created_at,
    updated_at
)
SELECT 
    id, -- auth_user_id (FK to user_authentications.id)
    COALESCE(name, SUBSTRING_INDEX(email, '@', 1)), -- display_name from name or email prefix
    NULL, -- first_name (to be filled later)
    NULL, -- last_name (to be filled later)
    NULL, -- bio default
    profile_picture_url,
    NULL, -- birth_date default
    NULL, -- gender default
    NULL, -- phone_number default
    NULL, -- country default
    NULL, -- city default
    'vi', -- language default
    'Asia/Ho_Chi_Minh', -- timezone default
    TRUE, -- is_profile_public default
    TRUE, -- receive_notifications default
    FALSE, -- receive_marketing default
    CASE 
        WHEN name IS NOT NULL AND name != '' AND profile_picture_url IS NOT NULL 
        THEN created_at 
        ELSE NULL 
    END, -- profile_completed_at
    CASE 
        WHEN name IS NOT NULL AND name != '' THEN 40
        ELSE 20
    END, -- profile_completion_percentage
    created_at,
    updated_at
FROM users;

-- Step 5: Verify data migration
-- Check counts match
SELECT 
    'user_authentications' as table_name, COUNT(*) as count 
FROM user_authentications
UNION ALL
SELECT 
    'user_profiles' as table_name, COUNT(*) as count 
FROM user_profiles
UNION ALL
SELECT 
    'original_users' as table_name, COUNT(*) as count 
FROM users;

-- Check data integrity
SELECT 
    ua.id,
    ua.email,
    up.display_name,
    up.auth_user_id
FROM user_authentications ua
LEFT JOIN user_profiles up ON ua.id = up.auth_user_id
WHERE up.auth_user_id IS NULL
LIMIT 5;

-- Step 6: Update foreign key references in other tables
-- Update refresh_tokens table to use new user_authentications reference
-- (Already handled in schema file via ALTER TABLE)

-- Update user_roles table to use new user_authentications reference  
-- (Already handled in schema file via ALTER TABLE)

-- Step 7: Test the view works correctly
SELECT * FROM user_complete_info LIMIT 5;

-- Step 8: Optional - Drop old users table (ONLY after thorough testing)
-- RENAME TABLE users TO users_old_deprecated;

-- Step 9: Update any stored procedures or functions that reference users table
-- (Add custom procedures here if they exist)

-- Performance optimization: Analyze tables after migration
ANALYZE TABLE user_authentications;
ANALYZE TABLE user_profiles;

-- Final verification query
SELECT 
    'Migration completed successfully' as status,
    (SELECT COUNT(*) FROM user_authentications) as auth_records,
    (SELECT COUNT(*) FROM user_profiles) as profile_records,
    (SELECT COUNT(*) FROM users_backup) as original_records;