-- Add security questions for PIN reset
-- Migration 0008: PIN reset security

ALTER TABLE users ADD COLUMN security_question TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN security_answer TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN pin_reset_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_pin_reset DATETIME DEFAULT NULL;
