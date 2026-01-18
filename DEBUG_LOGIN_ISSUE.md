# Debug Login Issue - Step by Step

## Step 1: Open Browser Console (F12)

## Step 2: Clear Console and Try Login Again

After logging in, look for these logs:
- `🔍 Full auth user ID:`
- `🔍 Query completed in X ms`
- `🔍 Query result - data:` or `error:`

## Step 3: If logs don't show, test directly in console

After logging in (before the error appears), paste this code in the console:

```javascript
// Import supabase (if not available, use window.supabase or the global)
const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')

// Get your Supabase credentials from the app
const supabaseUrl = 'https://ybpzhhzadvarebdclykl.supabase.co'
const supabaseAnonKey = 'YOUR_ANON_KEY' // Get this from .env or browser network tab

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Get current session
const { data: { session }, error: sessionError } = await supabase.auth.getSession()
console.log('=== SESSION CHECK ===')
console.log('Session exists:', !!session)
console.log('User ID:', session?.user?.id)
console.log('User Email:', session?.user?.email)
console.log('Session error:', sessionError)

// Test the query directly
console.log('\n=== DIRECT QUERY TEST ===')
const { data, error } = await supabase
  .from('church_users')
  .select('*')
  .eq('auth_user_id', session?.user?.id)
  .maybeSingle()

console.log('Query result - data:', data)
console.log('Query result - error:', error)
console.log('Error code:', error?.code)
console.log('Error message:', error?.message)
console.log('Error details:', error?.details)
console.log('Error hint:', error?.hint)

// Test if we can query at all (admin should see all)
console.log('\n=== TEST ALL USERS QUERY (Admin should see all) ===')
const { data: allData, error: allError } = await supabase
  .from('church_users')
  .select('*')

console.log('All users - data:', allData)
console.log('All users - error:', allError)
```

## Step 4: Check Network Tab

1. Open Network tab in DevTools
2. Filter by "church_users"
3. Look for the request to `/rest/v1/church_users`
4. Check:
   - Request URL
   - Request headers (especially Authorization)
   - Response status
   - Response body

## Step 5: Share Results

Copy and paste:
1. All console logs (especially the `🔍` logs)
2. The direct query test results
3. The network request details (if possible)

This will help identify if:
- The session is not being established correctly
- The RLS policies are blocking the query
- There's a timing issue
- Something else is wrong
