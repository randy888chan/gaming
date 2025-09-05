-- Migration 0003: Add additional indexes for better performance
-- This migration adds more indexes to improve query performance

-- Create schema version tracking table if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert this migration version
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0003_add_additional_indexes');

-- Create additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cctx_source_chain ON zetachain_cctx_log(source_chain);
CREATE INDEX IF NOT EXISTS idx_cctx_destination_chain ON zetachain_cctx_log(destination_chain);
CREATE INDEX IF NOT EXISTS idx_cctx_created_at ON zetachain_cctx_log(created_at);
CREATE INDEX IF NOT EXISTS idx_content_metadata_url ON content_metadata(urlPath);
CREATE INDEX IF NOT EXISTS idx_content_metadata_generation_date ON content_metadata(generationDate);
CREATE INDEX IF NOT EXISTS idx_tournament_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_team_tournament ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_match_tournament ON matches(tournament_id);
