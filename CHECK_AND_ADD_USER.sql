-- Step 1: Check if your user exists in church_users table
-- Replace 'your-email@example.com' with your actual email
SELECT 
  cu.*,
  au.email as auth_email
FROM church_users cu
JOIN auth.users au ON cu.auth_user_id = au.id
WHERE au.email = 'your-email@example.com';

-- Step 2: If the query above returns no rows, add yourself as admin
-- Replace 'your-email@example.com' with your actual email
-- Replace 'your-auth-user-id' with your auth.users.id (get it from Step 3)

-- Step 3: Get your auth user ID first
SELECT id, email 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Step 4: Add yourself to church_users (replace the values)
INSERT INTO church_users (auth_user_id, email, name, role, church_id)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', email) as name,
  'admin' as role,
  NULL as church_id
FROM auth.users
WHERE email = 'your-email@example.com'
AND NOT EXISTS (
  SELECT 1 FROM church_users WHERE auth_user_id = auth.users.id
)
RETURNING *;

-- Step 5: Verify you were added
SELECT 
  cu.*,
  au.email as auth_email
FROM church_users cu
JOIN auth.users au ON cu.auth_user_id = au.id
WHERE au.email = 'your-email@example.com';
