-- IMMEDIATE FIX for RLS policies - Run this NOW in Supabase SQL Editor
-- This will fix the login issue immediately

-- Step 1: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to read church_users" ON church_users;
DROP POLICY IF EXISTS "Allow authenticated users to insert church_users" ON church_users;
DROP POLICY IF EXISTS "Allow authenticated users to update church_users" ON church_users;
DROP POLICY IF EXISTS "Users can read their own church_user record" ON church_users;
DROP POLICY IF EXISTS "Users can insert their own church_user record" ON church_users;
DROP POLICY IF EXISTS "Users can update their own church_user record" ON church_users;
DROP POLICY IF EXISTS "Admins can read all church_users" ON church_users;

-- Step 2: Create the is_church_admin function (SECURITY DEFINER to bypass RLS)
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

-- Step 3: Create SELECT policy for users to read their own record
CREATE POLICY "Users can read their own church_user record"
  ON church_users FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Step 4: Create SELECT policy for admins to read all records
CREATE POLICY "Admins can read all church_users"
  ON church_users FOR SELECT
  TO authenticated
  USING (is_church_admin(auth.uid()));

-- Step 5: Create INSERT policy
CREATE POLICY "Users can insert their own church_user record"
  ON church_users FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Step 6: Create UPDATE policy
CREATE POLICY "Users can update their own church_user record"
  ON church_users FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Step 7: Verify policies are created
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'church_users'
ORDER BY cmd, policyname;

-- Step 8: Test the is_church_admin function
SELECT 
  is_church_admin('e5e74ce5-a71b-42d3-9ec1-4c80d6015363'::UUID) as should_be_true;
