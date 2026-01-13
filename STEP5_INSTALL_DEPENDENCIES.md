# Step 5: Install Dependencies - Detailed Guide

## Overview
We need to switch to the Vite version and install all required dependencies for the Supabase-based app.

## Step-by-Step Instructions

### 5.1 Switch to Vite Package Configuration

Since we're using Supabase (not Next.js), we need to use the Vite version:

1. **Backup current package.json** (optional, but safe):
   - Rename `package.json` to `package-nextjs.json` (backup)
   - Or just keep it - we can switch back if needed

2. **Use the Vite package.json**:
   - Rename `package-vite.json` to `package.json`
   - Or copy its contents to `package.json`

**Quick way in PowerShell**:
```powershell
cd C:\Users\kolaw\Projects\WMOI
Rename-Item -Path package.json -NewName package-nextjs-backup.json
Rename-Item -Path package-vite.json -NewName package.json
```

**Or manually**:
- Rename `package.json` → `package-nextjs-backup.json`
- Rename `package-vite.json` → `package.json`

### 5.2 Install Dependencies

1. **Open terminal in your project folder**:
   - Open PowerShell or Command Prompt
   - Navigate to: `C:\Users\kolaw\Projects\WMOI`

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Wait for installation**:
   - This will download all packages
   - Takes 1-3 minutes depending on internet speed
   - You'll see progress in the terminal

4. **Verify installation**:
   - Should see "added X packages" message
   - No errors should appear
   - `node_modules` folder should be created/updated

### 5.3 Verify Key Packages Installed

The following packages should be installed:
- ✅ `@supabase/supabase-js` - Supabase client
- ✅ `react-router-dom` - Routing
- ✅ `chart.js` & `react-chartjs-2` - Charts
- ✅ `jspdf` - PDF export
- ✅ `xlsx` - Excel export
- ✅ `vite` - Build tool
- ✅ `tailwindcss` - Styling

## What You Should Have

✅ `package.json` updated to Vite version  
✅ Dependencies installed  
✅ `node_modules` folder created  
✅ No installation errors  

## Troubleshooting

### "package.json not found"
- Make sure you're in the correct directory
- Check that `package.json` exists
- Verify you renamed `package-vite.json` to `package.json`

### "npm: command not found"
- Make sure Node.js is installed
- Check: `node --version` should show v18+
- Install Node.js from: https://nodejs.org

### "EACCES" or permission errors
- Try running as administrator
- Or use: `npm install --legacy-peer-deps`

### "Package conflicts"
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### Installation takes too long
- This is normal (1-3 minutes)
- Be patient, it's downloading many packages
- Check your internet connection

## Next Steps

Once dependencies are installed:
- ✅ Proceed to **Step 6: Run Development Server**
- Then **Step 7: Create Your First User**

---

**Ready?** Let me know when installation is complete and we'll start the dev server!
