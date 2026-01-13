-- Migration: Add pending pastor assignments table
-- This allows admins to pre-assign churches to pastors before they register

CREATE TABLE IF NOT EXISTS pending_pastor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  pastor_name TEXT NOT NULL,
  pastor_email TEXT, -- Optional - will be filled by pastor during registration
  assigned_by UUID REFERENCES church_users(id), -- Admin who assigned
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(church_id, pastor_name) -- One pending assignment per church+name
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pending_assignments_church ON pending_pastor_assignments(church_id);
CREATE INDEX IF NOT EXISTS idx_pending_assignments_status ON pending_pastor_assignments(status);
CREATE INDEX IF NOT EXISTS idx_pending_assignments_church_name ON pending_pastor_assignments(church_id, pastor_name);

-- Enable RLS
ALTER TABLE pending_pastor_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read all pending assignments
CREATE POLICY "Admins can read all pending assignments"
  ON pending_pastor_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM church_users
      WHERE church_users.auth_user_id = auth.uid()
      AND church_users.role = 'admin'
      AND church_users.church_id IS NULL
    )
  );

-- Policy: Admins can create pending assignments
CREATE POLICY "Admins can create pending assignments"
  ON pending_pastor_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM church_users
      WHERE church_users.auth_user_id = auth.uid()
      AND church_users.role = 'admin'
      AND church_users.church_id IS NULL
    )
  );

-- Policy: Admins can update pending assignments
CREATE POLICY "Admins can update pending assignments"
  ON pending_pastor_assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM church_users
      WHERE church_users.auth_user_id = auth.uid()
      AND church_users.role = 'admin'
      AND church_users.church_id IS NULL
    )
  );

-- Policy: Anyone can read pending assignments (for registration lookup)
CREATE POLICY "Users can read pending assignments"
  ON pending_pastor_assignments FOR SELECT
  TO authenticated
  USING (status = 'pending');
