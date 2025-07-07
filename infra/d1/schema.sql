-- FILE: infra/d1/schema.sql

-- Drop existing tables to ensure a clean slate for initial setup.
-- Note: This is for initial setup. For subsequent changes, use incremental migrations.
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS content_metadata;
DROP TABLE IF EXISTS leads;

-- Captures leads from pSEO pages and marketing initiatives.
CREATE TABLE leads (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    email TEXT UNIQUE NOT NULL,
    source TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    interests TEXT, -- JSON array of interests
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stores metadata for AI-generated pSEO pages.
CREATE TABLE content_metadata (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    urlPath TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    metaDescription TEXT,
    keywords TEXT, -- Comma-separated list
    generatedHtml TEXT,
    imageUrl TEXT, -- URL to image in Cloudflare R2
    generationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    socialPostIds TEXT -- JSON array of post IDs
);

-- Central user table, keyed by wallet address.
CREATE TABLE user_preferences (
    walletAddress TEXT PRIMARY KEY NOT NULL,
    riskTolerance TEXT CHECK(riskTolerance IN ('low', 'medium', 'high')),
    preferredGames TEXT, -- JSON array of game IDs
    notificationSettings TEXT, -- JSON configuration
    smartBet BOOLEAN DEFAULT TRUE,
    lastLogin DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stores tournament information.
CREATE TABLE tournaments (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    name TEXT NOT NULL,
    format TEXT CHECK(format IN ('single-elimination', 'double-elimination', 'round-robin')) NOT NULL,
    status TEXT CHECK(status IN ('upcoming', 'ongoing', 'completed')) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stores team information linked to tournaments.
CREATE TABLE teams (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    tournament_id TEXT NOT NULL,
    name TEXT NOT NULL,
    players TEXT, -- JSON array of user wallet addresses
    FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
);

-- Stores individual match information.
CREATE TABLE matches (
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
    FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY(team1_id) REFERENCES teams(id),
    FOREIGN KEY(team2_id) REFERENCES teams(id),
    FOREIGN KEY(winner_id) REFERENCES teams(id)
);

-- Seed data for testing
INSERT INTO tournaments (id, name, format, status) VALUES ('tournament-1', 'Quantum Nexus Genesis Cup', 'single-elimination', 'upcoming');
INSERT INTO teams (id, tournament_id, name, players) VALUES ('team1', 'tournament-1', 'Team A', '["player1_wallet", "player2_wallet"]');
INSERT INTO teams (id, tournament_id, name, players) VALUES ('team2', 'tournament-1', 'Team B', '["player3_wallet", "player4_wallet"]');
INSERT INTO matches (id, tournament_id, round, match_number, team1_id, team2_id) VALUES ('match1', 'tournament-1', 1, 1, 'team1', 'team2');
