# Fix AWS Amplify 404 Error for Client-Side Routes

## Problem
Getting 404 errors when accessing routes like `/login/` or `/dashboard/` in AWS Amplify.

## Solution 1: Configure Redirects in AWS Amplify Console (Recommended)

1. Go to AWS Amplify Console
2. Select your app
3. Go to **App settings** → **Rewrites and redirects**
4. Add these redirect rules:

### Rule 1: Redirect all routes to index.html (SPA routing)
- **Source address:** `</^[^.]+$/>`
- **Target address:** `/index.html`
- **Type:** `200 (Rewrite)`

### Rule 2: Redirect trailing slash routes
- **Source address:** `</^[^.]+/$/>`
- **Target address:** `/index.html`
- **Type:** `200 (Rewrite)`

### Rule 3: Serve static assets directly
- **Source address:** `/assets/*`
- **Target address:** `/assets/*`
- **Type:** `200 (Rewrite)`

## Solution 2: Verify _redirects File

The `_redirects` file in `public/` should be copied to `dist/` during build. Verify:

1. After build, check `dist/_redirects` exists
2. It should contain:
   ```
   </^[^.]+$/>    /index.html   200
   ```

## Solution 3: Update amplify.yml

Add redirect configuration to `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
  # Add redirects for SPA
  customRedirects:
    - source: '</^[^.]+$/>'
      target: '/index.html'
      status: '200'
```

## Quick Fix: Access Root URL

For now, try accessing:
- `https://main.dy1ev7berzso9.amplifyapp.com/` (root)
- `https://main.dy1ev7berzso9.amplifyapp.com/login` (without trailing slash)

The app should handle routing from there.
