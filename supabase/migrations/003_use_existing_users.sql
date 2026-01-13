-- Option 1: Add a field to your existing users table to mark church app users
-- Run this if you want to use your existing users table

-- Add field to mark church app users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_church_user BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_church_user ON users(is_church_user) WHERE is_church_user = TRUE;

-- Mark your existing user as church app user
-- Replace 'nm2tech77@gmail.com' with your actual email
UPDATE users 
SET is_church_user = TRUE 
WHERE email = 'nm2tech77@gmail.com';

-- Optional: If you want to use an 'app' field instead (for multiple apps)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS app TEXT;
-- UPDATE users SET app = 'church' WHERE email = 'nm2tech77@gmail.com';
