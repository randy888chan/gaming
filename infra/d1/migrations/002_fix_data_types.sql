-- Migration 002: Fix data types and add additional indexes
-- This migration addresses the data type concerns and adds recommended indexes

-- Create schema version tracking table if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert this migration version
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('002_fix_data_types');

-- For the zetachain_cctx_log table, we'll add a numeric amount column and migrate data
-- First, add the new column
ALTER TABLE zetachain_cctx_log ADD COLUMN amount_numeric REAL;

-- Update the new column with converted values where possible
UPDATE zetachain_cctx_log 
SET amount_numeric = CAST(amount AS REAL) 
WHERE amount IS NOT NULL AND amount != '' AND amount GLOB '[0-9]*';

-- Create additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cctx_source_chain ON zetachain_cctx_log(source_chain);
CREATE INDEX IF NOT EXISTS idx_cctx_destination_chain ON zetachain_cctx_log(destination_chain);
CREATE INDEX IF NOT EXISTS idx_cctx_created_at ON zetachain_cctx_log(created_at);
CREATE INDEX IF NOT EXISTS idx_content_metadata_url ON content_metadata(urlPath);
CREATE INDEX IF NOT EXISTS idx_content_metadata_generation_date ON content_metadata(generationDate);