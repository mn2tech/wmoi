-- Test RLS policies for church_users table
-- Run this in Supabase SQL Editor to verify policies are working

-- Step 1: Check if the is_church_admin function exists and works
SELECT 
  is_church_admin('e5e74ce5-a71b-42d3-9ec1-4c80d6015363'::UUID) as is_admin;

-- Step 2: Check if the user record exists (bypassing RLS - run as postgres role)
SELECT 
  id,
  auth_user_id,
  email,
  name,
  role,
  church_id
FROM church_users
WHERE auth_user_id = 'e5e74ce5-a71b-42d3-9ec1-4c80d6015363';

-- Step 3: Test the SELECT policies
-- This simulates what the app does when authenticated
-- Note: This will only work if you're authenticated as that user
-- The app uses: SELECT * FROM church_users WHERE auth_user_id = auth.uid()

-- Step 4: Check current policies
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'church_users'
ORDER BY cmd, policyname;

-- Step 5: Verify the is_church_admin function definition
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'is_church_admin'
AND n.nspname = 'public';
