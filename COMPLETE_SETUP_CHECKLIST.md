# Complete Setup Checklist - Fix Login Issues

## Step 1: Fix RLS Recursion (REQUIRED - Run First!)

1. Go to Supabase → SQL Editor
2. Open `FIX_RLS_RECURSION.sql`
3. Copy the entire SQL script
4. Paste into SQL Editor
5. Click "Run"
6. ✅ You should see "Success" message

**This fixes the infinite recursion error in the RLS policy.**

## Step 2: Add Your Account to church_users

1. Still in Supabase SQL Editor
2. Run this SQL:

```sql
-- Add your account as admin
INSERT INTO church_users (auth_user_id, email, name, role, church_id)
SELECT 
  id,
  email,
  'Michael Kola',
  'admin',
  NULL
FROM auth.users
WHERE email = 'support@nm2tech.com'
ON CONFLICT (auth_user_id) DO UPDATE
SET 
  role = 'admin',
  church_id = NULL,
  name = 'Michael Kola',
  email = EXCLUDED.email;

-- Verify it was added
SELECT 
  email,
  name,
  role,
  CASE 
    WHEN church_id IS NULL AND role = 'admin' THEN '✅ Admin - Ready to login!'
    ELSE 'Check role/church_id'
  END as status
FROM church_users
WHERE email = 'support@nm2tech.com';
```

3. ✅ You should see a row with "✅ Admin - Ready to login!"

## Step 3: Verify Setup

Run this to check everything:

```sql
-- Check 1: Table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'church_users'
) as table_exists;

-- Check 2: Your account exists
SELECT * FROM church_users WHERE email = 'support@nm2tech.com';

-- Check 3: Policies are correct (should show 2 policies)
SELECT policyname FROM pg_policies WHERE tablename = 'church_users';
```

## Step 4: Login

1. Go back to your app
2. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Log in with:
   - Email: `support@nm2tech.com`
   - Your password
4. ✅ You should now have access!

## Troubleshooting

### If login still hangs:
- Check browser console (F12) for errors
- Make sure you ran Step 1 (RLS fix) BEFORE Step 2
- Verify your account exists: `SELECT * FROM church_users WHERE email = 'support@nm2tech.com';`

### If you see "account not registered":
- Your account wasn't added successfully
- Re-run Step 2 SQL
- Check for any error messages in SQL Editor

### If you see RLS errors:
- Make sure Step 1 was completed successfully
- Check policies: `SELECT * FROM pg_policies WHERE tablename = 'church_users';`
