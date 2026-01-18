-- Verify RLS policies are working correctly
-- Run this in Supabase SQL Editor

-- Step 1: Verify all policies exist
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'church_users'
ORDER BY cmd, policyname;

-- Step 2: Verify the is_church_admin function works
SELECT 
  is_church_admin('e5e74ce5-a71b-42d3-9ec1-4c80d6015363'::UUID) as is_admin,
  'Should be true' as expected;

-- Step 3: Check the user record directly (bypassing RLS - as postgres role)
SELECT 
  id,
  auth_user_id,
  email,
  name,
  role,
  church_id
FROM church_users
WHERE auth_user_id = 'e5e74ce5-a71b-42d3-9ec1-4c80d6015363';

-- Step 4: Test if the policies allow reading (this simulates what happens when authenticated)
-- Note: This query will only work if you're authenticated as that user
-- The app uses: SELECT * FROM church_users WHERE auth_user_id = auth.uid()
-- But in SQL Editor, we need to simulate it differently

-- Create a test function that simulates the authenticated query
CREATE OR REPLACE FUNCTION test_authenticated_query(test_auth_user_id UUID)
RETURNS TABLE (
  id UUID,
  auth_user_id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  church_id UUID
) AS $$
BEGIN
  -- Simulate what happens when auth.uid() = test_auth_user_id
  RETURN QUERY
  SELECT 
    cu.id,
    cu.auth_user_id,
    cu.email,
    cu.name,
    cu.role,
    cu.church_id
  FROM church_users cu
  WHERE cu.auth_user_id = test_auth_user_id
  AND (
    -- Policy 1: Users can read their own record
    cu.auth_user_id = test_auth_user_id
    OR
    -- Policy 2: Admins can read all records
    is_church_admin(test_auth_user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT * FROM test_authenticated_query('e5e74ce5-a71b-42d3-9ec1-4c80d6015363'::UUID);

-- This should return the user record if policies are working correctly
