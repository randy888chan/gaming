-- Migration 003: Add credit_configs table for credit management
-- This migration adds the credit_configs table that is used by the CreditConfigService

-- Create schema version tracking table if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert this migration version
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('003_add_credit_configs');

-- Create credit_configs table
CREATE TABLE IF NOT EXISTS credit_configs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rules TEXT NOT NULL, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_configs_name ON credit_configs(name);
CREATE INDEX IF NOT EXISTS idx_credit_configs_created_at ON credit_configs(created_at);