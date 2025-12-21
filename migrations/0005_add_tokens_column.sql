-- Add tokens column to users table
-- Migration 0005: Add token balance tracking

ALTER TABLE users ADD COLUMN tokens INTEGER DEFAULT 0;
