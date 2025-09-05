-- Migration 004: Add referral system tables and columns
-- This migration adds the referrer_id column to user_preferences and creates the referral_earnings table

-- Create schema version tracking table if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert this migration version
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('004_add_referral_system');

-- Add referrer_id column to user_preferences table
ALTER TABLE user_preferences ADD COLUMN referrer_id TEXT REFERENCES user_preferences(particle_user_id);

-- Create referral_earnings table
CREATE TABLE IF NOT EXISTS referral_earnings (
    particle_user_id TEXT PRIMARY KEY NOT NULL REFERENCES user_preferences(particle_user_id),
    unpaid_balance_usd REAL DEFAULT 0,
    total_earned_usd REAL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_referrer_id ON user_preferences(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_unpaid_balance ON referral_earnings(unpaid_balance_usd);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_last_updated ON referral_earnings(last_updated);