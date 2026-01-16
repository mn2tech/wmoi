# Fix 404 Error for /register-pastor/ on AWS Amplify

## Current Issue
Getting 404 error when accessing `/register-pastor/` route.

## Solution: Configure Redirects in AWS Amplify Console

### Step-by-Step Instructions:

1. **Go to AWS Amplify Console**
   - Visit: https://console.aws.amazon.com/amplify/
   - Sign in to your AWS account

2. **Select Your App**
   - Find and click on your app (should be named something like "wmoi" or similar)

3. **Navigate to App Settings**
   - In the left sidebar, click on **"App settings"**
   - Then click on **"Rewrites and redirects"**

4. **Add Redirect Rule**
   - Click **"Edit"** button
   - Click **"Add rewrite rule"** or **"Add redirect rule"**
   - Fill in the form:
     - **Source address:** `/<*>`
     - **Target address:** `/index.html`
     - **Type:** Select **"Rewrite (200)"** (NOT redirect 301/302)
     - **Country code:** (leave empty)
   - Click **"Save"**

5. **Verify the Rule**
   - You should see a rule like:
     ```
     Source: /<*>
     Target: /index.html
     Type: Rewrite (200)
     ```

6. **Wait for Redeployment**
   - AWS Amplify will automatically redeploy after saving
   - Wait 2-3 minutes for the deployment to complete

7. **Test the Route**
   - Try: `https://main.dy1ev7berzso9.amplifyapp.com/register-pastor`
   - Should now load the React app instead of 404

## Alternative: If Rewrites Don't Work

If the rewrite rule doesn't work, try adding these specific redirect rules:

1. **Rule 1:**
   - Source: `/register-pastor`
   - Target: `/index.html`
   - Type: Rewrite (200)

2. **Rule 2:**
   - Source: `/register-pastor/*`
   - Target: `/index.html`
   - Type: Rewrite (200)

3. **Rule 3 (Catch-all):**
   - Source: `/<*>`
   - Target: `/index.html`
   - Type: Rewrite (200)

## Important Notes

- **Use Rewrite (200), NOT Redirect (301/302)**
  - Rewrite (200) keeps the URL in the browser
  - Redirect (301/302) changes the URL, which breaks React Router

- **The _redirects file should work, but sometimes Amplify needs manual configuration**
  - The `public/_redirects` file is correct
  - But AWS Amplify may need you to configure it in the console

- **Trailing Slash Issue**
  - Try both `/register-pastor` and `/register-pastor/`
  - React Router should handle both, but Amplify redirects might need both configured

## Verification

After configuring, test these URLs:
- ✅ `https://main.dy1ev7berzso9.amplifyapp.com/` (home)
- ✅ `https://main.dy1ev7berzso9.amplifyapp.com/register-pastor` (no trailing slash)
- ✅ `https://main.dy1ev7berzso9.amplifyapp.com/register-pastor/` (with trailing slash)
- ✅ `https://main.dy1ev7berzso9.amplifyapp.com/login`
- ✅ `https://main.dy1ev7berzso9.amplifyapp.com/dashboard`

All should load the React app, not return 404.
