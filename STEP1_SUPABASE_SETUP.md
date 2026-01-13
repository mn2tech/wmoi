# Step 1: Create Supabase Project - Detailed Guide

## Overview
We'll create a free Supabase account and set up a new project for the WMOI Church Admin app.

## Step-by-Step Instructions

### 1.1 Sign Up / Log In to Supabase

1. **Go to Supabase**: Open your browser and navigate to:
   ```
   https://app.supabase.com
   ```

2. **Sign Up** (if you don't have an account):
   - Click "Start your project" or "Sign Up"
   - You can sign up with:
     - GitHub account (recommended - easiest)
     - Email and password
   - Follow the verification steps

3. **Log In** (if you already have an account):
   - Enter your credentials
   - Click "Log In"

### 1.2 Create a New Project

1. **Click "New Project"** button
   - Usually a green button in the top right or center of the dashboard

2. **Fill in Project Details**:
   - **Name**: `wmoi-church-admin` (or any name you prefer)
   - **Database Password**: 
     - Create a STRONG password (you'll need this later)
     - Save it securely! (Password manager or secure note)
     - Example: Use a password generator
   - **Region**: 
     - Choose closest to India (e.g., `Southeast Asia (Singapore)` or `Asia Pacific (Mumbai)`)
     - This affects database latency
   - **Pricing Plan**: 
     - Select **Free** (more than enough for 19 churches)
     - Free tier includes:
       - 500MB database
       - 1GB file storage
       - 50,000 monthly active users
       - 2GB bandwidth

3. **Click "Create new project"**

### 1.3 Wait for Project Provisioning

1. **Wait 1-2 minutes** for Supabase to:
   - Set up your PostgreSQL database
   - Configure authentication
   - Set up storage buckets
   - Provision all services

2. **You'll see a loading screen** with progress indicators
   - Don't close the browser tab
   - This usually takes 1-2 minutes

3. **When complete**, you'll be redirected to your project dashboard

### 1.4 Verify Project is Ready

You should see:
- ✅ Project dashboard
- ✅ Sidebar menu with: Table Editor, SQL Editor, Authentication, Storage, etc.
- ✅ Project URL and API keys visible

### 1.5 Get Your Project Credentials

You'll need these in Step 4 (Environment Variables):

1. **Go to Settings**:
   - Click the gear icon (⚙️) in the left sidebar
   - Or click your project name → Settings

2. **Go to API section**:
   - Click "API" in the settings menu

3. **Copy these values** (save them for later):
   - **Project URL**: 
     - Looks like: `https://xxxxxxxxxxxxx.supabase.co`
     - Copy this entire URL
   - **anon/public key**:
     - Under "Project API keys"
     - Copy the `anon` `public` key (the long string)
     - This starts with `eyJ...`

4. **Save these credentials**:
   - Create a temporary note (we'll use them in Step 4)
   - Or keep the browser tab open

## What You Should Have Now

✅ Supabase account created  
✅ New project created  
✅ Project URL copied  
✅ API key (anon/public) copied  
✅ Database password saved securely  

## Troubleshooting

### "Project creation failed"
- Try again after a few minutes
- Check your internet connection
- Try a different browser

### "Can't find API keys"
- Go to: Settings → API
- Make sure you're in the correct project
- Keys are in the "Project API keys" section

### "Forgot database password"
- You can reset it in Settings → Database
- But it's easier to save it now!

## Next Steps

Once you have:
- ✅ Project created
- ✅ Project URL
- ✅ API key (anon/public)

**Proceed to Step 2: Set Up Database**

You'll run the SQL migration to create the tables.

## Quick Checklist

- [ ] Signed up/logged into Supabase
- [ ] Created new project
- [ ] Named project (e.g., "wmoi-church-admin")
- [ ] Set strong database password (saved securely)
- [ ] Selected region (closest to India)
- [ ] Selected Free plan
- [ ] Waited for project to provision (1-2 minutes)
- [ ] Copied Project URL
- [ ] Copied anon/public API key
- [ ] Saved credentials for Step 4

---

**Ready?** Once you've completed all checkboxes, let me know and we'll move to Step 2!
