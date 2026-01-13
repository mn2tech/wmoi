# Using Existing Users Table

## Option 1: Add a Field to Your Existing Users Table

If you have a `users` table, we can add a field to mark church app users.

### Step 1: Add Field to Users Table

Run this SQL in Supabase SQL Editor:

```sql
-- Add a field to mark church app users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_church_user BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_church_user ON users(is_church_user) WHERE is_church_user = TRUE;
```

### Step 2: Mark Existing User as Church User

```sql
-- Mark your user as church app user
UPDATE users 
SET is_church_user = TRUE 
WHERE email = 'nm2tech77@gmail.com';
```

## Option 2: Use a Role/App Field

If your `users` table already has a role or app field:

```sql
-- Example: Add app field if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS app TEXT;

-- Mark user for church app
UPDATE users 
SET app = 'church' 
WHERE email = 'nm2tech77@gmail.com';
```

## Option 3: Create a Junction Table

Keep both tables and create a relationship:

```sql
-- Create junction table
CREATE TABLE IF NOT EXISTS user_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL, -- 'church' or 'timesheet'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, app_name)
);

-- Add your user to church app
INSERT INTO user_apps (user_id, app_name)
SELECT id, 'church' FROM users WHERE email = 'nm2tech77@gmail.com';
```

---

**Which approach do you prefer?** Or can you share your `users` table structure?
