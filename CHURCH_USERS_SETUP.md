# Church Users Setup Guide

## Overview

We've created a separate `church_users` table to isolate church app users from your timesheet app users. This way, users from the timesheet app won't be able to access the church admin app.

## What Was Added

1. **`church_users` table** - Stores church app users only
2. **Authentication check** - App verifies user is in `church_users` table
3. **Registration page** - New users can register for church app
4. **Access control** - Only church_users can access the app

## Setup Steps

### 1. Run the Migration

1. Go to Supabase → SQL Editor
2. Open `supabase/migrations/002_church_users_table.sql`
3. Copy all the SQL
4. Paste and run in SQL Editor
5. Verify: Check Table Editor → you should see `church_users` table

### 2. Create Your First Church User

**Option A: Using the Registration Page (Recommended)**

1. Start your dev server: `npm run dev`
2. Go to: `http://localhost:5173/register`
3. Fill in:
   - Name
   - Email
   - Password
4. Click "Register"
5. You'll be automatically added to `church_users` table
6. Log in with your credentials

**Option B: Manual Creation in Supabase**

1. **Create user in Supabase Auth**:
   - Go to Authentication → Users
   - Click "Add user" → "Create new user"
   - Enter email and password
   - Check "Auto Confirm User"
   - Copy the User ID (UUID)

2. **Add to church_users table**:
   - Go to Table Editor → `church_users`
   - Click "Insert row"
   - Fill in:
     - `auth_user_id`: Paste the User ID from step 1
     - `email`: User's email
     - `name`: User's name
     - `role`: `user` or `admin`
   - Click "Save"

### 3. Test Login

1. Go to `http://localhost:5173/login`
2. Enter your email and password
3. You should be able to log in and see the dashboard

## How It Works

1. **User logs in** → Supabase Auth authenticates
2. **App checks** → Is this user in `church_users` table?
3. **If yes** → User can access the app
4. **If no** → User sees "Access Denied" message

## Adding More Users

### Method 1: Registration Page
- Users can register at `/register`
- Automatically creates both Auth user and church_user record

### Method 2: Manual (Supabase Dashboard)
- Create user in Authentication
- Add record to `church_users` table

### Method 3: SQL (Bulk)
```sql
-- Example: Add existing auth user to church_users
INSERT INTO church_users (auth_user_id, email, name, role)
VALUES (
  'auth-user-uuid-here',
  'user@example.com',
  'User Name',
  'user'
);
```

## Benefits

✅ **Complete separation** - Timesheet users can't access church app  
✅ **Same Supabase project** - No need for separate project  
✅ **Shared infrastructure** - But isolated user management  
✅ **Easy to manage** - Clear list of church app users  

## Troubleshooting

### "Access Denied" after login
- User exists in Auth but not in `church_users` table
- Add them to `church_users` table manually

### "User not found"
- Make sure you ran the migration
- Check that `church_users` table exists

### Registration fails
- Check browser console for errors
- Verify migration was run successfully
- Make sure RLS policies allow inserts

---

**Ready?** Run the migration and create your first church user!
