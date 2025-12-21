-- Fix token_transactions foreign key issue
-- Migration 0007: Remove invalid room_id foreign key

-- SQLite doesn't support DROP FOREIGN KEY, so we need to recreate the table
-- First, create a new table without the foreign key constraint

CREATE TABLE token_transactions_new (
    id TEXT PRIMARY KEY,
    from_user_id TEXT NOT NULL,
    to_user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    room_id TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id)
);

-- Copy data from old table
INSERT INTO token_transactions_new SELECT * FROM token_transactions;

-- Drop old table
DROP TABLE token_transactions;

-- Rename new table to original name
ALTER TABLE token_transactions_new RENAME TO token_transactions;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_token_transactions_from ON token_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_to ON token_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_room ON token_transactions(room_id);
