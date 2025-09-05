-- Migration 0002: Fix zetachain_cctx_log amount column data type
-- This migration addresses the data type concerns for the amount column in zetachain_cctx_log table

-- Create schema version tracking table if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert this migration version
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0002_fix_cctx_log_amount_type');

-- For the zetachain_cctx_log table, we'll add a numeric amount column and migrate data
-- First, add the new column
ALTER TABLE zetachain_cctx_log ADD COLUMN amount_numeric REAL;

-- Update the new column with converted values where possible
UPDATE zetachain_cctx_log 
SET amount_numeric = CAST(amount AS REAL) 
WHERE amount IS NOT NULL AND amount != '' AND amount GLOB '[0-9]*';
