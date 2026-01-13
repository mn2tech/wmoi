# Step 2: Configure Environment Variables - Detailed Guide

## What are Environment Variables?

Environment variables are configuration values stored outside your code. They keep sensitive information (like passwords and API keys) separate from your source code, making your application more secure and easier to configure for different environments (development, production, etc.).

## Why Do We Need Them?

1. **Security**: Sensitive data like database URLs and secrets aren't hardcoded in your source files
2. **Flexibility**: Easy to change settings without modifying code
3. **Best Practice**: Industry standard for managing application configuration

## What Each Variable Does

### 1. `DATABASE_URL`
- **Purpose**: Tells Prisma (our database tool) where to find or create the database file
- **Value**: `"file:./dev.db"`
- **Explanation**: 
  - `file:` means we're using a file-based database (SQLite)
  - `./dev.db` is the path to the database file (in the project root)
  - This will create a file called `dev.db` in your project folder

### 2. `NEXTAUTH_URL`
- **Purpose**: The base URL of your application
- **Value**: `"http://localhost:3000"` (for development)
- **Explanation**:
  - This is where your app runs during development
  - For production, you'd change this to your actual domain (e.g., `https://wmoi.org`)

### 3. `NEXTAUTH_SECRET`
- **Purpose**: A secret key used to encrypt session tokens and cookies
- **Value**: A long, random string (you need to generate this)
- **Why it's important**: 
  - This secures user login sessions
  - Must be unique and secret
  - Never share this value publicly

## How to Create the .env File

### Option 1: Using Command Line (Windows PowerShell)

1. Open PowerShell in your project directory
2. Run this command:
   ```powershell
   Copy-Item .env.example .env
   ```
3. Or create it manually:
   ```powershell
   New-Item -Path .env -ItemType File
   ```

### Option 2: Using Command Line (Windows CMD)

```cmd
copy .env.example .env
```

### Option 3: Manual Creation

1. Open your project folder in File Explorer
2. Create a new file named `.env` (note the dot at the beginning)
3. Make sure it's in the root directory (same folder as `package.json`)

## How to Generate NEXTAUTH_SECRET

### Method 1: Using OpenSSL (Recommended)

**Windows (if OpenSSL is installed):**
```powershell
openssl rand -base64 32
```

**If OpenSSL is not installed:**
- Download from: https://slproweb.com/products/Win32OpenSSL.html
- Or use one of the methods below

### Method 2: Using Node.js (Always Available)

1. Open PowerShell or Command Prompt in your project folder
2. Run:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

### Method 3: Using Online Generator

Visit: https://generate-secret.vercel.app/32
- Copy the generated string

### Method 4: Using PowerShell (Windows)

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

## Complete .env File Example

After creating the file and generating your secret, your `.env` file should look like this:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="aBc123XyZ789...your-generated-secret-here...xyz456"
```

**Important Notes:**
- No spaces around the `=` sign
- Keep the quotes around the values
- Each variable on its own line
- No blank lines between variables (optional, but cleaner)

## Step-by-Step Instructions

1. **Navigate to your project folder:**
   ```powershell
   cd C:\Users\kolaw\Projects\WMOI
   ```

2. **Check if .env.example exists:**
   ```powershell
   dir .env.example
   ```

3. **Copy the example file:**
   ```powershell
   Copy-Item .env.example .env
   ```

4. **Generate your secret key:**
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   Copy the output (it will be a long string of random characters)

5. **Open .env in a text editor:**
   ```powershell
   notepad .env
   ```
   Or use VS Code:
   ```powershell
   code .env
   ```

6. **Replace the placeholder:**
   - Find: `NEXTAUTH_SECRET="your-secret-key-here-change-in-production"`
   - Replace with: `NEXTAUTH_SECRET="paste-your-generated-secret-here"`

7. **Save the file**

## Verification

To verify your .env file is set up correctly:

1. Make sure the file exists:
   ```powershell
   Test-Path .env
   ```
   Should return `True`

2. Check the file contents (without revealing secrets):
   ```powershell
   Get-Content .env
   ```
   You should see all three variables

## Common Mistakes to Avoid

❌ **Don't commit .env to Git**
- The `.gitignore` file already excludes it
- Never share your `.env` file publicly

❌ **Don't use simple passwords**
- `NEXTAUTH_SECRET` must be a long, random string
- Don't use "password123" or similar

❌ **Don't forget the quotes**
- Values should be in quotes: `"value"`
- Not: `value` or `'value'`

❌ **Don't add spaces around =**
- Correct: `DATABASE_URL="file:./dev.db"`
- Wrong: `DATABASE_URL = "file:./dev.db"`

## Troubleshooting

### "Cannot find .env file"
- Make sure you're in the project root directory
- Check the file name is exactly `.env` (with the dot)
- On Windows, hidden files might not show - use `dir /a` to see all files

### "NEXTAUTH_SECRET is missing"
- Make sure you replaced the placeholder text
- Verify there are no extra spaces or typos
- Check that the quotes are correct

### "Invalid DATABASE_URL"
- Make sure the path uses forward slashes or double backslashes
- For Windows: `"file:./dev.db"` or `"file:.\\dev.db"`

## Next Steps

Once your `.env` file is configured correctly, proceed to **Step 3: Initialize Database**.

Your `.env` file is now ready! 🎉

