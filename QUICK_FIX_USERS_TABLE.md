# Quick Fix: Use Your Existing Users Table

## Solution

Since you have an existing `users` table, we'll add a field to mark church app users.

## Step 1: Add Field to Users Table

Run this SQL in Supabase SQL Editor:

```sql
-- Add field to mark church app users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_church_user BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_church_user ON users(is_church_user) WHERE is_church_user = TRUE;
```

## Step 2: Mark Your User as Church User

```sql
-- Mark your user as church app user
UPDATE users 
SET is_church_user = TRUE 
WHERE email = 'nm2tech77@gmail.com';
```

## Step 3: Test Login

1. Go to `http://localhost:5173/login`
2. Enter your email and password
3. You should now be able to log in!

## How It Works

The app now checks:
1. First: `church_users` table (if it exists)
2. Then: `users` table with `is_church_user = TRUE`
3. Also: `users` table with `app = 'church'` (if you use app field)

## Alternative: Use 'app' Field

If your `users` table already has an `app` field:

```sql
-- Mark user for church app
UPDATE users 
SET app = 'church' 
WHERE email = 'nm2tech77@gmail.com';
```

The code will automatically detect and use this.

---

**Run the SQL above and you should be good to go!**
