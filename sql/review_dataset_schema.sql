-- ========================================================================
-- RESTAURANT REVIEW DATASET DATABASE SCHEMA
-- ========================================================================
-- Purpose: Large-scale restaurant review datasets storage and analysis
-- Database: review_dataset
-- Engine: InnoDB with UTF-8 support for international content
-- Created: September 2025
-- ========================================================================

-- Create database with proper charset for international content and emojis
CREATE DATABASE IF NOT EXISTS review_dataset
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE review_dataset;

-- ========================================================================
-- MAIN REVIEWS TABLE
-- ========================================================================
-- Stores all raw review data from multiple sources (Google Maps, Foody, etc.)
-- Designed for high-volume inserts and efficient querying
-- ========================================================================

CREATE TABLE IF NOT EXISTS reviews_raw (
  -- Primary identifier
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  -- Restaurant/Place identification
  place_id VARCHAR(64) NOT NULL COMMENT 'Google Maps place_id or unique restaurant identifier',
  place_name VARCHAR(255) NOT NULL COMMENT 'Restaurant/business name',
  address VARCHAR(512) NULL COMMENT 'Full address of the restaurant',
  
  -- Aggregated place metrics
  avg_rating FLOAT NULL COMMENT 'Average rating of the restaurant (0.0-5.0)',
  total_review INT UNSIGNED NULL COMMENT 'Total number of reviews for this place',
  
  -- Individual review data
  reviewer VARCHAR(128) NULL COMMENT 'Reviewer name or user ID (may be anonymized)',
  review_rating TINYINT UNSIGNED NULL COMMENT 'Individual review rating (1-5 scale)',
  review_text LONGTEXT NULL COMMENT 'Full review text content - supports emojis and unicode',
  review_time VARCHAR(64) NULL COMMENT 'Review timestamp (relative or ISO format)',
  
  -- Data source and tracking
  source VARCHAR(64) NOT NULL DEFAULT 'Unknown' COMMENT 'Data source: GoogleMaps, Foody, TripAdvisor, etc.',
  batch_id INT UNSIGNED NULL COMMENT 'Batch identifier for bulk imports and data tracking',
  
  -- System timestamps
  crawltime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When this record was crawled/inserted',
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last modification timestamp',
  
  -- Performance indexes
  INDEX idx_reviews_place_id (place_id) COMMENT 'Fast lookup by place identifier',
  INDEX idx_reviews_reviewer (reviewer) COMMENT 'Query reviews by specific reviewer',
  INDEX idx_reviews_rating (review_rating) COMMENT 'Filter by rating scores',
  INDEX idx_reviews_source (source) COMMENT 'Filter by data source',
  INDEX idx_reviews_batch (batch_id) COMMENT 'Track import batches',
  INDEX idx_reviews_crawltime (crawltime) COMMENT 'Time-based queries and cleanup',
  
  -- Composite indexes for common query patterns
  INDEX idx_reviews_place_rating (place_id, review_rating) COMMENT 'Place-specific rating analysis',
  INDEX idx_reviews_source_batch (source, batch_id) COMMENT 'Source-specific batch tracking'
  
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='Raw restaurant review data from multiple sources - optimized for large datasets';

-- ========================================================================
-- PLACES METADATA TABLE
-- ========================================================================
-- Normalized place information for efficient lookups and geographical queries
-- Reduces data redundancy and enables spatial analysis
-- ========================================================================

CREATE TABLE IF NOT EXISTS places_meta_dataset (
  -- Primary place identifier
  place_id VARCHAR(64) NOT NULL PRIMARY KEY COMMENT 'Unique place identifier (matches reviews_raw.place_id)',
  
  -- Basic place information
  name VARCHAR(255) NOT NULL COMMENT 'Canonical restaurant/business name',
  address VARCHAR(512) NULL COMMENT 'Complete address',
  
  -- Geographical coordinates for spatial queries
  lat DECIMAL(10, 8) NULL COMMENT 'Latitude coordinate (8 decimal precision for ~1mm accuracy)',
  lng DECIMAL(11, 8) NULL COMMENT 'Longitude coordinate (8 decimal precision for ~1mm accuracy)',
  
  -- Aggregated metrics (computed from reviews_raw)
  avg_rating DECIMAL(3, 2) NULL COMMENT 'Computed average rating (0.00-5.00)',
  total_review INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total count of reviews',
  
  -- Data quality and tracking
  source_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Number of different sources with data for this place',
  first_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When this place was first recorded',
  last_updated DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last time place data was updated',
  
  -- Geographical indexing for location-based queries
  INDEX idx_places_location (lat, lng) COMMENT 'Spatial queries and nearby searches',
  INDEX idx_places_rating (avg_rating) COMMENT 'Filter by average rating',
  INDEX idx_places_review_count (total_review) COMMENT 'Sort by popularity/review volume',
  INDEX idx_places_name (name) COMMENT 'Search by restaurant name'
  
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='Normalized place metadata for efficient lookups and geographical analysis';

-- ========================================================================
-- DATA SOURCE TRACKING TABLE (Optional)
-- ========================================================================
-- Track different data sources and their import statistics
-- ========================================================================

CREATE TABLE IF NOT EXISTS data_sources (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source_name VARCHAR(64) NOT NULL UNIQUE COMMENT 'Source identifier (GoogleMaps, Foody, etc.)',
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

-- ========================================================================
-- IMPORT BATCHES TABLE (Optional)
-- ========================================================================
-- Track bulk import operations for data lineage and quality control
-- ========================================================================

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

-- ========================================================================
-- SAMPLE DATA INSERTION
-- ========================================================================
-- Insert sample data sources for reference
-- ========================================================================

INSERT INTO data_sources (source_name, description, base_url) VALUES
('GoogleMaps', 'Google Maps Place Reviews API', 'https://maps.googleapis.com/'),
('Foody', 'Foody Vietnam Restaurant Reviews', 'https://www.foody.vn/'),
('TripAdvisor', 'TripAdvisor Restaurant Reviews', 'https://www.tripadvisor.com/'),
('Yelp', 'Yelp Business Reviews', 'https://www.yelp.com/'),
('Manual', 'Manually collected reviews', NULL)
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ========================================================================
-- USEFUL VIEWS FOR ANALYSIS
-- ========================================================================

-- View: Places with review statistics
CREATE OR REPLACE VIEW places_with_stats AS
SELECT 
    p.place_id,
    p.name,
    p.address,
    p.lat,
    p.lng,
    p.avg_rating as meta_avg_rating,
    p.total_review as meta_total_reviews,
    COUNT(r.id) as actual_review_count,
    AVG(r.review_rating) as computed_avg_rating,
    MIN(r.crawltime) as first_review_date,
    MAX(r.crawltime) as latest_review_date,
    COUNT(DISTINCT r.source) as source_diversity
FROM places_meta_dataset p
LEFT JOIN reviews_raw r ON p.place_id = r.place_id
GROUP BY p.place_id, p.name, p.address, p.lat, p.lng, p.avg_rating, p.total_review;

-- View: Recent reviews with place info
CREATE OR REPLACE VIEW recent_reviews AS
SELECT 
    r.id,
    r.place_id,
    p.name as place_name,
    p.address,
    r.reviewer,
    r.review_rating,
    LEFT(r.review_text, 200) as review_excerpt,
    r.review_time,
    r.source,
    r.crawltime
FROM reviews_raw r
JOIN places_meta_dataset p ON r.place_id = p.place_id
ORDER BY r.crawltime DESC;

-- ========================================================================
-- PERFORMANCE OPTIMIZATION NOTES
-- ========================================================================
/*
For large-scale datasets (millions of reviews), consider:

1. Partitioning reviews_raw by crawltime (monthly/yearly partitions)
2. Separate read replicas for analytics queries
3. Regular index optimization: ANALYZE TABLE reviews_raw;
4. Archive old data to separate tables
5. Use batch inserts with LOAD DATA INFILE for bulk imports
6. Consider column compression for review_text if using MySQL 8.0+

Example partitioning (MySQL 8.0+):
ALTER TABLE reviews_raw 
PARTITION BY RANGE (YEAR(crawltime)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
*/

-- ========================================================================
-- CLEANUP AND MAINTENANCE PROCEDURES
-- ========================================================================

-- Procedure to update place metadata from reviews
DELIMITER //
CREATE OR REPLACE PROCEDURE UpdatePlaceMetadata()
BEGIN
    -- Update aggregated statistics in places_meta_dataset
    INSERT INTO places_meta_dataset (
        place_id, name, address, avg_rating, total_review, source_count, last_updated
    )
    SELECT 
        r.place_id,
        r.place_name,
        r.address,
        AVG(r.review_rating) as avg_rating,
        COUNT(*) as total_review,
        COUNT(DISTINCT r.source) as source_count,
        NOW() as last_updated
    FROM reviews_raw r
    WHERE r.place_id NOT IN (SELECT place_id FROM places_meta_dataset)
    GROUP BY r.place_id, r.place_name, r.address
    
    ON DUPLICATE KEY UPDATE
        avg_rating = VALUES(avg_rating),
        total_review = VALUES(total_review),
        source_count = VALUES(source_count),
        last_updated = VALUES(last_updated);
END //
DELIMITER ;

-- ========================================================================
-- SCHEMA VALIDATION
-- ========================================================================
SHOW TABLES;
DESCRIBE reviews_raw;
DESCRIBE places_meta_dataset;

-- ========================================================================
-- SUCCESS MESSAGE
-- ========================================================================
SELECT 
    'review_dataset database created successfully!' as message,
    'Tables: reviews_raw, places_meta_dataset, data_sources, import_batches' as tables_created,
    'Ready for large-scale restaurant review data import' as status;
