# Fix: JavaScript Files Being Served as HTML

## Problem
The error "Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'text/html'" means JavaScript files are being redirected to index.html instead of being served as JavaScript.

## Solution: Update Redirect Rule in AWS Amplify Console

The catch-all redirect `/<*>` is too broad and catches JavaScript files. We need to exclude static assets.

### Step 1: Update Redirect Rule in Amplify Console

1. Go to **AWS Amplify Console** → Your App
2. **Hosting** → **Rewrites and redirects**
3. Click **"Manage redirects"**
4. **Edit** the existing rule with `/<*>` → `/index.html`
5. Change the **Source address** from `/<*>` to this pattern:

```
</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|eot|json)$)([^.]+$)/>
```

6. **Target address:** `/index.html`
7. **Type:** `200 (Rewrite)`
8. **Save**

### Step 2: Alternative - Use Multiple Rules

If the regex pattern doesn't work, add these rules in order:

1. **Rule 1: Serve static assets**
   - Source: `/<*>`
   - Target: `/<*>`
   - Type: `200 (Rewrite)`
   - Condition: File exists

2. **Rule 2: Redirect routes to index.html**
   - Source: `/<*>`
   - Target: `/index.html`
   - Type: `200 (Rewrite)`

### Step 3: Verify

After updating:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check browser console - JavaScript files should load correctly
4. The app should render properly

## What This Does

The regex pattern `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|eot|json)$)([^.]+$)/>` means:
- Match routes that don't have a file extension (like `/register-pastor`)
- OR match routes with extensions that are NOT static assets
- This excludes `.js`, `.css`, `.png`, etc. from the redirect

## If Regex Doesn't Work

Use the simpler approach - update the redirect rule to:
- **Source:** `</^[^.]+$/>` (only routes without file extensions)
- **Target:** `/index.html`
- **Type:** `200 (Rewrite)`

This will only redirect routes without extensions (like `/register-pastor`) and leave all files (`.js`, `.css`, etc.) to be served normally.
