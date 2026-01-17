-- Fix RLS policies for church_users to allow users to read their own record
-- Run this in Supabase SQL Editor

-- Step 1: Check current policies
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'church_users'
ORDER BY policyname;

-- Step 2: Drop existing policies that might be blocking
DROP POLICY IF EXISTS "Allow authenticated users to read church_users" ON church_users;
DROP POLICY IF EXISTS "Users can read their own church_user record" ON church_users;
DROP POLICY IF EXISTS "Admins can read all church_users" ON church_users;

-- Step 3: Create policy that allows users to read their own record
CREATE POLICY "Users can read their own church_user record"
  ON church_users FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Step 4: Create policy for admins to read all records (using function to avoid recursion)
-- First, ensure the function exists
CREATE OR REPLACE FUNCTION is_church_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM church_users
    WHERE auth_user_id = user_id
    AND role = 'admin'
    AND church_id IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for admins to read all church_users
CREATE POLICY "Admins can read all church_users"
  ON church_users FOR SELECT
  TO authenticated
  USING (is_church_admin(auth.uid()));

-- Step 5: Allow users to insert their own record (for registration)
CREATE POLICY "Users can insert their own church_user record"
  ON church_users FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Step 6: Allow users to update their own record
CREATE POLICY "Users can update their own church_user record"
  ON church_users FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Step 7: Verify policies
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'church_users'
ORDER BY policyname;

-- Step 8: Test query (this simulates what the app does)
-- Note: This will only work if you're logged in as that user
-- The app uses: SELECT * FROM church_users WHERE auth_user_id = auth.uid()

-- To test, you need to be authenticated as that user
-- The query should return the user's record
