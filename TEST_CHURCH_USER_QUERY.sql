-- Test if the query used by the app works
-- Run this in Supabase SQL Editor

-- Step 1: Test as authenticated user (simulating what the app does)
-- First, we need to set the auth context
-- This simulates what happens when a user is logged in

-- Test the exact query the app uses
SET ROLE authenticated;

-- The app queries: SELECT * FROM church_users WHERE auth_user_id = 'e5e74ce5-a71b-42d3-9ec1-4c80d6015363'
-- But we need to set the auth.uid() first, so let's test with a function

-- Create a test function to simulate the query
CREATE OR REPLACE FUNCTION test_church_user_query(test_user_id UUID)
RETURNS TABLE (
  id UUID,
  auth_user_id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  church_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cu.id,
    cu.auth_user_id,
    cu.email,
    cu.name,
    cu.role,
    cu.church_id
  FROM church_users cu
  WHERE cu.auth_user_id = test_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT * FROM test_church_user_query('e5e74ce5-a71b-42d3-9ec1-4c80d6015363'::UUID);

-- Step 2: Check RLS policies on church_users
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'church_users'
ORDER BY policyname;

-- Step 3: Test if authenticated users can read their own record
-- This should work if RLS is set up correctly
-- The app uses: SELECT * FROM church_users WHERE auth_user_id = auth.uid()

-- Check if there's a policy that allows users to read their own record
SELECT 
  'RLS Policy Check' AS check_type,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'church_users'
  AND cmd = 'SELECT'
  AND roles::text LIKE '%authenticated%';

RESET ROLE;
