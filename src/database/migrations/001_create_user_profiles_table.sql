CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY,
    username CITEXT UNIQUE NOT NULL,
    email BYTEA UNIQUE NOT NULL, -- Encrypted email
    avatar_url TEXT,
    privacy_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_user_profiles_username ON user_profiles (username);
CREATE UNIQUE INDEX idx_user_profiles_email ON user_profiles (email);