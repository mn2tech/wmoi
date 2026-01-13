# Fix: Invalid API Key Error

If you're seeing "Invalid API key" error, follow these steps:

## Step 1: Verify You're Using the Correct Key

In Supabase, there are **two** API keys. You must use the **anon public** key:

1. Go to **Supabase Dashboard** → Your Project → **Settings** → **API**
2. You'll see two keys:
   - **anon public** ← Use this one (safe to expose in frontend)
   - **service_role** ← DO NOT use this (secret key, backend only)

## Step 2: Copy the Correct Key

1. Find the **"anon public"** key section
2. Click the **copy icon** or **"Reveal"** button
3. The key should:
   - Start with `eyJ` (JWT format)
   - Be very long (hundreds of characters)
   - Look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Update in AWS Amplify

1. Go to **AWS Amplify Console** → Your App → **App settings** → **Environment variables**
2. Find `VITE_SUPABASE_ANON_KEY`
3. Click **Edit** or the pencil icon
4. **Delete the entire value** (select all and delete)
5. **Paste the new key** (make sure no extra spaces)
6. Click **Save**

## Step 4: Verify the Value

Before saving, check:
- ✅ No spaces before or after the key
- ✅ No quotes around the value
- ✅ Key starts with `eyJ`
- ✅ Key is the full length (not truncated)

## Step 5: Redeploy

**Important**: After updating the key, you MUST redeploy:

1. Go to your app in Amplify Console
2. Click **"Redeploy this version"** or wait for auto-deploy
3. Wait for build to complete (3-5 minutes)

## Step 6: Test Again

After redeploy:
1. Open your app
2. Open browser console (F12)
3. Look for: `✅ Supabase credentials found`
4. Try to log in
5. The "Invalid API key" error should be gone

## Common Mistakes

### ❌ Wrong: Using service_role key
- Service role key is for backend only
- Should never be exposed in frontend code
- Will cause security issues

### ❌ Wrong: Extra spaces
```
VITE_SUPABASE_ANON_KEY = eyJhbG...  ← Space before value
VITE_SUPABASE_ANON_KEY= eyJhbG...  ← Space after =
```

### ❌ Wrong: Quotes around value
```
VITE_SUPABASE_ANON_KEY="eyJhbG..."  ← Don't use quotes
```

### ✅ Correct: No spaces, no quotes
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## If Still Not Working

1. **Regenerate the key** (if needed):
   - Supabase Dashboard → Settings → API
   - Click "Reset" next to anon public key
   - Copy the new key
   - Update in Amplify

2. **Verify Supabase project is active**:
   - Check if project is paused
   - Verify billing/subscription status

3. **Check for typos**:
   - Compare the key character by character
   - Make sure nothing was cut off when copying

4. **Verify URL is correct**:
   - `VITE_SUPABASE_URL` should end with `.supabase.co`
   - Should match your project URL exactly

## Quick Test

After updating, check browser console for:
- `✅ Supabase credentials found` → Good
- `✅ Supabase client initialized` → Good
- `❌ Invalid API key` → Key is still wrong, check again
