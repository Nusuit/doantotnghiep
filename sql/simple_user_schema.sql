-- SIMPLIFIED USER SCHEMA - CHỈ CẦN THIẾT
-- Loại bỏ các bảng thừa, giữ lại chỉ những gì thực sự cần

-- 1. BẢNG AUTHENTICATION - Thông tin đăng nhập và bảo mật
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Trạng thái tài khoản
  account_status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Role đơn giản (không cần bảng riêng cho business này)
  role ENUM('user', 'admin', 'moderator') NOT NULL DEFAULT 'user',
  
  -- Thông tin login
  last_login_at TIMESTAMP NULL,
  login_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMP NULL,
  
  -- Security tokens (chỉ khi cần)
  password_reset_token VARCHAR(255) NULL,
  password_reset_expires_at TIMESTAMP NULL,
  email_verification_token VARCHAR(255) NULL,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes cần thiết
  INDEX idx_email (email),
  INDEX idx_account_status (account_status),
  INDEX idx_role (role),
  INDEX idx_password_reset_token (password_reset_token)
) ENGINE=InnoDB COMMENT='User authentication and basic info';

-- 2. BẢNG PROFILE - Thông tin cá nhân chi tiết
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  
  -- Thông tin hiển thị
  display_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(50) NULL,
  last_name VARCHAR(50) NULL,
  avatar_url VARCHAR(500) NULL,
  
  -- Thông tin cá nhân
  bio TEXT NULL,
  birth_date DATE NULL,
  gender ENUM('male', 'female', 'other') NULL,
  phone_number VARCHAR(20) NULL,
  
  -- Địa chỉ
  country VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  address TEXT NULL,
  
  -- Preferences
  language VARCHAR(5) NOT NULL DEFAULT 'vi',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  is_profile_public BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Notifications
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  UNIQUE INDEX idx_user_id (user_id),
  INDEX idx_display_name (display_name),
  INDEX idx_is_public (is_profile_public)
) ENGINE=InnoDB COMMENT='User profile and personal information';

-- VIEW để query dễ dàng
CREATE OR REPLACE VIEW user_complete_view AS
SELECT 
    u.id,
    u.email,
    u.account_status,
    u.is_email_verified,
    u.role,
    u.last_login_at,
    u.created_at as registered_at,
    
    p.display_name,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.bio,
    p.birth_date,
    p.gender,
    p.phone_number,
    p.country,
    p.city,
    p.language,
    p.is_profile_public,
    p.updated_at as profile_updated_at
FROM users u
LEFT JOIN user_profiles p ON u.id = p.user_id;