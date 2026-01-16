-- Fix RLS policies for pending_pastor_assignments
-- Run this in Supabase SQL Editor if you're getting "failed to load pending assignments"

-- Step 1: Check if the table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'pending_pastor_assignments'
) AS table_exists;

-- Step 2: Check existing policies
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'pending_pastor_assignments'
ORDER BY policyname;

-- Step 3: Drop existing anonymous policy if it exists (to recreate it)
DROP POLICY IF EXISTS "Anonymous users can read pending assignments" ON pending_pastor_assignments;

-- Step 4: Create policy for anonymous users to read pending assignments
CREATE POLICY "Anonymous users can read pending assignments"
  ON pending_pastor_assignments FOR SELECT
  TO anon
  USING (status = 'pending');

-- Step 5: Check churches table policies
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'churches'
ORDER BY policyname;

-- Step 6: Drop existing anonymous policy for churches if it exists
DROP POLICY IF EXISTS "Anonymous users can read churches in pending assignments" ON churches;

-- Step 7: Create policy for anonymous users to read churches in pending assignments
CREATE POLICY "Anonymous users can read churches in pending assignments"
  ON churches FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM pending_pastor_assignments
      WHERE pending_pastor_assignments.church_id = churches.id
      AND pending_pastor_assignments.status = 'pending'
    )
  );

-- Step 8: Verify policies are created
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('pending_pastor_assignments', 'churches')
  AND roles::text LIKE '%anon%'
ORDER BY tablename, policyname;

-- Step 9: Test query (should work for anonymous users)
-- This simulates what the registration page does
SELECT 
  ppa.id,
  ppa.pastor_name,
  ppa.church_id,
  ppa.status,
  c.name AS church_name,
  c.location AS church_location
FROM pending_pastor_assignments ppa
LEFT JOIN churches c ON c.id = ppa.church_id
WHERE ppa.status = 'pending'
ORDER BY ppa.pastor_name;
