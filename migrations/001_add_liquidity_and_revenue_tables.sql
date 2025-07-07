-- Add escrow_address and liquidity_amount to tournaments table
ALTER TABLE tournaments
ADD COLUMN escrow_address TEXT;

ALTER TABLE tournaments
ADD COLUMN liquidity_amount REAL;

-- Create revenue_ledger table
CREATE TABLE IF NOT EXISTS revenue_ledger (
    id TEXT PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL, -- e.g., 'entry_fee', 'payout', 'liquidity_provision'
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    platform TEXT NOT NULL, -- e.g., 'Gamba', 'Polymarket', 'Zeta'
    transaction_hash TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);