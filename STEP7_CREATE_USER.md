# Step 7: Create Your First User - Detailed Guide

## Overview
You need to create a user account in Supabase Authentication so you can log in to the app.

## Step-by-Step Instructions

### 7.1 Navigate to Authentication

1. **Go to your Supabase project dashboard**
   - Navigate to: https://app.supabase.com
   - Select your project

2. **Open Authentication**:
   - Click "Authentication" in the left sidebar
   - You'll see the Users management interface

### 7.2 Create New User

1. **Click "Add user" button**:
   - Usually a button in the top right
   - Or click "Users" tab if not already there

2. **Select "Create new user"**:
   - You'll see options like "Create new user" or "Invite user"
   - Choose "Create new user"

3. **Fill in user details**:
   - **Email**: Enter your email address
     - Example: `admin@wmoi.org` or your personal email
   - **Password**: Create a strong password
     - At least 8 characters
     - Mix of letters, numbers, and symbols
   - **Auto Confirm User**: 
     - ✅ **Check this box** (important!)
     - This allows you to log in immediately without email verification

4. **Click "Create user"** or "Add user"

### 7.3 Verify User Created

1. **Check the Users list**:
   - You should see your new user in the list
   - Status should show as "Confirmed" or "Active"

2. **Note the email**:
   - You'll use this email to log in

## What You Should Have

✅ User created in Supabase Authentication  
✅ Email address saved  
✅ Password saved securely  
✅ User status: Confirmed/Active  

## Test Login

1. **Go back to your app**: `http://localhost:5173`
2. **Enter credentials**:
   - Email: The email you just created
   - Password: The password you set
3. **Click "Sign in"**
4. **You should be redirected to the Dashboard!**

## Troubleshooting

### "Invalid login credentials"
- Double-check email and password
- Make sure "Auto Confirm User" was checked
- Try creating the user again

### "User not found"
- Make sure you created the user in the correct project
- Check that the email is correct

### "Email not confirmed"
- Make sure you checked "Auto Confirm User" when creating
- Or check your email for verification link

### Can't find "Add user" button
- Make sure you're in Authentication → Users section
- Look for a "+" button or "New user" option

## Next Steps

Once you can log in:
- ✅ You'll see the Dashboard
- ✅ You can add churches in "Manage Churches"
- ✅ You can fill church data in "Church Form"
- ✅ You can view reports in "Dashboard"

---

**Ready?** Create your user and try logging in! Let me know if you need help.
