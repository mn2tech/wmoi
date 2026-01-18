-- Fix RLS policies for church_users table
-- This script removes overly permissive policies and ensures proper access control
-- Run this in Supabase SQL Editor

-- Step 1: Drop the problematic overly permissive UPDATE policy
DROP POLICY IF EXISTS "Allow authenticated users to update church_users" ON church_users;

-- Step 2: Drop duplicate INSERT policies (we'll recreate them properly)
DROP POLICY IF EXISTS "Allow authenticated users to insert church_users" ON church_users;
DROP POLICY IF EXISTS "Users can insert their own church_user record" ON church_users;

-- Step 3: Ensure the is_church_admin function exists (needed for admin SELECT policy)
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

-- Step 4: Ensure SELECT policies are correct
-- Drop and recreate to ensure they're correct
DROP POLICY IF EXISTS "Users can read their own church_user record" ON church_users;
DROP POLICY IF EXISTS "Admins can read all church_users" ON church_users;

-- Policy: Users can read their own record
CREATE POLICY "Users can read their own church_user record"
  ON church_users FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Policy: Admins can read all records
CREATE POLICY "Admins can read all church_users"
  ON church_users FOR SELECT
  TO authenticated
  USING (is_church_admin(auth.uid()));

-- Step 5: Create proper INSERT policy with WITH CHECK
CREATE POLICY "Users can insert their own church_user record"
  ON church_users FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Step 6: Ensure UPDATE policy is correct
DROP POLICY IF EXISTS "Users can update their own church_user record" ON church_users;

CREATE POLICY "Users can update their own church_user record"
  ON church_users FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Step 7: Verify all policies
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'church_users'
ORDER BY cmd, policyname;

-- Step 8: Test - Check if user exists
-- Replace 'support@nm2tech.com' with your email
SELECT 
  cu.id,
  cu.auth_user_id,
  cu.email,
  cu.name,
  cu.role,
  cu.church_id
FROM church_users cu
WHERE cu.email = 'support@nm2tech.com';
