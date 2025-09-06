-- Migration 005: Add security indexes for better performance and security
-- This migration adds indexes on frequently queried columns and security-related fields

-- Create schema version tracking table if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert this migration version
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('005_add_security_indexes');

-- Add indexes for better security query performance
-- Index on user_preferences for particle_user_id (should already exist but ensuring it's there)
CREATE INDEX IF NOT EXISTS idx_user_preferences_particle_user_id ON user_preferences(particle_user_id);

-- Index on users table for better security lookups
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updatedAt);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(createdAt);

-- Index on polymarket_markets_cache for better performance
CREATE INDEX IF NOT EXISTS idx_polymarket_markets_cache_last_updated ON polymarket_markets_cache(last_updated);
CREATE INDEX IF NOT EXISTS idx_polymarket_markets_cache_is_active ON polymarket_markets_cache(is_active);

-- Index on zetachain_cctx_log for better tracking
CREATE INDEX IF NOT EXISTS idx_zetachain_cctx_log_status ON zetachain_cctx_log(status);
CREATE INDEX IF NOT EXISTS idx_zetachain_cctx_log_updated_at ON zetachain_cctx_log(updated_at);

-- Index on content_metadata for better performance
CREATE INDEX IF NOT EXISTS idx_content_metadata_generation_date ON content_metadata(generationDate);
CREATE INDEX IF NOT EXISTS idx_content_metadata_url_path ON content_metadata(urlPath);

-- Index on referral_earnings for better performance
CREATE INDEX IF NOT EXISTS idx_referral_earnings_particle_user_id ON referral_earnings(particle_user_id);

-- Add a table for security logging (optional)
CREATE TABLE IF NOT EXISTS security_logs (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    event_type TEXT NOT NULL,
    user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for security_logs
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);