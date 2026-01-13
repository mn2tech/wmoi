# Setting Up a Separate Supabase Project

## Why Separate Projects?

If you want complete separation between your timesheet app and church admin app, create a new Supabase project.

## Quick Setup Guide

### 1. Create New Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Name it: `wmoi-church-admin` (or similar)
4. Set database password
5. Choose region
6. Select Free plan
7. Wait for provisioning

### 2. Run Migration

1. Go to SQL Editor
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run

### 3. Create Storage Bucket

1. Go to Storage
2. Create bucket: `pastor-photos`
3. Set to Public

### 4. Update .env File

Update your `.env` with the NEW project credentials:

```env
VITE_SUPABASE_URL=https://new-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=new-anon-key-here
```

### 5. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Benefits

✅ Complete user separation  
✅ Independent databases  
✅ Separate storage buckets  
✅ Better security isolation  
✅ Easier to manage permissions  

## Alternative: Use Same Project

If you're okay with shared authentication:
- Users can log into both apps with same credentials
- You can add app-specific filtering in code later
- Simpler to manage

---

**Which do you prefer?** Separate project or shared users?
