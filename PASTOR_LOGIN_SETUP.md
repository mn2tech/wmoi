# Pastor Login System Setup Guide

## Overview

The app now supports separate login for pastors! Pastors can:
- Log in with their own credentials
- See and manage only their own church
- Add/edit/delete members for their church
- Update church information (pastor details, attendance, tithes)
- Cannot see other churches' data

## Setup Steps

### Step 1: Run the Migration

1. Go to Supabase → SQL Editor
2. Open `supabase/migrations/003_pastor_support.sql`
3. Copy all the SQL
4. Paste and run in SQL Editor
5. This will:
   - Add `church_id` field to `church_users` table
   - Add `pastor_user_id` field to `churches` table
   - Create RLS policies to restrict pastors to their own church

### Step 2: Assign Pastors to Churches

**Option A: Using the Admin Interface (Recommended)**

1. Log in as an admin user
2. Go to "Assign Pastors" in the sidebar
3. You can either:
   - **Assign existing user**: Select a church and an existing user, then click "Assign Pastor"
   - **Create new pastor**: Fill in email, name, password, select a church, then click "Create & Assign Pastor"

**Option B: Using SQL**

```sql
-- First, get the church ID and user ID
SELECT id, name FROM churches WHERE name = 'Church Name';
SELECT id, email FROM church_users WHERE email = 'pastor@example.com';

-- Then assign the pastor
UPDATE church_users
SET church_id = 'CHURCH_ID_HERE',
    role = 'pastor'
WHERE id = 'USER_ID_HERE';

-- Link the pastor to the church
UPDATE churches
SET pastor_user_id = 'USER_ID_HERE'
WHERE id = 'CHURCH_ID_HERE';
```

### Step 3: Test Pastor Login

1. Log out as admin
2. Log in with a pastor account
3. You should see:
   - "My Church" in the sidebar (instead of Dashboard, Church Form, etc.)
   - Only your church's data
   - Ability to add/edit members
   - Ability to update church information

## User Roles

### Admin
- Role: `admin` in `church_users` table
- `church_id`: `NULL`
- Can see all churches
- Can manage all churches
- Can assign pastors
- Access to: Dashboard, Church Form, Manage Churches, Assign Pastors

### Pastor
- Role: `pastor` in `church_users` table
- `church_id`: UUID of their assigned church
- Can only see their own church
- Can manage their own church and members
- Access to: My Church (Pastor Dashboard)

## Features

### Pastor Dashboard
- View church information
- Edit pastor details (name, phone, email)
- Update attendance and tithes
- Add/edit/delete members
- All changes save automatically

### Admin Features
- Assign existing users as pastors
- Create new pastor accounts
- Unassign pastors from churches
- View all assigned pastors

## Security

- **Row Level Security (RLS)** ensures pastors can only:
  - See their own church in the `churches` table
  - See members from their own church in the `members` table
  - Update only their own church data
- Admins can see and manage all churches
- Pastors cannot access admin pages (automatically redirected)

## Troubleshooting

### Pastor can't see their church
- Check that `church_users.church_id` is set
- Check that `church_users.role = 'pastor'`
- Verify RLS policies are enabled

### Pastor can see other churches
- Check RLS policies are correctly applied
- Verify `church_id` is correctly set in `church_users` table

### Can't assign pastor
- Make sure you're logged in as an admin
- Check that the user exists in `church_users` table
- Verify the church exists in `churches` table

## Next Steps

1. Run the migration SQL
2. Assign pastors to churches using the admin interface
3. Test pastor login
4. Pastors can now manage their own church data!
