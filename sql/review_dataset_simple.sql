-- Create database
CREATE DATABASE IF NOT EXISTS review_dataset
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE review_dataset;

-- Main reviews table
CREATE TABLE IF NOT EXISTS reviews_raw (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  place_id VARCHAR(64) NOT NULL COMMENT 'Google Maps place_id or unique restaurant identifier',
  place_name VARCHAR(255) NOT NULL COMMENT 'Restaurant/business name',
  address VARCHAR(512) NULL COMMENT 'Full address of the restaurant',
  avg_rating FLOAT NULL COMMENT 'Average rating of the restaurant (0.0-5.0)',
  total_review INT UNSIGNED NULL COMMENT 'Total number of reviews for this place',
  reviewer VARCHAR(128) NULL COMMENT 'Reviewer name or user ID',
  review_rating TINYINT UNSIGNED NULL COMMENT 'Individual review rating (1-5 scale)',
  review_text LONGTEXT NULL COMMENT 'Full review text content - supports emojis and unicode',
  review_time VARCHAR(64) NULL COMMENT 'Review timestamp',
  source VARCHAR(64) NOT NULL DEFAULT 'Unknown' COMMENT 'Data source: GoogleMaps, Foody, TripAdvisor, etc.',
  batch_id INT UNSIGNED NULL COMMENT 'Batch identifier for bulk imports',
  crawltime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When this record was crawled/inserted',
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last modification timestamp',
  
  INDEX idx_reviews_place_id (place_id),
  INDEX idx_reviews_reviewer (reviewer),
  INDEX idx_reviews_rating (review_rating),
  INDEX idx_reviews_source (source),
  INDEX idx_reviews_batch (batch_id),
  INDEX idx_reviews_crawltime (crawltime),
  INDEX idx_reviews_place_rating (place_id, review_rating),
  INDEX idx_reviews_source_batch (source, batch_id)
  
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='Raw restaurant review data from multiple sources';

-- Places metadata table
CREATE TABLE IF NOT EXISTS places_meta_dataset (
  place_id VARCHAR(64) NOT NULL PRIMARY KEY COMMENT 'Unique place identifier',
  name VARCHAR(255) NOT NULL COMMENT 'Canonical restaurant/business name',
  address VARCHAR(512) NULL COMMENT 'Complete address',
  lat DECIMAL(10, 8) NULL COMMENT 'Latitude coordinate',
  lng DECIMAL(11, 8) NULL COMMENT 'Longitude coordinate',
  avg_rating DECIMAL(3, 2) NULL COMMENT 'Computed average rating (0.00-5.00)',
  total_review INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total count of reviews',
  source_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Number of different sources',
  first_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When this place was first recorded',
  last_updated DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last time place data was updated',
  
  INDEX idx_places_location (lat, lng),
  INDEX idx_places_rating (avg_rating),
  INDEX idx_places_review_count (total_review),
  INDEX idx_places_name (name)
  
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='Normalized place metadata for efficient lookups';

-- Data sources tracking table
CREATE TABLE IF NOT EXISTS data_sources (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source_name VARCHAR(64) NOT NULL UNIQUE COMMENT 'Source identifier',
  description TEXT NULL COMMENT 'Description of the data source',
  base_url VARCHAR(255) NULL COMMENT 'Base URL or API endpoint',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether this source is currently being used',
  total_records INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total records imported from this source',
  last_import DATETIME NULL COMMENT 'Timestamp of last successful import',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_sources_active (is_active),
  INDEX idx_sources_last_import (last_import)
  
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='Track data sources and import statistics';

-- Import batches tracking table
CREATE TABLE IF NOT EXISTS import_batches (
  batch_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source_id INT UNSIGNED NULL COMMENT 'Reference to data_sources table',
  description TEXT NULL COMMENT 'Description of this import batch',
  file_name VARCHAR(255) NULL COMMENT 'Source file name if applicable',
  total_rows INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total rows processed',
  successful_rows INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Successfully imported rows',
  failed_rows INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Failed import rows',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  status ENUM('running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'running',
  error_log TEXT NULL COMMENT 'Error messages and logs',
  
  INDEX idx_batches_source (source_id),
  INDEX idx_batches_status (status),
  INDEX idx_batches_started (started_at),
  
  CONSTRAINT fk_batches_source 
    FOREIGN KEY (source_id) REFERENCES data_sources(id) 
    ON DELETE SET NULL
    
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='Track import batch operations and statistics';

-- Insert sample data sources
INSERT INTO data_sources (source_name, description, base_url) VALUES
('GoogleMaps', 'Google Maps Place Reviews API', 'https://maps.googleapis.com/'),
('Foody', 'Foody Vietnam Restaurant Reviews', 'https://www.foody.vn/'),
('TripAdvisor', 'TripAdvisor Restaurant Reviews', 'https://www.tripadvisor.com/'),
('Yelp', 'Yelp Business Reviews', 'https://www.yelp.com/'),
('Manual', 'Manually collected reviews', NULL)
ON DUPLICATE KEY UPDATE description = VALUES(description);
