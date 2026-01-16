-- Diagnostic script to check pending assignments and RLS policies
-- Run this in Supabase SQL Editor to troubleshoot "No pending assignments found"

-- Step 1: Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'pending_pastor_assignments'
) AS table_exists;

-- Step 2: Count all pending assignments (as admin)
SELECT 
  COUNT(*) AS total_pending,
  COUNT(DISTINCT pastor_name) AS unique_pastors,
  COUNT(DISTINCT church_id) AS unique_churches
FROM pending_pastor_assignments
WHERE status = 'pending';

-- Step 3: List all pending assignments (as admin)
SELECT 
  id,
  pastor_name,
  church_id,
  status,
  created_at
FROM pending_pastor_assignments
WHERE status = 'pending'
ORDER BY pastor_name;

-- Step 4: Check RLS policies for pending_pastor_assignments
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'pending_pastor_assignments'
ORDER BY policyname;

-- Step 5: Check if anonymous policy exists
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'pending_pastor_assignments'
  AND roles::text LIKE '%anon%';

-- Step 6: Test query as anonymous user (simulate what the app does)
-- This should return results if RLS is set up correctly
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

-- Step 7: If Step 6 returns no results but Step 3 has data, the RLS policy is blocking
-- Run this to create/fix the anonymous policy:
-- (Uncomment the lines below if needed)

/*
DROP POLICY IF EXISTS "Anonymous users can read pending assignments" ON pending_pastor_assignments;

CREATE POLICY "Anonymous users can read pending assignments"
  ON pending_pastor_assignments FOR SELECT
  TO anon
  USING (status = 'pending');
*/

-- Step 8: Verify the policy was created
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'pending_pastor_assignments'
  AND roles::text LIKE '%anon%';
