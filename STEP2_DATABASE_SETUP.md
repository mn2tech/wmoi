# Step 2: Set Up Database - Using Existing Project

Since you're using an existing Supabase project, we'll add the new tables to it.

## Step-by-Step Instructions

### 2.1 Open SQL Editor

1. **Go to your Supabase project dashboard**
   - Navigate to: https://app.supabase.com
   - Select your existing project

2. **Open SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Or use the icon that looks like a database/query tool

3. **Create a new query**:
   - Click "New query" button (usually top right)
   - You'll see a blank SQL editor

### 2.2 Run the Migration

1. **Open the migration file**:
   - In your project, open: `supabase/migrations/001_initial_schema.sql`
   - Copy ALL the contents (Ctrl+A, Ctrl+C)

2. **Paste into SQL Editor**:
   - Paste the SQL code into the Supabase SQL Editor
   - You should see the CREATE TABLE statements

3. **Run the query**:
   - Click "Run" button (or press Ctrl+Enter / Cmd+Enter)
   - Wait for it to complete (usually 1-2 seconds)

4. **Check for success**:
   - You should see: "Success. No rows returned"
   - Or a green checkmark indicating success

### 2.3 Verify Tables Were Created

1. **Go to Table Editor**:
   - Click "Table Editor" in the left sidebar

2. **Verify you see**:
   - ✅ `churches` table
   - ✅ `members` table

3. **Check table structure**:
   - Click on `churches` table to see columns
   - Click on `members` table to see columns

### 2.4 (Optional) Add Seed Data

If you want to add the 19 initial churches:

1. **Go back to SQL Editor**
2. **Open the seed file**: `supabase/seed.sql`
3. **Copy the contents**
4. **Paste into SQL Editor**
5. **Run the query**
6. **Verify**: Go to Table Editor → `churches` table
   - You should see 19 churches (13 real + 6 placeholders)

**Note**: You can skip this step and add churches manually through the app later, or update the seed.sql with your actual 13 churches first.

## What Should Happen

✅ Tables created successfully  
✅ `churches` table visible in Table Editor  
✅ `members` table visible in Table Editor  
✅ RLS (Row Level Security) enabled  
✅ Policies created for authenticated users  

## Troubleshooting

### "relation already exists"
- This means the tables already exist
- You can either:
  - Drop them first: `DROP TABLE IF EXISTS members CASCADE; DROP TABLE IF EXISTS churches CASCADE;`
  - Or skip this step if tables are already set up correctly

### "permission denied"
- Make sure you're running as the project owner
- Check that you're in the correct project

### "syntax error"
- Make sure you copied the ENTIRE migration file
- Check for any missing semicolons
- Make sure you're pasting into SQL Editor, not Table Editor

## Next Steps

Once tables are created:
- ✅ Proceed to **Step 3: Set Up Storage Bucket** (for pastor photos)
- ✅ Then **Step 4: Configure Environment Variables**

---

**Ready?** Let me know when you've run the migration and I'll help with Step 3!
