# AWS Amplify Redirect Configuration

## Issue
Getting 404 error when accessing `/register-pastor/` route on AWS Amplify.

## Solution

### Option 1: Use _redirects file (Recommended)
The `public/_redirects` file should automatically be copied to `dist/_redirects` during build.

**Verify:**
1. After running `npm run build`, check if `dist/_redirects` exists
2. The file should contain: `/*    /index.html   200`

**If the file doesn't exist in dist:**
- Make sure `public/_redirects` exists
- Check `vite.config.ts` has `copyPublicDir: true`

### Option 2: Configure in AWS Amplify Console
If the `_redirects` file doesn't work, configure redirects in AWS Amplify Console:

1. Go to AWS Amplify Console
2. Select your app
3. Go to **App settings** → **Rewrites and redirects**
4. Add a new rule:
   - **Source address:** `/<*>`
   - **Target address:** `/index.html`
   - **Type:** Rewrite (200)
   - **Country code:** (leave empty)
   - Click **Save**

### Option 3: Update amplify.yml (if needed)
The `amplify.yml` file should already have the correct configuration. If redirects still don't work, you may need to add explicit redirect rules in the Amplify console.

## Testing
After deploying:
1. Try accessing: `https://your-app.amplifyapp.com/register-pastor`
2. Should NOT have a trailing slash
3. Should load the React app and show the registration form

## Common Issues
- **404 on all routes:** `_redirects` file not being copied or not configured in Amplify
- **404 only on specific routes:** Check React Router configuration in `App.tsx`
- **Works locally but not on Amplify:** Redirects not configured in Amplify console
