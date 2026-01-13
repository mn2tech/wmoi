# Setup Instructions

Follow these steps to set up and run the Word Ministries of India Church Management System.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

**Important**: Generate a secure random string for `NEXTAUTH_SECRET`. You can use:
```bash
openssl rand -base64 32
```

## Step 3: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database and apply schema
npx prisma db push

# Seed the database with initial data
npm run db:seed
```

## Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 5: Login

Use these default credentials after seeding:

**Super Admin:**
- Email: `admin@wmoi.org`
- Password: `admin123`

**Church Admin** (for each church):
- Email: `admin.{churchId}@wmoi.org`
- Password: `church123`

**Note**: Replace `{churchId}` with the actual church ID from the database. You can find it by running:
```bash
npm run db:studio
```

## Troubleshooting

### Database Issues
If you encounter database errors:
1. Delete the `dev.db` file
2. Run `npx prisma db push` again
3. Run `npm run db:seed`

### Port Already in Use
If port 3000 is already in use, you can change it:
```bash
PORT=3001 npm run dev
```

### Prisma Client Not Generated
If you see Prisma Client errors:
```bash
npx prisma generate
```

## Next Steps

1. Change default passwords immediately
2. Add your 13 churches through the Super Admin interface
3. Create church admin accounts for each church
4. Start adding members to each church

## Production Deployment

For production deployment:
1. Use PostgreSQL instead of SQLite
2. Update `DATABASE_URL` in `.env`
3. Set a strong `NEXTAUTH_SECRET`
4. Update `NEXTAUTH_URL` to your production domain
5. Run `npm run build` and `npm start`

