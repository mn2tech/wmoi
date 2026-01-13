# Pastor Self-Registration Setup Guide

## Overview

The system now supports a two-step process:
1. **Admin pre-assigns** a church to a pastor (by name and email)
2. **Pastor self-registers** and completes their account details

## Setup Steps

### Step 1: Run the Migration

1. Go to Supabase → SQL Editor
2. Run `supabase/migrations/004_pending_pastor_assignments.sql`
3. This creates the `pending_pastor_assignments` table

### Step 2: Admin Pre-Assigns Church to Pastor

1. Log in as admin
2. Go to "Assign Pastors" page
3. In the "Step 1: Pre-Assign Church to Pastor" section:
   - Enter pastor's name
   - Enter pastor's email
   - Select the church
   - Click "Create Pending Assignment"
4. Share the registration link with the pastor: `/register-pastor`

### Step 3: Pastor Completes Registration

1. Pastor goes to `/register-pastor` (or clicks "Pastor Registration" on login page)
2. Pastor enters their email (must match the pre-assigned email)
3. System automatically:
   - Finds the pending assignment
   - Shows the assigned church
   - Pre-fills the pastor's name
4. Pastor enters:
   - Full name (pre-filled, can edit)
   - Email (must match pre-assigned)
   - Password
   - Confirm password
5. Click "Register as Pastor"
6. System:
   - Creates auth user
   - Creates church_user record
   - Links to the pre-assigned church
   - Marks pending assignment as completed
7. Pastor is redirected to login

## Features

### For Admins:
- **Pre-assign churches** to pastors by name and email
- **View pending assignments** (waiting for pastor registration)
- **Cancel pending assignments** if needed
- **Track** which pastors have completed registration

### For Pastors:
- **Self-register** after being pre-assigned
- **See their assigned church** automatically
- **Complete their account** with password and details
- **No need to select church** (pre-assigned by admin)

## Workflow

```
Admin → Assign Pastors → Pre-Assign Church (name + email)
  ↓
Pastor → /register-pastor → Enter email
  ↓
System finds pending assignment → Shows assigned church
  ↓
Pastor completes form → Registers
  ↓
System links pastor to church → Marks assignment complete
  ↓
Pastor can now log in → Sees only their church
```

## Important Notes

- **Email must match**: Pastor must use the exact email that admin pre-assigned
- **One assignment per email**: Each email can only have one pending assignment
- **Assignment expires**: Once pastor registers, assignment is marked "completed"
- **Church is locked**: Pastor cannot change their assigned church during registration

## Troubleshooting

### Pastor sees "No pending assignment found"
- Check that admin created the pending assignment
- Verify the email matches exactly (case-insensitive)
- Check if assignment was cancelled

### Assignment already exists error
- Each email can only have one pending assignment per church
- Cancel the existing assignment first, or use a different email

### Pastor can't register
- Make sure migration 004 was run
- Check that pending assignment status is "pending"
- Verify RLS policies allow reading pending assignments
