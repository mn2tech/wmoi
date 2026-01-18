# AWS Amplify Console Redirect Configuration

## CRITICAL: You MUST configure this in AWS Amplify Console

The `_redirects` file alone is not enough. You need to add redirect rules in the AWS Amplify Console.

## Step-by-Step Instructions

### 1. Go to AWS Amplify Console
- URL: https://console.aws.amazon.com/amplify/
- Sign in with your AWS account
- Find your app (should be named something like "wmoi" or "main")

### 2. Navigate to App Settings
- Click on your app
- In the left sidebar, click **"App settings"**
- Scroll down and click **"Rewrites and redirects"**

### 3. Add Redirect Rule
Click **"Add rule"** or **"Edit"** button, then add:

**Rule 1: Main SPA Redirect**
- **Source address:** `/*`
- **Target address:** `/index.html`
- **Type:** `200 (Rewrite)`
- Click **Save**

**Rule 2: Handle Trailing Slashes (Optional but recommended)**
- **Source address:** `/*/`
- **Target address:** `/index.html`
- **Type:** `200 (Rewrite)`
- Click **Save**

### 4. Verify Rules
You should see:
```
/*          /index.html    200 (Rewrite)
/*/         /index.html    200 (Rewrite)
```

### 5. Test
- Wait 30-60 seconds for changes to propagate
- Try: `https://main.dy1ev7berzso9.amplifyapp.com/login`
- Try: `https://main.dy1ev7berzso9.amplifyapp.com/login/`
- Both should work!

## Alternative: Access Root URL

If you can't configure redirects right now:
1. Go to: `https://main.dy1ev7berzso9.amplifyapp.com/` (root)
2. The app will load
3. React Router will handle all navigation from there

## Why This Is Needed

AWS Amplify serves static files. When you access `/login/`, Amplify looks for a file at that path. Since it doesn't exist, you get a 404. The redirect rule tells Amplify to serve `index.html` for all routes, allowing React Router to handle client-side routing.

## Troubleshooting

**If redirects still don't work:**
1. Make sure you saved the rules
2. Clear browser cache (Ctrl+Shift+R)
3. Try in incognito mode
4. Wait 1-2 minutes for propagation
5. Check that you're editing the correct app/branch

**If you see "No rules configured":**
- You might be in the wrong app
- Check you have edit permissions
- Try refreshing the page
