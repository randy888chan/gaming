CREATE TABLE user_profiles (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL COLLATE NOCASE,
    email TEXT UNIQUE NOT NULL, -- Encrypted email
    avatar_url TEXT,
    privacy_settings TEXT DEFAULT '{}', -- Stored as JSON string
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    last_login TEXT
);

CREATE UNIQUE INDEX idx_user_profiles_username ON user_profiles (username COLLATE NOCASE);
CREATE UNIQUE INDEX idx_user_profiles_email ON user_profiles (email);