-- Create church_users table to separate church app users from other apps
CREATE TABLE IF NOT EXISTS church_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE, -- References Supabase auth.users
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'user', -- 'admin', 'user', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_church_users_auth_id ON church_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_church_users_email ON church_users(email);

-- Enable Row Level Security
ALTER TABLE church_users ENABLE ROW LEVEL SECURITY;

-- Create policies for church_users
CREATE POLICY "Allow authenticated users to read church_users"
  ON church_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert church_users"
  ON church_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update church_users"
  ON church_users FOR UPDATE
  TO authenticated
  USING (true);

-- Function to automatically create church_user when auth user is created
-- This is optional - you can also create church_users manually
CREATE OR REPLACE FUNCTION public.handle_new_church_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.church_users (auth_user_id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create church_user (optional - comment out if you want manual creation)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_church_user();
