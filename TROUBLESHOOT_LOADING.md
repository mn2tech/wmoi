# Troubleshooting: App Stuck on Loading

## Quick Checks

### 1. Check Browser Console
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for any red error messages
4. Share the errors you see

### 2. Check Environment Variables
Make sure your `.env` file has:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**To verify:**
- Check that `.env` file exists in project root
- Restart dev server after changing `.env`
- Check console for "Missing Supabase environment variables" warning

### 3. Check if church_users Table Exists
1. Go to Supabase → Table Editor
2. Check if `church_users` table exists
3. If not, run migration: `supabase/migrations/002_church_users_table.sql`

### 4. Check Network Tab
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Look for failed requests (red)
4. Check if Supabase requests are timing out

## Common Issues

### Issue: "Missing Supabase environment variables"
**Fix:** 
- Create `.env` file with correct values
- Restart dev server: `npm run dev`

### Issue: "church_users table does not exist"
**Fix:**
- Run migration: `supabase/migrations/002_church_users_table.sql`
- Go to SQL Editor → Paste and run

### Issue: Network timeout
**Fix:**
- Check internet connection
- Check Supabase project is active
- Verify Supabase URL is correct

### Issue: User not in church_users table
**Fix:**
- Add user to `church_users` table manually
- Or use registration page to add yourself

## Quick Test

1. **Open browser console** (F12)
2. **Check for errors**
3. **Try accessing** `http://localhost:5173/login` directly
4. **If login page loads**, the issue is with authentication check
5. **If login page doesn't load**, the issue is with app initialization

---

**What errors do you see in the browser console?**
