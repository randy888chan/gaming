-- Migration 0001: Add performance indexes
-- This migration adds indexes to improve query performance on commonly accessed columns

-- Create schema version tracking table if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert this migration version
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0001_add_performance_indexes');

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_preferences_particle_id ON user_preferences(particle_user_id);
CREATE INDEX IF NOT EXISTS idx_polymarket_markets_active ON polymarket_markets_cache(is_active);
CREATE INDEX IF NOT EXISTS idx_cctx_status ON zetachain_cctx_log(status);
