-- Create churches table
CREATE TABLE IF NOT EXISTS churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  pastor_name TEXT NOT NULL,
  pastor_phone TEXT,
  pastor_email TEXT,
  pastor_photo_url TEXT,
  attendance INTEGER DEFAULT 0,
  tithes NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_members_church_id ON members(church_id);
CREATE INDEX IF NOT EXISTS idx_churches_name ON churches(name);

-- Enable Row Level Security (RLS)
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
-- For now, allow authenticated users to read/write all data
-- In production, you may want more restrictive policies

-- Churches policies
CREATE POLICY "Allow authenticated users to read churches"
  ON churches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert churches"
  ON churches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update churches"
  ON churches FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete churches"
  ON churches FOR DELETE
  TO authenticated
  USING (true);

-- Members policies
CREATE POLICY "Allow authenticated users to read members"
  ON members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert members"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update members"
  ON members FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete members"
  ON members FOR DELETE
  TO authenticated
  USING (true);
