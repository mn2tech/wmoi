# Test Direct Query in Browser Console

After AWS Amplify redeploys (2-3 minutes), try this in the browser console:

## Step 1: Open Browser Console (F12)

## Step 2: After logging in, run this code:

```javascript
// Get the current session
const { data: { session }, error: sessionError } = await supabase.auth.getSession()
console.log('Session:', session?.user?.id)
console.log('Session error:', sessionError)

// Try the query directly
const { data, error } = await supabase
  .from('church_users')
  .select('*')
  .eq('auth_user_id', session?.user?.id)
  .maybeSingle()

console.log('Direct query - data:', data)
console.log('Direct query - error:', error)

// Also try without the filter to see if RLS allows any query
const { data: allData, error: allError } = await supabase
  .from('church_users')
  .select('*')

console.log('All users query - data:', allData)
console.log('All users query - error:', allError)
```

## Step 3: Check the results

- If `data` is `null` and `error` is also `null`, the RLS policies are blocking the query silently
- If `error` has a code like `PGRST301` or mentions "permission denied", it's an RLS issue
- If `data` is found, the query works and the issue is in the app code

## Step 4: Share the console output

Copy and paste the console output here so we can debug further.
