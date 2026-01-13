# Step 3: Set Up Storage Bucket - Detailed Guide

## Overview
We need to create a storage bucket in Supabase to store pastor photos. This allows users to upload pastor photos in the Church Form.

## Step-by-Step Instructions

### 3.1 Navigate to Storage

1. **Go to your Supabase project dashboard**
   - Make sure you're in your existing project

2. **Open Storage**:
   - Click "Storage" in the left sidebar
   - You'll see the Storage management interface

### 3.2 Create New Bucket

1. **Click "New bucket" button**:
   - Usually a button in the top right or center
   - May say "Create bucket" or "New bucket"

2. **Fill in bucket details**:
   - **Name**: `pastor-photos`
     - ⚠️ **IMPORTANT**: Use this exact name (case-sensitive)
     - The app code expects this exact bucket name
   
   - **Public bucket**: 
     - ✅ **Check this box** (make it public)
     - This allows the app to display photos without authentication
     - Photos will be accessible via public URLs

3. **Click "Create bucket"** or "Save"

### 3.3 Verify Bucket Created

1. **Check the bucket list**:
   - You should see `pastor-photos` in your buckets list
   - It should show as "Public"

2. **Click on the bucket** to verify:
   - You should see an empty folder (no files yet)
   - This is normal - files will be added when pastors upload photos

### 3.4 (Optional) Configure Bucket Policies

The migration already sets up RLS policies, but let's verify:

1. **Click on `pastor-photos` bucket**
2. **Go to "Policies" tab** (if available)
3. **Verify policies exist**:
   - Should allow authenticated users to upload
   - Should allow public read access (since it's a public bucket)

**Note**: If you don't see policies, that's okay - the public bucket setting should be sufficient for now.

## What You Should Have

✅ Storage bucket created  
✅ Bucket named: `pastor-photos`  
✅ Bucket set to **Public**  
✅ Bucket visible in Storage dashboard  

## Troubleshooting

### "Bucket name already exists"
- You might already have this bucket
- That's fine! Just verify it's set to Public
- Or use a different name and update the code (not recommended)

### "Can't find Storage option"
- Make sure you're in the correct project
- Storage should be in the left sidebar
- If not visible, check your Supabase plan (should be available on Free tier)

### "Bucket not public"
- Click on the bucket
- Look for settings/configuration
- Make sure "Public bucket" is checked/enabled

## How It Works

When a user uploads a pastor photo:
1. Photo is uploaded to `pastor-photos` bucket
2. Supabase generates a public URL
3. URL is stored in the `churches` table (`pastor_photo_url` column)
4. Photo displays in the app

## Next Steps

Once the bucket is created:
- ✅ Proceed to **Step 4: Configure Environment Variables**
- This is where you'll add your Supabase credentials to the app

---

**Ready?** Let me know when the bucket is created and we'll move to Step 4!
