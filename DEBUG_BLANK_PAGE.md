# Debug Blank Page Issue

## Step 1: Check Browser Console

1. **Open Developer Tools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Or `Cmd+Option+I` (Mac)

2. **Go to Console Tab:**
   - Look for any red error messages
   - Common errors:
     - `Failed to fetch`
     - `Invalid API key`
     - `Cannot read property of undefined`
     - `Module not found`

3. **Go to Network Tab:**
   - Refresh the page
   - Look for failed requests (red status codes)
   - Check if `index.html` is loading (should be 200)
   - Check if JavaScript files are loading

## Step 2: Check Environment Variables

The blank page might be because Supabase credentials are missing:

1. **Go to AWS Amplify Console**
2. **App settings** → **Environment variables**
3. Verify these are set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Step 3: Check Build Logs

1. **Go to Amplify Console**
2. **Deployments** → Click latest deployment
3. **Build logs** → Look for errors
4. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Build failures

## Step 4: Common Causes

### Missing Environment Variables
- Check Amplify Console → Environment variables
- Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### JavaScript Errors
- Check browser console (F12)
- Look for red error messages
- Share the error message

### Build Issues
- Check Amplify build logs
- Verify build completed successfully

### CORS Issues
- Check Supabase CORS settings
- Add your Amplify domain to allowed origins

## What to Share

Please share:
1. **Browser console errors** (F12 → Console tab)
2. **Network tab** - any failed requests
3. **Amplify build logs** - any build errors
4. **Environment variables** - are they set? (don't share the values, just confirm they exist)
