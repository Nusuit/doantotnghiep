-- BẢNG PENDING USERS - Lưu users chờ email verification
CREATE TABLE IF NOT EXISTS pending_users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  
  -- Token verification
  verification_token VARCHAR(255) NOT NULL UNIQUE,
  token_expires_at TIMESTAMP NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_email (email),
  INDEX idx_token (verification_token),
  INDEX idx_expires (token_expires_at)
) ENGINE=InnoDB COMMENT='Users pending email verification';

-- Cleanup old pending users (older than 24 hours)
-- Bạn có thể chạy lệnh này định kỳ
-- DELETE FROM pending_users WHERE token_expires_at < NOW();