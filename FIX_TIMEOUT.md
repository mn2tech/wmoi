# Fix: Session Check Timeout

## Problem
The session check is timing out, which means Supabase connection is failing.

## Most Likely Causes

### 1. Missing Environment Variables (Most Common)
**Check:**
- Does `.env` file exist in project root?
- Does it have `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`?

**Fix:**
1. Create/update `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
2. **Restart dev server** (important!):
   - Stop current server (Ctrl+C)
   - Run `npm run dev` again

### 2. Wrong Credentials
**Check:**
- Go to Supabase → Settings → API
- Verify URL and anon key match your `.env` file

### 3. Network/Connection Issue
**Check:**
- Internet connection
- Supabase project is active
- No firewall blocking requests

## Quick Test

1. **Check console for:**
   - "❌ CRITICAL: Missing Supabase environment variables!" → Missing `.env`
   - "✅ Supabase credentials found" → Credentials OK, but connection failing

2. **Verify `.env` file:**
   - Location: `C:\Users\kolaw\Projects\WMOI\.env`
   - Contains both variables
   - No typos

3. **Restart dev server:**
   ```bash
   # Stop current (Ctrl+C)
   npm run dev
   ```

## What I Changed

- Reduced timeout to 2 seconds (faster failure)
- Better error messages
- Login page shows even if connection fails
- More detailed console logging

---

**After fixing `.env` and restarting, the timeout should go away!**
