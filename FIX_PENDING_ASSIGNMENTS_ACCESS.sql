-- Comprehensive fix for "No pending assignments found" issue
-- Run this in Supabase SQL Editor to fix RLS policies for anonymous access

-- ============================================
-- STEP 1: Verify table exists and has data
-- ============================================
SELECT 'Step 1: Checking if table exists...' AS step;

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'pending_pastor_assignments'
) AS table_exists;

-- Count pending assignments (as authenticated admin)
SELECT 'Step 1b: Counting pending assignments...' AS step;
SELECT 
  COUNT(*) AS total_pending_assignments
FROM pending_pastor_assignments
WHERE status = 'pending';

-- List pending assignments (as authenticated admin)
SELECT 'Step 1c: Listing pending assignments...' AS step;
SELECT 
  id,
  pastor_name,
  church_id,
  status,
  created_at
FROM pending_pastor_assignments
WHERE status = 'pending'
ORDER BY pastor_name;

-- ============================================
-- STEP 2: Check current RLS policies
-- ============================================
SELECT 'Step 2: Checking current RLS policies...' AS step;

SELECT 
  tablename,
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'pending_pastor_assignments'
ORDER BY policyname;

-- ============================================
-- STEP 3: Fix RLS policies for anonymous access
-- ============================================
SELECT 'Step 3: Fixing RLS policies...' AS step;

-- Drop existing anonymous policy if it exists (to recreate it)
DROP POLICY IF EXISTS "Anonymous users can read pending assignments" ON pending_pastor_assignments;

-- Create policy for anonymous users to read pending assignments
CREATE POLICY "Anonymous users can read pending assignments"
  ON pending_pastor_assignments FOR SELECT
  TO anon
  USING (status = 'pending');

-- ============================================
-- STEP 4: Fix RLS policies for churches table
-- ============================================
SELECT 'Step 4: Fixing churches table RLS policies...' AS step;

-- Check current churches policies
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'churches'
  AND roles::text LIKE '%anon%'
ORDER BY policyname;

-- Drop existing anonymous policy for churches if it exists
DROP POLICY IF EXISTS "Anonymous users can read churches in pending assignments" ON churches;

-- Create policy for anonymous users to read churches in pending assignments
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

-- ============================================
-- STEP 5: Verify policies are created
-- ============================================
SELECT 'Step 5: Verifying policies...' AS step;

SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('pending_pastor_assignments', 'churches')
  AND roles::text LIKE '%anon%'
ORDER BY tablename, policyname;

-- ============================================
-- STEP 6: Test query as anonymous user
-- ============================================
SELECT 'Step 6: Testing query as anonymous user...' AS step;

-- Test the exact query the app uses
SET ROLE anon;
SELECT 
  id,
  pastor_name,
  church_id,
  status
FROM pending_pastor_assignments
WHERE status = 'pending'
ORDER BY pastor_name;
RESET ROLE;

-- ============================================
-- STEP 7: Summary
-- ============================================
SELECT 'Step 7: Summary' AS step;

SELECT 
  'If Step 6 returned results, the fix worked!' AS status,
  'Anonymous users can now read pending assignments' AS message
WHERE EXISTS (
  SELECT 1 FROM pending_pastor_assignments WHERE status = 'pending'
);

SELECT 
  'WARNING: No pending assignments found in database!' AS status,
  'Admin needs to create pending assignments first' AS message
WHERE NOT EXISTS (
  SELECT 1 FROM pending_pastor_assignments WHERE status = 'pending'
);
