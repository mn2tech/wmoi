# Deploying to AWS Amplify

This guide will help you deploy the WMOI Church Admin app to AWS Amplify.

## Prerequisites

1. AWS Account
2. GitHub/GitLab/Bitbucket repository (or AWS CodeCommit)
3. Supabase project with all migrations run

## Step 1: Prepare Your Repository

1. **Commit all changes** to your Git repository:
   ```bash
   git add .
   git commit -m "Prepare for Amplify deployment"
   git push
   ```

2. **Verify the following files exist**:
   - `amplify.yml` (build configuration)
   - `package.json` (with build script)
   - `.env` is in `.gitignore` (environment variables should NOT be committed)

## Step 2: Create AWS Amplify App

1. **Go to AWS Amplify Console**:
   - Visit: https://console.aws.amazon.com/amplify/
   - Click "New app" → "Host web app"

2. **Connect Repository**:
   - Choose your Git provider (GitHub, GitLab, Bitbucket, or CodeCommit)
   - Authorize AWS Amplify to access your repository
   - Select your repository and branch (usually `main` or `master`)

3. **Configure Build Settings**:
   - Amplify should auto-detect the `amplify.yml` file
   - If not, you can manually configure:
     - **Build command**: `npm run build`
     - **Output directory**: `dist`
     - **Base directory**: (leave empty)

## Step 3: Configure Environment Variables

**IMPORTANT**: Add your Supabase credentials as environment variables in Amplify:

1. In Amplify Console, go to your app
2. Click **"App settings"** → **"Environment variables"**
3. Add the following variables:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Where to find these**:
   - Go to your Supabase project dashboard
   - Navigate to: Settings → API
   - Copy the "Project URL" → `VITE_SUPABASE_URL`
   - Copy the "anon public" key → `VITE_SUPABASE_ANON_KEY`

4. Click **"Save"**

## Step 4: Configure Redirects (Important for React Router)

Since this is a Single Page Application (SPA) with React Router, you need to configure redirects:

**Option 1: Using Amplify Console (Recommended)**

1. In Amplify Console, go to **"App settings"** → **"Rewrites and redirects"**
2. Click **"Add rewrite/redirect"**
3. Add the following redirect rule:

   ```
   Source address: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|eot|json)$)([^.]+$)/>
   Target address: /index.html
   Type: 200 (Rewrite)
   ```

   Or use this simpler rule:
   ```
   Source: /<*>
   Target: /index.html
   Type: 200 (Rewrite)
   ```

   This ensures that all routes (like `/dashboard`, `/login`, etc.) are handled by React Router.

**Option 2: Using _redirects file (Alternative)**

The `public/_redirects` file is included in the build. However, Amplify may require you to configure redirects in the console as well.

## Step 5: Deploy

1. Click **"Save and deploy"**
2. Amplify will:
   - Install dependencies (`npm ci`)
   - Build your app (`npm run build`)
   - Deploy to a CloudFront distribution
3. Wait for the build to complete (usually 3-5 minutes)

## Step 6: Access Your App

Once deployment is complete:

1. You'll get a URL like: `https://main.xxxxx.amplifyapp.com`
2. Click the URL to access your app
3. Test the login functionality

## Step 7: Custom Domain (Optional)

1. In Amplify Console, go to **"Domain management"**
2. Click **"Add domain"**
3. Enter your domain name (e.g., `churchadmin.yourdomain.com`)
4. Follow the DNS configuration instructions
5. Wait for SSL certificate provisioning (usually 5-10 minutes)

## Troubleshooting

### Build Fails

1. **Check build logs** in Amplify Console
2. Common issues:
   - Missing environment variables → Add them in "Environment variables"
   - TypeScript errors → Fix in your code
   - Missing dependencies → Check `package.json`

### App Shows Blank Screen

1. **Check browser console** for errors
2. **Verify environment variables** are set correctly
3. **Check Supabase CORS settings**:
   - Go to Supabase Dashboard → Settings → API
   - Add your Amplify domain to "Allowed origins"

### Routes Don't Work (404 errors)

1. **Verify redirect rules** are configured (Step 4)
2. **Check that `amplify.yml`** exists and is correct
3. **Ensure `base: '/'`** is set in `vite.config.ts`

### Environment Variables Not Working

1. **Restart the build** after adding environment variables
2. **Verify variable names** start with `VITE_` (required for Vite)
3. **Check build logs** to see if variables are being read

## Continuous Deployment

Amplify automatically deploys when you push to your connected branch:

1. Make changes to your code
2. Commit and push to your repository
3. Amplify will automatically:
   - Detect the push
   - Run the build
   - Deploy the new version

## Manual Deployments

To manually trigger a deployment:

1. Go to Amplify Console
2. Click **"Redeploy this version"** or **"Redeploy this app"**

## Cost Estimation

AWS Amplify Hosting pricing (as of 2024):
- **Free tier**: 15 GB storage, 5 GB served per month
- **Paid tier**: $0.15 per GB served, $0.01 per GB stored per month

For a small church admin app, the free tier should be sufficient.

## Security Notes

1. **Never commit `.env` files** to Git
2. **Use environment variables** in Amplify Console
3. **Keep your Supabase anon key public** (it's safe - RLS policies protect your data)
4. **Never expose service role keys** or other secrets

## Next Steps

After deployment:
1. Test all functionality (login, forms, reports)
2. Set up monitoring/alerts in AWS CloudWatch
3. Configure custom domain if needed
4. Set up backup strategy for Supabase data

## Support

If you encounter issues:
1. Check AWS Amplify documentation: https://docs.aws.amazon.com/amplify/
2. Check build logs in Amplify Console
3. Verify Supabase connection and RLS policies
