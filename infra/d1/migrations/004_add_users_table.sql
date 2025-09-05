-- Migration 004: Add users table for user management
-- This migration adds the users table that is used by the user API endpoints

-- Create schema version tracking table if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert this migration version
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('004_add_users_table');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    walletAddress TEXT PRIMARY KEY NOT NULL,
    credits REAL DEFAULT 0,
    claimedFirstPlayCredits BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(walletAddress);
CREATE INDEX IF NOT EXISTS idx_users_credits ON users(credits);
CREATE INDEX IF NOT EXISTS idx_users_claimed_first_play ON users(claimedFirstPlayCredits);