-- Migration 006: Add additional security indexes for enhanced security monitoring
-- This migration adds indexes on security-related tables and columns for better performance

-- Create schema version tracking table if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert this migration version
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('006_add_additional_security_indexes');

-- Add indexes for better security query performance on user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_last_login ON user_preferences(lastLogin);
CREATE INDEX IF NOT EXISTS idx_user_preferences_created_at ON user_preferences(createdAt);

-- Add indexes for better security query performance on users table
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(walletAddress);
CREATE INDEX IF NOT EXISTS idx_users_credits ON users(credits);

-- Add indexes for better security query performance on security_logs
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(event_type);

-- Add indexes for better performance on credit_configs
CREATE INDEX IF NOT EXISTS idx_credit_configs_name ON credit_configs(name);
CREATE INDEX IF NOT EXISTS idx_credit_configs_updated_at ON credit_configs(updated_at);

-- Add indexes for better performance on referral tables
CREATE INDEX IF NOT EXISTS idx_referral_codes_created_at ON referral_codes(created_at);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_created_at ON referral_earnings(created_at);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_amount ON referral_earnings(amount);

-- Add indexes for better performance on content tables
CREATE INDEX IF NOT EXISTS idx_content_metadata_created_at ON content_metadata(created_at);
CREATE INDEX IF NOT EXISTS idx_content_metadata_status ON content_metadata(status);

-- Add indexes for better performance on polymarket tables
CREATE INDEX IF NOT EXISTS idx_polymarket_markets_cache_created_at ON polymarket_markets_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_polymarket_markets_cache_condition_id ON polymarket_markets_cache(condition_id);

-- Add indexes for better performance on zetachain tables
CREATE INDEX IF NOT EXISTS idx_zetachain_cctx_log_created_at ON zetachain_cctx_log(created_at);
CREATE INDEX IF NOT EXISTS idx_zetachain_cctx_log_tx_hash ON zetachain_cctx_log(tx_hash);