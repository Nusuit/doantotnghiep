-- ========================================================================
-- REVIEW DATASET SCHEMA MIGRATION
-- ========================================================================
-- Purpose: Migrate reviews_raw table to unified multi-platform structure
-- Target: Support Google Maps, Yelp, VSA, SNAP and other review sources
-- Date: September 10, 2025
-- ========================================================================

USE review_dataset;

-- ========================================================================
-- BACKUP EXISTING DATA
-- ========================================================================
-- Create backup table before migration
CREATE TABLE IF NOT EXISTS reviews_raw_backup AS 
SELECT * FROM reviews_raw;

-- Verify backup
SELECT COUNT(*) as backup_count FROM reviews_raw_backup;
SELECT COUNT(*) as original_count FROM reviews_raw;

-- ========================================================================
-- MIGRATION STRATEGY
-- ========================================================================
-- Option 1: ALTER existing table (preserve data)
-- Option 2: CREATE new table and migrate data
-- We'll use Option 1 for data preservation

-- ========================================================================
-- STEP 1: DROP EXISTING INDEXES (will be recreated with new structure)
-- ========================================================================
DROP INDEX IF EXISTS idx_reviews_place_id ON reviews_raw;
DROP INDEX IF EXISTS idx_reviews_reviewer ON reviews_raw;
DROP INDEX IF EXISTS idx_reviews_rating ON reviews_raw;
DROP INDEX IF EXISTS idx_reviews_source ON reviews_raw;
DROP INDEX IF EXISTS idx_reviews_batch ON reviews_raw;
DROP INDEX IF EXISTS idx_reviews_crawltime ON reviews_raw;
DROP INDEX IF EXISTS idx_reviews_place_rating ON reviews_raw;
DROP INDEX IF EXISTS idx_reviews_source_batch ON reviews_raw;

-- ========================================================================
-- STEP 2: ALTER TABLE STRUCTURE TO MATCH NEW SCHEMA
-- ========================================================================

-- Rename existing columns to match new schema
ALTER TABLE reviews_raw 
CHANGE COLUMN place_name name VARCHAR(255) NULL COMMENT 'Restaurant/business name',
CHANGE COLUMN reviewer review_author VARCHAR(128) NULL COMMENT 'Review author name or ID',
CHANGE COLUMN avg_rating rating FLOAT NULL COMMENT 'Overall place rating (0.0-5.0)',
CHANGE COLUMN total_review user_ratings_total INT NULL COMMENT 'Total number of user ratings';

-- Add new required columns
ALTER TABLE reviews_raw 
ADD COLUMN country VARCHAR(64) NULL COMMENT 'Country of the place' AFTER address;

-- Modify existing columns to match new requirements
ALTER TABLE reviews_raw 
MODIFY COLUMN place_id VARCHAR(64) NULL COMMENT 'Unique place identifier from source platform',
MODIFY COLUMN name VARCHAR(255) NULL COMMENT 'Restaurant/business name',
MODIFY COLUMN address VARCHAR(512) NULL COMMENT 'Full address of the place',
MODIFY COLUMN rating FLOAT NULL COMMENT 'Overall place rating (0.0-5.0)',
MODIFY COLUMN user_ratings_total INT NULL COMMENT 'Total number of user ratings',
MODIFY COLUMN review_author VARCHAR(128) NULL COMMENT 'Review author name or ID',
MODIFY COLUMN review_rating FLOAT NULL COMMENT 'Individual review rating (1.0-5.0)',
MODIFY COLUMN review_text LONGTEXT NULL COMMENT 'Full review text - supports emoji and unicode',
MODIFY COLUMN review_time VARCHAR(64) NULL COMMENT 'Review timestamp (can be datetime or text)',
MODIFY COLUMN source VARCHAR(64) NULL COMMENT 'Review source platform (Google, Yelp, VSA, SNAP, etc.)';

-- Remove columns that are not needed in new schema
ALTER TABLE reviews_raw 
DROP COLUMN IF EXISTS batch_id,
DROP COLUMN IF EXISTS updated_at;

-- Ensure crawltime has proper default
ALTER TABLE reviews_raw 
MODIFY COLUMN crawltime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When this record was crawled/inserted';

-- ========================================================================
-- STEP 3: CREATE NEW OPTIMIZED INDEXES
-- ========================================================================

-- Primary composite index for multi-platform queries
CREATE INDEX idx_reviews_composite ON reviews_raw (place_id, source, review_author);

-- Individual indexes for common query patterns
CREATE INDEX idx_reviews_place_id ON reviews_raw (place_id);
CREATE INDEX idx_reviews_source ON reviews_raw (source);
CREATE INDEX idx_reviews_author ON reviews_raw (review_author);
CREATE INDEX idx_reviews_rating ON reviews_raw (review_rating);
CREATE INDEX idx_reviews_place_rating ON reviews_raw (rating);
CREATE INDEX idx_reviews_country ON reviews_raw (country);
CREATE INDEX idx_reviews_crawltime ON reviews_raw (crawltime);

-- Composite indexes for analytics
CREATE INDEX idx_reviews_source_country ON reviews_raw (source, country);
CREATE INDEX idx_reviews_place_source ON reviews_raw (place_id, source);

-- ========================================================================
-- STEP 4: UPDATE EXISTING DATA TO MATCH NEW SCHEMA
-- ========================================================================

-- Update source values to standardized format
UPDATE reviews_raw SET source = 'Google' WHERE source IN ('GoogleMaps', 'Google Maps');
UPDATE reviews_raw SET source = 'Yelp' WHERE source = 'Yelp';
UPDATE reviews_raw SET source = 'TripAdvisor' WHERE source = 'TripAdvisor';
UPDATE reviews_raw SET source = 'Foody' WHERE source = 'Foody';
UPDATE reviews_raw SET source = 'Manual' WHERE source = 'Manual';

-- Set default country for existing Vietnamese data
UPDATE reviews_raw SET country = 'Vietnam' WHERE country IS NULL AND address LIKE '%TP.HCM%';
UPDATE reviews_raw SET country = 'Vietnam' WHERE country IS NULL AND address LIKE '%Hồ Chí Minh%';
UPDATE reviews_raw SET country = 'Vietnam' WHERE country IS NULL AND address LIKE '%Quận%';

-- ========================================================================
-- STEP 5: VERIFY MIGRATION
-- ========================================================================

-- Check table structure
DESCRIBE reviews_raw;

-- Verify data integrity
SELECT 
    COUNT(*) as total_reviews,
    COUNT(DISTINCT place_id) as unique_places,
    COUNT(DISTINCT source) as unique_sources,
    COUNT(DISTINCT country) as unique_countries
FROM reviews_raw;

-- Sample data check
SELECT 
    place_id, name, address, country, rating, user_ratings_total,
    review_author, review_rating, LEFT(review_text, 50) as review_excerpt,
    review_time, source, crawltime
FROM reviews_raw 
LIMIT 3;

-- Source distribution
SELECT source, COUNT(*) as count FROM reviews_raw GROUP BY source;

-- Country distribution  
SELECT country, COUNT(*) as count FROM reviews_raw GROUP BY country;

-- ========================================================================
-- FINAL OPTIMIZED TABLE STRUCTURE
-- ========================================================================
/*
Final reviews_raw table structure:

CREATE TABLE reviews_raw (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  place_id VARCHAR(64) NULL COMMENT 'Unique place identifier from source platform',
  name VARCHAR(255) NULL COMMENT 'Restaurant/business name', 
  address VARCHAR(512) NULL COMMENT 'Full address of the place',
  country VARCHAR(64) NULL COMMENT 'Country of the place',
  rating FLOAT NULL COMMENT 'Overall place rating (0.0-5.0)',
  user_ratings_total INT NULL COMMENT 'Total number of user ratings',
  review_author VARCHAR(128) NULL COMMENT 'Review author name or ID',
  review_rating FLOAT NULL COMMENT 'Individual review rating (1.0-5.0)', 
  review_text LONGTEXT NULL COMMENT 'Full review text - supports emoji and unicode',
  review_time VARCHAR(64) NULL COMMENT 'Review timestamp (can be datetime or text)',
  source VARCHAR(64) NULL COMMENT 'Review source platform (Google, Yelp, VSA, SNAP, etc.)',
  crawltime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When this record was crawled/inserted',
  
  INDEX idx_reviews_composite (place_id, source, review_author),
  INDEX idx_reviews_place_id (place_id),
  INDEX idx_reviews_source (source),
  INDEX idx_reviews_author (review_author),
  INDEX idx_reviews_rating (review_rating),
  INDEX idx_reviews_place_rating (rating),
  INDEX idx_reviews_country (country),
  INDEX idx_reviews_crawltime (crawltime),
  INDEX idx_reviews_source_country (source, country),
  INDEX idx_reviews_place_source (place_id, source)
  
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='Unified multi-platform restaurant review data optimized for ML/analytics';
*/

-- ========================================================================
-- DATA VALIDATION QUERIES
-- ========================================================================

-- Check for NULL values in key fields
SELECT 
    'place_id' as field, COUNT(*) as null_count FROM reviews_raw WHERE place_id IS NULL
UNION ALL
SELECT 
    'name' as field, COUNT(*) as null_count FROM reviews_raw WHERE name IS NULL  
UNION ALL
SELECT 
    'source' as field, COUNT(*) as null_count FROM reviews_raw WHERE source IS NULL
UNION ALL
SELECT 
    'review_rating' as field, COUNT(*) as null_count FROM reviews_raw WHERE review_rating IS NULL;

-- Rating distribution analysis
SELECT 
    FLOOR(review_rating) as rating_floor,
    COUNT(*) as count,
    AVG(review_rating) as avg_rating
FROM reviews_raw 
WHERE review_rating IS NOT NULL
GROUP BY FLOOR(review_rating)
ORDER BY rating_floor;

-- Text length analysis for ML readiness
SELECT 
    source,
    COUNT(*) as total_reviews,
    COUNT(CASE WHEN review_text IS NOT NULL AND LENGTH(review_text) > 0 THEN 1 END) as reviews_with_text,
    AVG(LENGTH(review_text)) as avg_text_length,
    MAX(LENGTH(review_text)) as max_text_length
FROM reviews_raw
GROUP BY source;

-- ========================================================================
-- SUCCESS MESSAGE
-- ========================================================================
SELECT 
    'Migration completed successfully!' as message,
    'reviews_raw table updated to unified multi-platform structure' as status,
    'Ready for Google, Yelp, VSA, SNAP and other review sources' as capability,
    'Optimized for ML/data analytics workloads' as optimization;

-- ========================================================================
-- CLEANUP (Optional - run only if migration is successful)
-- ========================================================================
-- DROP TABLE reviews_raw_backup;  -- Uncomment to remove backup after verification
