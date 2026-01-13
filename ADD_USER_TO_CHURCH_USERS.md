# Add User to church_users Table

## Step-by-Step Instructions

### Step 1: Get Your Auth User ID

1. Go to Supabase Dashboard
2. Click **Authentication** → **Users**
3. Find your user: `nm2tech77@gmail.com`
4. Click on the user to open details
5. **Copy the User ID** (it's a UUID like `123e4567-e89b-12d3-a456-426614174000`)
   - This is the `id` field in the auth.users table

### Step 2: Add to church_users Table

1. Go to **Table Editor** → **church_users**
2. Click **Insert row** (or **New row** button)
3. Fill in the fields:
   - `auth_user_id`: Paste the User ID from Step 1
   - `email`: `nm2tech77@gmail.com`
   - `name`: `Michael` (or your name)
   - `role`: `user` (or `admin` if you want admin access)
   - `created_at`: Leave blank (will auto-fill)
   - `updated_at`: Leave blank (will auto-fill)
4. Click **Save**

### Step 3: Verify

1. Check that the row was created
2. You should see your user in the `church_users` table

### Step 4: Test Login

1. Go to `http://localhost:5173/login`
2. Enter:
   - Email: `nm2tech77@gmail.com`
   - Password: Your password
3. Click "Sign in"
4. You should now be able to access the dashboard!

## Alternative: Using SQL

If you prefer SQL, run this in SQL Editor:

```sql
-- Replace 'YOUR-AUTH-USER-ID' with the actual UUID from Authentication → Users
INSERT INTO church_users (auth_user_id, email, name, role)
VALUES (
  'YOUR-AUTH-USER-ID',  -- Get this from Authentication → Users
  'nm2tech77@gmail.com',
  'Michael',
  'user'
);
```

## Troubleshooting

### "duplicate key value violates unique constraint"
- User already exists in `church_users` table
- Check the table - you might already be there!

### "foreign key constraint"
- Make sure the `auth_user_id` matches exactly the User ID from Authentication
- It must be a valid UUID from auth.users table

### "relation church_users does not exist"
- Run the migration first: `supabase/migrations/002_church_users_table.sql`
- Go to SQL Editor and run that migration

---

**Once you add yourself to church_users, you'll be able to log in!**
