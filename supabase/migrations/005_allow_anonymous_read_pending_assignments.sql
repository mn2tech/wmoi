-- Migration: Allow anonymous users to read pending assignments for registration
-- This allows pastors to see their pending assignments during registration

-- Policy: Anonymous users can read pending assignments (for registration lookup)
CREATE POLICY "Anonymous users can read pending assignments"
  ON pending_pastor_assignments FOR SELECT
  TO anon
  USING (status = 'pending');

-- Policy: Anonymous users can read churches that are in pending assignments
-- This allows pastors to see their assigned church name during registration
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
