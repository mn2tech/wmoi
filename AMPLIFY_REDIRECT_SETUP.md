# AWS Amplify Redirect Setup - Step by Step

## Problem
Getting 404 errors when accessing routes like `/login/` or `/dashboard/`.

## Solution: Configure Redirects in AWS Amplify Console

### Step 1: Access AWS Amplify Console
1. Go to: https://console.aws.amazon.com/amplify/
2. Sign in to your AWS account
3. Find and click on your app: **wmoi** or **main**

### Step 2: Navigate to Rewrites and Redirects
1. In the left sidebar, click **App settings**
2. Scroll down and click **Rewrites and redirects**

### Step 3: Add Redirect Rule
1. Click **Add rule** or **Edit** (if rules exist)
2. Fill in the form:
   - **Source address:** `</^[^.]+$/>`
   - **Target address:** `/index.html`
   - **Type:** Select `200 (Rewrite)` from dropdown
3. Click **Save**

### Step 4: Verify the Rule
You should see a rule like:
```
Source: </^[^.]+$/>
Target: /index.html
Type: 200 (Rewrite)
```

### Step 5: Test
1. Wait a few seconds for changes to propagate
2. Try accessing: `https://main.dy1ev7berzso9.amplifyapp.com/login`
3. It should work now!

## Alternative: Access Root URL

If you can't configure redirects right now, access the app from the root:
- ✅ `https://main.dy1ev7berzso9.amplifyapp.com/` (root - will work)
- ❌ `https://main.dy1ev7berzso9.amplifyapp.com/login/` (with trailing slash - 404)
- ✅ `https://main.dy1ev7berzso9.amplifyapp.com/login` (without trailing slash - might work)

Once you access the root URL, React Router will handle the routing client-side.

## Troubleshooting

### If redirects still don't work:
1. Check that the rule is saved correctly
2. Clear browser cache (Ctrl+Shift+R)
3. Try in incognito/private mode
4. Wait 1-2 minutes for changes to propagate

### If you see "No rules configured":
- Make sure you're in the correct app
- Check that you have permissions to edit app settings
- Try refreshing the page

## What the Redirect Does

The pattern `</^[^.]+$/>` matches:
- Any path that doesn't contain a dot (`.`)
- This excludes static files like `.js`, `.css`, `.png`, etc.
- All routes like `/login`, `/dashboard`, `/register` will be rewritten to `/index.html`
- The `200` status means it's a rewrite (not a redirect), so the URL stays the same

This allows React Router to handle all client-side routing.
