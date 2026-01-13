# Step 4: Configure Environment Variables - Detailed Guide

## Overview
We need to add your Supabase credentials to the app so it can connect to your database, authentication, and storage.

## Step-by-Step Instructions

### 4.1 Get Your Supabase Credentials

1. **Go to your Supabase project dashboard**
   - Navigate to: https://app.supabase.com
   - Select your project

2. **Open Settings**:
   - Click the gear icon (⚙️) in the left sidebar
   - Or click your project name → Settings

3. **Go to API section**:
   - Click "API" in the settings menu
   - You'll see your project credentials

4. **Copy these two values**:

   **a) Project URL**:
   - Look for "Project URL" or "URL"
   - It looks like: `https://xxxxxxxxxxxxx.supabase.co`
   - Copy the ENTIRE URL (including https://)
   - Example: `https://abcdefghijklmnop.supabase.co`

   **b) anon/public key**:
   - Under "Project API keys" section
   - Find the key labeled `anon` `public`
   - It's a long string starting with `eyJ...`
   - Copy the entire key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

5. **Save these temporarily** (you'll paste them in the next step)

### 4.2 Create .env File

1. **Navigate to your project root**:
   - Open your project folder: `C:\Users\kolaw\Projects\WMOI`
   - Make sure you're in the root directory (where `package.json` should be)

2. **Create .env file**:
   - Create a new file named `.env` (with the dot at the beginning)
   - **Important**: The file must be named exactly `.env` (not `env.txt` or `.env.txt`)
   
   **How to create in Windows**:
   - Option 1: In VS Code, click "New File" and name it `.env`
   - Option 2: In File Explorer, create new text file and rename to `.env`
   - Option 3: Use PowerShell:
     ```powershell
     New-Item -Path .env -ItemType File
     ```

3. **Open .env file** in a text editor (VS Code, Notepad, etc.)

### 4.3 Add Environment Variables

1. **Paste this template** into your `.env` file:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Replace the placeholders**:
   - Replace `your-project-url-here` with your actual Project URL
   - Replace `your-anon-key-here` with your actual anon/public key

3. **Your final .env file should look like**:

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important Notes**:
- ✅ No spaces around the `=` sign
- ✅ No quotes needed (but quotes won't break it)
- ✅ Each variable on its own line
- ✅ Must start with `VITE_` (required for Vite to expose them)

### 4.4 Verify .env File

1. **Check file location**:
   - Should be in: `C:\Users\kolaw\Projects\WMOI\.env`
   - Same folder as `package.json` and `vite.config.ts`

2. **Check file contents**:
   - Should have 2 lines
   - Both should start with `VITE_`
   - Values should be your actual Supabase credentials

3. **Save the file**

## What You Should Have

✅ `.env` file created in project root  
✅ `VITE_SUPABASE_URL` with your project URL  
✅ `VITE_SUPABASE_ANON_KEY` with your anon key  
✅ File saved  

## Troubleshooting

### "File not found" or "Can't find .env"
- Make sure the file is in the root directory (same folder as `package.json`)
- Check the filename is exactly `.env` (not `.env.txt`)
- On Windows, hidden files might not show - use `dir /a` in PowerShell

### "Environment variables not working"
- Make sure variable names start with `VITE_`
- Restart the dev server after creating/editing `.env`
- Check for typos in variable names

### "Invalid URL" or "Invalid key"
- Double-check you copied the ENTIRE URL (including https://)
- Double-check you copied the ENTIRE key (it's very long)
- Make sure there are no extra spaces

### "File is hidden"
- In VS Code, files starting with `.` might be hidden
- Use `Ctrl+Shift+P` → "Toggle Excluded Files" to show them
- Or use File Explorer → View → Show hidden files

## Security Reminder

⚠️ **Never commit .env to Git!**
- The `.gitignore` file should already exclude it
- Never share your `.env` file publicly
- These keys give access to your database

## Next Steps

Once `.env` is configured:
- ✅ Proceed to **Step 5: Install Dependencies**
- Then **Step 6: Run Development Server**

---

**Ready?** Let me know when you've created the `.env` file and we'll move to Step 5!
