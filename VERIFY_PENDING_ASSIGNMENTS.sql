-- Quick verification script - Run this to check if assignments exist and are accessible
-- Run this in Supabase SQL Editor

-- Check 1: Count pending assignments
SELECT 
  'Total pending assignments' AS check_type,
  COUNT(*) AS count
FROM pending_pastor_assignments
WHERE status = 'pending';

-- Check 2: List all pending assignments with details
SELECT 
  'Pending assignments list' AS check_type,
  id,
  pastor_name,
  church_id,
  status,
  created_at
FROM pending_pastor_assignments
WHERE status = 'pending'
ORDER BY pastor_name;

-- Check 3: Test as anonymous user (this is what the app does)
SET ROLE anon;
SELECT 
  'Anonymous user test' AS check_type,
  id,
  pastor_name,
  church_id,
  status
FROM pending_pastor_assignments
WHERE status = 'pending'
ORDER BY pastor_name;
RESET ROLE;

-- Check 4: Verify RLS policies exist
SELECT 
  'RLS Policy check' AS check_type,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'pending_pastor_assignments'
  AND roles::text LIKE '%anon%';

-- If Check 3 returns empty but Check 2 has data, the RLS policy is not working
-- Run FIX_PENDING_ASSIGNMENTS_ACCESS.sql to fix it
