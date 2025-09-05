-- Migration 0000: Initial schema migration
-- This migration creates all the initial tables with proper idempotent statements

-- Create schema version tracking table first
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert this migration version
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0000_initial_schema');

-- Stores user-specific preferences and settings, keyed by a universal ID.
CREATE TABLE IF NOT EXISTS user_preferences (
    particle_user_id TEXT PRIMARY KEY NOT NULL, -- Universal ID from Particle Network
    username TEXT,
    riskTolerance TEXT CHECK(riskTolerance IN ('low', 'medium', 'high')) DEFAULT 'medium',
    preferredGames TEXT, -- JSON array of game IDs
    notificationSettings TEXT, -- JSON configuration
    smartBet BOOLEAN DEFAULT TRUE,
    lastLogin DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Caches data from the Polymarket API to reduce external calls and improve performance.
CREATE TABLE IF NOT EXISTS polymarket_markets_cache (
    condition_id TEXT PRIMARY KEY NOT NULL,
    question TEXT NOT NULL,
    category TEXT,
    volume_usd REAL DEFAULT 0,
    liquidity_usd REAL DEFAULT 0,
    end_date_iso TEXT,
    is_active BOOLEAN,
    is_closed BOOLEAN,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Logs all cross-chain transactions for auditing and status tracking.
CREATE TABLE IF NOT EXISTS zetachain_cctx_log (
    cctx_hash TEXT PRIMARY KEY NOT NULL,
    source_chain TEXT NOT NULL,
    destination_chain TEXT NOT NULL,
    asset TEXT,
    amount TEXT, -- Stored as string to handle large numbers
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stores metadata for AI-generated pSEO pages.
CREATE TABLE IF NOT EXISTS content_metadata (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    urlPath TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    metaDescription TEXT,
    keywords TEXT, -- Comma-separated list
    generatedHtml TEXT,
    imageUrl TEXT, -- URL to image in Cloudflare R2
    generationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    socialPostQueueId TEXT -- ID of the message sent to Cloudflare Queues
);

-- Stores tournament information.
CREATE TABLE IF NOT EXISTS tournaments (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    name TEXT NOT NULL,
    format TEXT CHECK(format IN ('single-elimination', 'double-elimination', 'round-robin')) NOT NULL,
    status TEXT CHECK(status IN ('upcoming', 'ongoing', 'completed')) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stores team information linked to tournaments.
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    tournament_id TEXT NOT NULL,
    name TEXT NOT NULL,
    players TEXT, -- JSON array of particle_user_ids
    FOREIGN KEY(tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Stores individual match information.
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    tournament_id TEXT NOT NULL,
    round INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    team1_id TEXT,
    team2_id TEXT,
    score1 INTEGER,
    score2 INTEGER,
    winner_id TEXT,
    next_match_id TEXT,
    FOREIGN KEY(tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY(team1_id) REFERENCES teams(id),
    FOREIGN KEY(team2_id) REFERENCES teams(id),
    FOREIGN KEY(winner_id) REFERENCES teams(id)
);
