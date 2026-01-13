-- Troubleshooting Script for church_users table
-- Run this in Supabase SQL Editor to diagnose issues

-- Step 1: Check if church_users table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'church_users'
    ) THEN '✅ church_users table EXISTS'
    ELSE '❌ church_users table DOES NOT EXIST - Run migration 002_church_users_table.sql'
  END as table_status;

-- Step 2: Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'church_users'
ORDER BY ordinal_position;

-- Step 3: Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'church_users';

-- Step 4: Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'church_users';

-- Step 5: Check existing church_users
SELECT COUNT(*) as total_users FROM church_users;

-- Step 6: Check if your user exists in auth.users
SELECT 
  id,
  email,
  created_at,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM church_users WHERE auth_user_id = auth.users.id
    ) THEN '✅ Already in church_users'
    ELSE '❌ NOT in church_users'
  END as church_user_status
FROM auth.users
WHERE email = 'support@nm2tech.com';

-- Step 7: Test insert (this will show the exact error if it fails)
-- Uncomment and run this if you want to test:
/*
INSERT INTO church_users (auth_user_id, email, name, role, church_id)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'support@nm2tech.com'),
  'support@nm2tech.com',
  'Support User',
  'admin',
  NULL
)
ON CONFLICT (auth_user_id) DO UPDATE
SET role = 'admin',
    church_id = NULL;
*/
