# Database Schema

The official schema for the Cloudflare D1 database. This unified schema supports all platform features, including user preferences, pSEO content, and the new tournament system.

```sql
-- (File: infra/d1/schema.sql)

-- Captures leads from pSEO pages and marketing initiatives.
CREATE TABLE leads (
    id TEXT PRIMARY KEY DEFAULT (uuid()),
    email TEXT UNIQUE NOT NULL,
    source TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    interests TEXT, -- JSON array of interests
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stores metadata for AI-generated pSEO pages.
CREATE TABLE content_metadata (
    id TEXT PRIMARY KEY DEFAULT (uuid()),
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
    walletAddress TEXT PRIMARY KEY UNIQUE NOT NULL,
    riskTolerance TEXT CHECK(riskTolerance IN ('low', 'medium', 'high')),
    preferredGames TEXT, -- JSON array of game IDs
    notificationSettings TEXT, -- JSON configuration
    hasClaimedFirstPlay BOOLEAN DEFAULT FALSE,
    referralCredits REAL DEFAULT 0,
    smartBet BOOLEAN DEFAULT TRUE,
    lastLogin DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- NEW: Stores tournament information.
CREATE TABLE tournaments (
    id TEXT PRIMARY KEY DEFAULT (uuid()),
    name TEXT NOT NULL,
    format TEXT CHECK(format IN ('single-elimination', 'double-elimination', 'round-robin')) NOT NULL,
    status TEXT CHECK(status IN ('upcoming', 'ongoing', 'completed')) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- NEW: Stores team information linked to tournaments.
CREATE TABLE teams (
    id TEXT PRIMARY KEY DEFAULT (uuid()),
    tournament_id TEXT NOT NULL,
    name TEXT NOT NULL,
    players TEXT, -- JSON array of user wallet addresses
    FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
);

-- NEW: Stores individual match information.
CREATE TABLE matches (
    id TEXT PRIMARY KEY DEFAULT (uuid()),
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
