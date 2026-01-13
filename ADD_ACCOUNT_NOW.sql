-- COPY AND PASTE THIS ENTIRE SCRIPT INTO SUPABASE SQL EDITOR
-- Then click "Run" or press Ctrl+Enter

-- This will add support@nm2tech.com as an admin user

-- Step 1: Check if user exists in auth.users
SELECT 
  id, 
  email, 
  created_at,
  '✅ User exists in auth.users' as status
FROM auth.users 
WHERE email = 'support@nm2tech.com';

-- Step 2: Add to church_users table
INSERT INTO church_users (auth_user_id, email, name, role, church_id)
SELECT 
  id,
  email,
  'Michael Kola',
  'admin',
  NULL
FROM auth.users
WHERE email = 'support@nm2tech.com'
ON CONFLICT (auth_user_id) DO UPDATE
SET 
  role = 'admin',
  church_id = NULL,
  name = 'Michael Kola',
  email = EXCLUDED.email;

-- Step 3: Verify it was added successfully
SELECT 
  id,
  email,
  name,
  role,
  CASE 
    WHEN church_id IS NULL AND role = 'admin' THEN '✅ Admin - Can see all churches'
    ELSE 'User'
  END as status
FROM church_users
WHERE email = 'support@nm2tech.com';

-- If you see a row with "✅ Admin - Can see all churches", you're all set!
-- Go back to the app and log in again.
