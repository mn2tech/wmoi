-- Quick SQL to add support@nm2tech.com to church_users table as ADMIN
-- Run this in Supabase SQL Editor

-- Step 1: Get the auth user ID for support@nm2tech.com
-- This will show you the user ID if the user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'support@nm2tech.com';

-- Step 2: Insert into church_users as ADMIN (can see all churches)
-- Replace 'YOUR_AUTH_USER_ID_HERE' with the ID from Step 1
-- If the SELECT above returns no rows, the user doesn't exist in auth.users yet
-- In that case, use the Registration page first, then run this SQL

INSERT INTO church_users (auth_user_id, email, name, role, church_id)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'support@nm2tech.com'),  -- Get auth user ID
  'support@nm2tech.com',
  'Support User',
  'admin',  -- Set as admin (can see all churches)
  NULL      -- NULL church_id means admin can see all churches
)
ON CONFLICT (auth_user_id) DO UPDATE
SET role = 'admin',
    church_id = NULL,
    email = EXCLUDED.email;

-- Step 3: Verify it was added
SELECT 
  cu.id,
  cu.email,
  cu.name,
  cu.role,
  cu.church_id,
  CASE 
    WHEN cu.church_id IS NULL AND cu.role = 'admin' THEN 'Admin (can see all churches)'
    WHEN cu.church_id IS NOT NULL AND cu.role = 'pastor' THEN 'Pastor (linked to one church)'
    ELSE 'User'
  END as user_type
FROM church_users cu
WHERE cu.email = 'support@nm2tech.com';
