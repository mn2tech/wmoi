# Troubleshooting "Failed to fetch" on AWS Amplify

If you're seeing "Failed to fetch" errors after deploying to AWS Amplify, follow these steps:

## Step 1: Verify Environment Variables

**Critical**: Environment variables must be set in AWS Amplify Console, not in code.

1. Go to AWS Amplify Console → Your App → **App settings** → **Environment variables**
2. Verify these are set:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. **Important**: 
   - Variable names MUST start with `VITE_` (required for Vite)
   - Values should NOT have quotes
   - After adding/changing, you MUST redeploy

## Step 2: Check Supabase CORS Settings

Supabase needs to allow requests from your Amplify domain.

1. Go to Supabase Dashboard → Your Project → **Settings** → **API**
2. Scroll to **"Allowed origins"** or **"CORS"** section
3. Add your Amplify domain:
   ```
   https://main.xxxxx.amplifyapp.com
   https://*.amplifyapp.com
   ```
   Or for custom domain:
   ```
   https://yourdomain.com
   ```
4. Click **Save**

## Step 3: Verify Build Logs

Check if environment variables are being read during build:

1. Go to AWS Amplify Console → Your App → **Build history**
2. Click on the latest build
3. Check the build logs for:
   - `✅ Supabase credentials found` (should appear)
   - Any errors about missing environment variables

## Step 4: Check Browser Console

1. Open your deployed app
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Look for:
   - `✅ Supabase credentials found`
   - `✅ Supabase client initialized`
   - Any red error messages

## Step 5: Test API Connection

1. Open Browser Console (F12)
2. Go to **Network** tab
3. Try to log in or perform an action
4. Look for failed requests:
   - Check the **Status** column (should be 200, not 401/403/500)
   - Check the **Request URL** (should be your Supabase URL)
   - Check **CORS** errors (red text about CORS policy)

## Step 6: Common Issues and Fixes

### Issue: Invalid API key
**Symptom**: Console shows "Invalid API key" or 401/403 errors
**Fix**: 
1. Go to Supabase Dashboard → Settings → API
2. Copy the **"anon public"** key (NOT the service_role key)
3. Verify the key in Amplify Console:
   - No extra spaces before/after
   - No quotes around the value
   - Key starts with `eyJ` (JWT format)
4. Update the `VITE_SUPABASE_ANON_KEY` variable in Amplify
5. Redeploy the app

**Important**: Use the **anon public** key, NOT the service_role key!

### Issue: Environment variables not set
**Symptom**: Console shows `❌ CRITICAL: Missing Supabase environment variables!`
**Fix**: Add environment variables in Amplify Console and redeploy

### Issue: CORS error
**Symptom**: Console shows `CORS policy: No 'Access-Control-Allow-Origin' header`
**Fix**: Add Amplify domain to Supabase allowed origins (Step 2)

### Issue: 401 Unauthorized
**Symptom**: Network tab shows 401 status
**Fix**: 
- Verify `VITE_SUPABASE_ANON_KEY` is correct
- Check Supabase project is active
- Verify RLS policies allow public access where needed

### Issue: Wrong Supabase URL
**Symptom**: Network requests fail with connection errors
**Fix**: 
- Verify `VITE_SUPABASE_URL` is correct (should end with `.supabase.co`)
- Check for typos in environment variables

## Step 7: Quick Test Script

Add this to your browser console to test the connection:

```javascript
// Test Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing');

if (supabaseUrl && supabaseKey) {
  fetch(`${supabaseUrl}/rest/v1/churches?select=count`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  .then(r => r.json())
  .then(data => console.log('✅ Connection successful:', data))
  .catch(err => console.error('❌ Connection failed:', err));
}
```

## Step 8: Redeploy After Changes

**Important**: After making any changes:
1. Environment variables → Redeploy required
2. CORS settings → No redeploy needed (takes effect immediately)
3. Code changes → Auto-deploys on git push

## Still Not Working?

1. **Check Supabase Project Status**:
   - Go to Supabase Dashboard
   - Verify project is active (not paused)
   - Check for any service alerts

2. **Verify Network Connectivity**:
   - Try accessing Supabase URL directly in browser
   - Check if your network/firewall blocks Supabase domains

3. **Check RLS Policies**:
   - Verify Row Level Security policies allow access
   - Test with Supabase SQL Editor to ensure data is accessible

4. **Review Amplify Build Logs**:
   - Look for any warnings or errors during build
   - Check if environment variables are being injected correctly

5. **Test Locally First**:
   - Set up `.env` file locally
   - Run `npm run dev`
   - If it works locally but not on Amplify, it's an environment variable issue

## Contact Support

If none of these steps work:
1. Share the exact error message from browser console
2. Share the network request details (URL, status, response)
3. Verify environment variables are set correctly (without sharing the actual values)
