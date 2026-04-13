-- Add is_admin column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Mark the first user as admin (or update your email below)
-- UPDATE users SET is_admin = TRUE WHERE id = 1;
