# WMOI Church Admin

A production-ready web application for managing churches and members for Word Ministries of India.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **Charts**: react-chartjs-2 + Chart.js
- **Export**: CSV, Excel (SheetJS), PDF (jsPDF)

## Features

- ✅ Supabase email/password authentication
- ✅ Dynamic church dropdown (automatically updates when new churches are added)
- ✅ Church form with pastor details, photo upload, attendance, and tithes
- ✅ Dynamic member rows (add/remove)
- ✅ Manage Churches page to add new churches
- ✅ Dashboard with KPIs and charts
- ✅ Export to CSV, Excel, and PDF
- ✅ Mobile-friendly responsive design
- ✅ Sidebar navigation

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- npm or yarn package manager

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Wait for the project to be fully provisioned

### 2. Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Run the migration file: `supabase/migrations/001_initial_schema.sql`
3. (Optional) Run the seed file: `supabase/seed.sql` to add initial churches

### 3. Set Up Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket named `pastor-photos`
3. Set it to **Public** (or configure policies as needed)

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Where to find these:**
- Go to Supabase dashboard → Settings → API
- Copy the **Project URL** → `VITE_SUPABASE_URL`
- Copy the **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173)

### 7. Create Your First User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter email and password
4. Use these credentials to log in to the app

## Project Structure

```
src/
├── components/        # Reusable components (Layout, Sidebar)
├── lib/              # Utilities (supabaseClient, export functions)
├── pages/            # Page components (Login, Dashboard, ChurchForm, ManageChurches)
├── types/            # TypeScript type definitions
├── App.tsx           # Main app component with routing
├── main.tsx          # Entry point
└── index.css         # Global styles

supabase/
├── migrations/       # Database migration files
└── seed.sql          # Seed data (19 churches)
```

## Usage

### Adding Churches

1. Go to **Manage Churches** page
2. Click **+ Add New Church**
3. Enter church name and location
4. The new church will automatically appear in the **Church Form** dropdown

### Filling Church Data

1. Go to **Church Form** page
2. Select a church from the dropdown
3. Fill in pastor information (name, phone, email)
4. Upload pastor photo (optional)
5. Enter attendance and tithes
6. Add members using the **+ Add Member** button
7. Click **Save**

### Viewing Reports

1. Go to **Dashboard** page
2. View KPIs and charts
3. Export data using CSV, Excel, or PDF buttons

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deploying to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

## Important Notes

- **Replace seed data**: Update `supabase/seed.sql` with your actual 13 churches from the spreadsheet
- **Storage bucket**: Make sure the `pastor-photos` bucket exists and is configured correctly
- **RLS Policies**: The migration includes basic RLS policies. Adjust them based on your security requirements
- **Environment variables**: Never commit your `.env` file to version control

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in the root directory
- Check that variable names start with `VITE_`
- Restart the dev server after adding environment variables

### "Storage bucket not found"
- Create the `pastor-photos` bucket in Supabase Storage
- Make sure it's set to Public or has proper policies

### "Authentication error"
- Check that RLS policies are set up correctly
- Verify your Supabase project is active

## Support

For issues or questions, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
