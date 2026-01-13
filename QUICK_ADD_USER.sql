-- QUICK FIX: Add support@nm2tech.com to church_users table
-- Run this in Supabase SQL Editor - it will work even if registration fails

-- Step 1: Check if user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'support@nm2tech.com';

-- Step 2: Add to church_users (run this after Step 1 confirms user exists)
INSERT INTO church_users (auth_user_id, email, name, role, church_id)
SELECT 
  id as auth_user_id,
  email,
  'Michael Kola' as name,
  'admin' as role,
  NULL as church_id
FROM auth.users
WHERE email = 'support@nm2tech.com'
ON CONFLICT (auth_user_id) DO UPDATE
SET 
  role = 'admin',
  church_id = NULL,
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- Step 3: Verify it was added
SELECT 
  id,
  email,
  name,
  role,
  church_id,
  CASE 
    WHEN church_id IS NULL AND role = 'admin' THEN '✅ Admin (can see all churches)'
    WHEN church_id IS NOT NULL AND role = 'pastor' THEN '✅ Pastor (linked to one church)'
    ELSE 'User'
  END as status
FROM church_users
WHERE email = 'support@nm2tech.com';
