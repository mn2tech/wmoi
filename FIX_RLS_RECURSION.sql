-- Fix infinite recursion in church_users RLS policy
-- Run this in Supabase SQL Editor

-- Step 1: Drop the problematic policy
DROP POLICY IF EXISTS "Users can read their own church_user record" ON church_users;

-- Step 2: Create a simpler policy that doesn't cause recursion
-- Users can read their own record
CREATE POLICY "Users can read their own church_user record"
  ON church_users FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Step 3: Create a separate policy for admins to read all records
-- This uses a function to avoid recursion
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

-- Policy for admins to read all church_users (using the function to avoid recursion)
CREATE POLICY "Admins can read all church_users"
  ON church_users FOR SELECT
  TO authenticated
  USING (is_church_admin(auth.uid()));

-- Step 4: Verify policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'church_users'
ORDER BY policyname;

-- Step 5: Test - this should work now
SELECT * FROM church_users WHERE email = 'support@nm2tech.com';
