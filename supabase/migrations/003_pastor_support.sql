-- Migration: Add pastor support to church_users and churches tables
-- This allows pastors to be linked to specific churches and restricts their access

-- Step 1: Add church_id to church_users table to link pastors to their church
ALTER TABLE church_users 
ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_church_users_church_id ON church_users(church_id);

-- Step 2: Add pastor_user_id to churches table for easier lookup
ALTER TABLE churches
ADD COLUMN IF NOT EXISTS pastor_user_id UUID REFERENCES church_users(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_churches_pastor_user_id ON churches(pastor_user_id);

-- Step 3: Update RLS policies for churches table
-- Pastors can only see their own church
CREATE POLICY "Pastors can view their own church"
  ON churches FOR SELECT
  TO authenticated
  USING (
    -- Admins (role = 'admin' and church_id IS NULL) can see all churches
    -- Pastors (role = 'pastor' and church_id is set) can only see their own church
    EXISTS (
      SELECT 1 FROM church_users
      WHERE church_users.auth_user_id = auth.uid()
      AND (
        (church_users.role = 'admin' AND church_users.church_id IS NULL)
        OR (church_users.church_id = churches.id)
      )
    )
  );

-- Pastors can update their own church
CREATE POLICY "Pastors can update their own church"
  ON churches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM church_users
      WHERE church_users.auth_user_id = auth.uid()
      AND (
        (church_users.role = 'admin' AND church_users.church_id IS NULL)
        OR (church_users.church_id = churches.id)
      )
    )
  );

-- Admins can insert/update all churches
CREATE POLICY "Admins can manage all churches"
  ON churches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM church_users
      WHERE church_users.auth_user_id = auth.uid()
      AND church_users.role = 'admin'
      AND church_users.church_id IS NULL
    )
  );

-- Step 4: Update RLS policies for members table
-- Pastors can only see members from their own church
CREATE POLICY "Pastors can view members from their own church"
  ON members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM church_users
      JOIN churches ON churches.id = members.church_id
      WHERE church_users.auth_user_id = auth.uid()
      AND (
        (church_users.role = 'admin' AND church_users.church_id IS NULL)
        OR (church_users.church_id = members.church_id)
      )
    )
  );

-- Pastors can insert members to their own church
CREATE POLICY "Pastors can insert members to their own church"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM church_users
      WHERE church_users.auth_user_id = auth.uid()
      AND (
        (church_users.role = 'admin' AND church_users.church_id IS NULL)
        OR (church_users.church_id = members.church_id)
      )
    )
  );

-- Pastors can update members from their own church
CREATE POLICY "Pastors can update members from their own church"
  ON members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM church_users
      WHERE church_users.auth_user_id = auth.uid()
      AND (
        (church_users.role = 'admin' AND church_users.church_id IS NULL)
        OR (church_users.church_id = members.church_id)
      )
    )
  );

-- Pastors can delete members from their own church
CREATE POLICY "Pastors can delete members from their own church"
  ON members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM church_users
      WHERE church_users.auth_user_id = auth.uid()
      AND (
        (church_users.role = 'admin' AND church_users.church_id IS NULL)
        OR (church_users.church_id = members.church_id)
      )
    )
  );

-- Step 5: Update church_users policies to allow pastors to see their own record
DROP POLICY IF EXISTS "Allow authenticated users to read church_users" ON church_users;
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
