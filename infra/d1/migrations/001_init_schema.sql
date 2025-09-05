-- Migration 001: Initialize schema with version tracking
-- This migration creates all the initial tables with proper idempotent statements

-- Create schema version tracking table first
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert this migration version
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('001_init_schema');

-- Create tables only if they don't exist
CREATE TABLE IF NOT EXISTS user_preferences (
    particle_user_id TEXT PRIMARY KEY NOT NULL,
    username TEXT,
    riskTolerance TEXT CHECK(riskTolerance IN ('low', 'medium', 'high')) DEFAULT 'medium',
    preferredGames TEXT,
    notificationSettings TEXT,
    smartBet BOOLEAN DEFAULT TRUE,
    lastLogin DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS zetachain_cctx_log (
    cctx_hash TEXT PRIMARY KEY NOT NULL,
    source_chain TEXT NOT NULL,
    destination_chain TEXT NOT NULL,
    asset TEXT,
    amount TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_metadata (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    urlPath TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    metaDescription TEXT,
    keywords TEXT,
    generatedHtml TEXT,
    imageUrl TEXT,
    generationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    socialPostQueueId TEXT
);

CREATE TABLE IF NOT EXISTS tournaments (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    name TEXT NOT NULL,
    format TEXT CHECK(format IN ('single-elimination', 'double-elimination', 'round-robin')) NOT NULL,
    status TEXT CHECK(status IN ('upcoming', 'ongoing', 'completed')) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    tournament_id TEXT NOT NULL,
    name TEXT NOT NULL,
    players TEXT,
    FOREIGN KEY(tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_particle_id ON user_preferences(particle_user_id);
CREATE INDEX IF NOT EXISTS idx_polymarket_markets_active ON polymarket_markets_cache(is_active);
CREATE INDEX IF NOT EXISTS idx_cctx_status ON zetachain_cctx_log(status);
CREATE INDEX IF NOT EXISTS idx_tournament_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_team_tournament ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_match_tournament ON matches(tournament_id);