# Quick Fix: Add Existing User to Church App

## Problem
User already exists in Supabase Auth (from timesheet app) but not in `church_users` table.

## Solution: Manual Addition

### Step 1: Get User ID from Supabase Auth

1. Go to Supabase Dashboard
2. Click **Authentication** → **Users**
3. Find user: `nm2tech77@gmail.com`
4. Click on the user
5. **Copy the User ID** (it's a UUID like `123e4567-e89b-12d3-a456-426614174000`)

### Step 2: Add to church_users Table

1. Go to **Table Editor** → **church_users**
2. Click **Insert row** (or **New row**)
3. Fill in:
   - `auth_user_id`: Paste the User ID from Step 1
   - `email`: `nm2tech77@gmail.com`
   - `name`: `Michael`
   - `role`: `user` (or `admin` if you want admin access)
   - `created_at`: Leave blank (auto-filled)
   - `updated_at`: Leave blank (auto-filled)
4. Click **Save**

### Step 3: Test Login

1. Go to `http://localhost:5173/login`
2. Enter:
   - Email: `nm2tech77@gmail.com`
   - Password: Your existing password
3. Click "Sign in"
4. You should now be able to access the dashboard!

## Alternative: Use Updated Registration

The registration page has been updated to handle existing users. You can:
1. Go to `/register`
2. Enter your existing email and password
3. It will automatically add you to `church_users` table

---

**That's it!** You should now be able to log in.
