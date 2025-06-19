-- Updated schema.sql
CREATE TABLE leads (
    id TEXT PRIMARY KEY DEFAULT (uuid()),
    email TEXT UNIQUE NOT NULL,
    source TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    interests TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content_metadata (
    id TEXT PRIMARY KEY DEFAULT (uuid()),
    urlPath TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    metaDescription TEXT,
    keywords TEXT,
    generatedHtml TEXT,
    imageUrl TEXT,
    generationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    socialPostIds TEXT, -- JSON array of post IDs
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0
);

CREATE TABLE user_preferences (
    walletAddress TEXT PRIMARY KEY UNIQUE NOT NULL,
    riskTolerance TEXT CHECK(riskTolerance IN ('low', 'medium', 'high')),
    preferredGames TEXT, -- JSON array of game IDs
    notificationSettings TEXT, -- JSON configuration
    lastLogin DATETIME DEFAULT CURRENT_TIMESTAMP,
    hasClaimedFirstPlay BOOLEAN DEFAULT FALSE,
    referralCredits REAL DEFAULT 0
);