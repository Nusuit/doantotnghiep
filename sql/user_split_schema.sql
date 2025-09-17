-- USER AUTHENTICATIONS AND PROFILES SCHEMA
-- Split users table into normalized authentication and profile tables

-- USER AUTHENTICATIONS TABLE - Security and login data only
CREATE TABLE IF NOT EXISTS user_authentications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMP NULL,
  account_status ENUM('active','suspended','banned','pending','locked') NOT NULL DEFAULT 'active',
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Additional security fields
  login_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until TIMESTAMP NULL,
  password_reset_token VARCHAR(255) NULL,
  password_reset_expires_at TIMESTAMP NULL,
  email_verification_token VARCHAR(255) NULL,
  email_verification_expires_at TIMESTAMP NULL,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_ua_email (email),
  INDEX idx_ua_account_status (account_status),
  INDEX idx_ua_password_reset_token (password_reset_token),
  INDEX idx_ua_email_verification_token (email_verification_token),
  INDEX idx_ua_locked_until (locked_until)
) ENGINE=InnoDB COMMENT='User authentication and security data';

-- USER PROFILES TABLE - Personal information and preferences
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  auth_user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  
  -- Display information
  display_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(50) NULL,
  last_name VARCHAR(50) NULL,
  bio TEXT NULL,
  profile_picture_url VARCHAR(500) NULL,
  
  -- Personal details
  birth_date DATE NULL,
  gender ENUM('male','female','other','prefer_not_to_say') NULL,
  phone_number VARCHAR(20) NULL,
  country VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  
  -- Preferences
  language VARCHAR(5) NOT NULL DEFAULT 'vi',
  timezone VARCHAR(50) NULL DEFAULT 'Asia/Ho_Chi_Minh',
  is_profile_public BOOLEAN NOT NULL DEFAULT TRUE,
  receive_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  receive_marketing BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Profile completion tracking
  profile_completed_at TIMESTAMP NULL,
  profile_completion_percentage TINYINT UNSIGNED NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT fk_up_auth_user FOREIGN KEY (auth_user_id) REFERENCES user_authentications(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_up_display_name (display_name),
  INDEX idx_up_country_city (country, city),
  INDEX idx_up_is_public (is_profile_public),
  INDEX idx_up_completion (profile_completion_percentage)
) ENGINE=InnoDB COMMENT='User profile and personal information';

-- UPDATE EXISTING TABLES TO REFERENCE NEW STRUCTURE
-- Update refresh_tokens to reference user_authentications
ALTER TABLE refresh_tokens 
DROP FOREIGN KEY fk_rt_user,
ADD CONSTRAINT fk_rt_auth_user FOREIGN KEY (user_id) REFERENCES user_authentications(id) ON DELETE CASCADE;

-- Update user_roles to reference user_authentications  
ALTER TABLE user_roles
DROP FOREIGN KEY fk_user_roles_user,
ADD CONSTRAINT fk_user_roles_auth_user FOREIGN KEY (user_id) REFERENCES user_authentications(id) ON DELETE CASCADE;

-- Add helpful views for common queries
CREATE OR REPLACE VIEW user_complete_info AS
SELECT 
    ua.id as auth_id,
    ua.email,
    ua.is_email_verified,
    ua.last_login_at,
    ua.account_status,
    ua.two_factor_enabled,
    ua.login_attempts,
    ua.locked_until,
    ua.created_at as registered_at,
    
    up.id as profile_id,
    up.display_name,
    up.first_name,
    up.last_name,
    up.bio,
    up.profile_picture_url,
    up.birth_date,
    up.gender,
    up.phone_number,
    up.country,
    up.city,
    up.language,
    up.timezone,
    up.is_profile_public,
    up.receive_notifications,
    up.receive_marketing,
    up.profile_completed_at,
    up.profile_completion_percentage,
    up.updated_at as profile_updated_at
FROM user_authentications ua
LEFT JOIN user_profiles up ON ua.id = up.auth_user_id;