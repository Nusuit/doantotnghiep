INSERT INTO roles(`key`, name) VALUES
  ('USER','User'),
  ('ADMIN','Administrator')
ON DUPLICATE KEY UPDATE name = VALUES(name);
