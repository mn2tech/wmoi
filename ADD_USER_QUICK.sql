-- Quick SQL to add support@nm2tech.com to church_users table
-- Run this in Supabase SQL Editor

-- Step 1: Get the auth user ID for support@nm2tech.com
-- Run this first to find the user ID:
SELECT id, email FROM auth.users WHERE email = 'support@nm2tech.com';

-- Step 2: Insert into church_users (replace 'YOUR_USER_ID_HERE' with the ID from Step 1)
-- If the user doesn't exist in auth.users, you'll need to create them first via the Registration page

INSERT INTO church_users (auth_user_id, email, name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'support@nm2tech.com'),  -- Get auth user ID
  'support@nm2tech.com',
  'Support User',
  'admin'
)
ON CONFLICT (auth_user_id) DO NOTHING;  -- Prevents duplicate if already exists

-- Verify it was added:
SELECT * FROM church_users WHERE email = 'support@nm2tech.com';
