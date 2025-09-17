-- MIGRATION SCRIPT - CHUYỂN ĐỔI SANG SCHEMA ĐỠN GIẢN
-- Script này sẽ chuyển từ schema phức tạp sang schema đơn giản chỉ 2 bảng

-- Bước 1: Tạo bảng backup nếu có data quan trọng
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users WHERE 1=0; -- Tạo cấu trúc backup

-- Bước 2: Drop các bảng không cần thiết (nếu tồn tại)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles; 
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS user_authentications;
DROP VIEW IF EXISTS user_complete_info;

SET FOREIGN_KEY_CHECKS = 1;

-- Bước 3: Tạo lại schema đơn giản
-- (Chạy file simple_user_schema.sql)

-- Bước 4: Seed data mẫu cho roles
-- Không cần bảng roles riêng, role được lưu trực tiếp trong users table

-- Bước 5: Tạo user admin mặc định
INSERT IGNORE INTO users (email, password_hash, role, account_status, is_email_verified) 
VALUES ('admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7YloCuJRWK', 'admin', 'active', TRUE);

-- Lấy user_id của admin vừa tạo và tạo profile
SET @admin_user_id = LAST_INSERT_ID();

INSERT IGNORE INTO user_profiles (user_id, display_name, first_name, last_name)
VALUES (@admin_user_id, 'System Admin', 'System', 'Administrator');

-- Bước 6: Tạo user test
INSERT IGNORE INTO users (email, password_hash, role, account_status, is_email_verified)
VALUES ('user@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7YloCuJRWK', 'user', 'active', TRUE);

SET @test_user_id = LAST_INSERT_ID();

INSERT IGNORE INTO user_profiles (user_id, display_name, first_name, last_name, bio)
VALUES (@test_user_id, 'Test User', 'Test', 'User', 'This is a test user profile');

-- Bước 7: Verify migration
SELECT 'Migration completed' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_profiles FROM user_profiles;
SELECT * FROM user_complete_view;