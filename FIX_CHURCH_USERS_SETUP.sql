-- Fix church_users table setup
-- Run this in Supabase SQL Editor if registration is failing

-- Step 1: Ensure table exists (run migration 002 first if needed)
CREATE TABLE IF NOT EXISTS church_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'user',
  church_id UUID REFERENCES churches(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_church_users_auth_id ON church_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_church_users_email ON church_users(email);
CREATE INDEX IF NOT EXISTS idx_church_users_church_id ON church_users(church_id);

-- Step 3: Enable RLS
ALTER TABLE church_users ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Allow authenticated users to read church_users" ON church_users;
DROP POLICY IF EXISTS "Allow authenticated users to insert church_users" ON church_users;
DROP POLICY IF EXISTS "Allow authenticated users to update church_users" ON church_users;
DROP POLICY IF EXISTS "Users can read their own church_user record" ON church_users;

-- Step 5: Create policies that allow registration
-- Policy 1: Allow authenticated users to read their own record OR admins to read all
CREATE POLICY "Users can read their own church_user record"
  ON church_users FOR SELECT
  TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM church_users AS cu
      WHERE cu.auth_user_id = auth.uid()
      AND cu.role = 'admin'
      AND cu.church_id IS NULL
    )
  );

-- Policy 2: Allow ANY authenticated user to insert (for registration)
CREATE POLICY "Allow authenticated users to insert church_users"
  ON church_users FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());  -- Users can only insert their own record

-- Policy 3: Allow users to update their own record
CREATE POLICY "Allow users to update their own church_user record"
  ON church_users FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Step 6: Verify policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'church_users';

-- Step 7: Add your user manually (if registration still fails)
-- Replace 'YOUR_AUTH_USER_ID' with your actual auth.users.id
INSERT INTO church_users (auth_user_id, email, name, role, church_id)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'support@nm2tech.com'),
  'support@nm2tech.com',
  'Support User',
  'admin',
  NULL
)
ON CONFLICT (auth_user_id) DO UPDATE
SET role = 'admin',
    church_id = NULL,
    email = EXCLUDED.email;

-- Step 8: Verify it was added
SELECT * FROM church_users WHERE email = 'support@nm2tech.com';
