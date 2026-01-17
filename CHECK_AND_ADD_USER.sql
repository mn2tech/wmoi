-- Check if user exists and add to church_users if needed
-- Run this in Supabase SQL Editor

-- Step 1: Check if user exists in auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'support@nm2tech.com';

-- Step 2: Check if user exists in church_users
SELECT 
  id,
  auth_user_id,
  email,
  name,
  role,
  church_id
FROM church_users
WHERE email = 'support@nm2tech.com';

-- Step 3: If user exists in auth.users but NOT in church_users, add them
-- Replace the auth_user_id with the actual ID from Step 1
INSERT INTO church_users (auth_user_id, email, name, role, church_id)
SELECT 
  au.id as auth_user_id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email) as name,
  'admin' as role,
  NULL as church_id  -- NULL means admin (can see all churches)
FROM auth.users au
WHERE au.email = 'support@nm2tech.com'
  AND NOT EXISTS (
    SELECT 1 FROM church_users cu 
    WHERE cu.auth_user_id = au.id
  )
ON CONFLICT (auth_user_id) DO NOTHING
RETURNING *;

-- Step 4: Verify the user was added
SELECT 
  id,
  auth_user_id,
  email,
  name,
  role,
  church_id,
  created_at
FROM church_users
WHERE email = 'support@nm2tech.com';

-- If Step 4 shows the user, you should be able to log in now!
