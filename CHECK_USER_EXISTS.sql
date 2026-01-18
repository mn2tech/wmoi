-- Check if the user exists in church_users table
-- Replace 'e5e74ce5-a71b-42d3-9ec1-4c80d6015363' with the actual auth_user_id from the console

-- Step 1: Check auth.users table
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'support@nm2tech.com';

-- Step 2: Check church_users table
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

-- Step 3: If you have the auth_user_id from console (e5e74ce5...), use this:
-- SELECT * FROM church_users WHERE auth_user_id = 'e5e74ce5-a71b-42d3-9ec1-4c80d6015363';

-- Step 4: Check RLS policies
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'church_users'
ORDER BY policyname;
