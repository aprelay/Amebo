-- Add token gifting and PIN security
-- Migration 0004: Token transactions and user PINs

-- Add PIN field to users table
ALTER TABLE users ADD COLUMN pin TEXT DEFAULT NULL;

-- Create token_transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
    id TEXT PRIMARY KEY,
    from_user_id TEXT NOT NULL,
    to_user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    room_id TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_token_transactions_from ON token_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_to ON token_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_room ON token_transactions(room_id);
