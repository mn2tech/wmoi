# WMOI Church Admin

Word Ministries of India - Church Management System

A modern web application for managing church data, pastors, and members across multiple locations.

## Features

- **Admin Dashboard**: View KPIs, charts, and reports for all churches
- **Church Management**: Add, edit, and manage church information
- **Member Management**: Track members with details like age, gender, and role
- **Pastor Portal**: Dedicated dashboard for pastors to manage their assigned church
- **Reports & Export**: Generate CSV, Excel, and PDF reports
- **Role-Based Access**: Admin and Pastor roles with appropriate permissions

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication + Storage)
- **Charts**: Chart.js with react-chartjs-2
- **Export**: SheetJS (Excel), jsPDF (PDF)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mn2tech/wmoi.git
   cd wmoi
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Set up Supabase database**:
   - Run migrations in order:
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_church_users_table.sql`
     - `supabase/migrations/003_pastor_support.sql`
     - `supabase/migrations/004_pending_pastor_assignments.sql`
   - Run seed data: `supabase/seed.sql`
   - Add your admin user: See `ADD_USER_TO_CHURCH_USERS.sql`

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Open in browser**:
   Navigate to `http://localhost:5173`

## Deployment

### AWS Amplify

See [AMPLIFY_DEPLOYMENT.md](./AMPLIFY_DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:
1. Push code to GitHub
2. Connect repository to AWS Amplify
3. Add environment variables in Amplify Console
4. Configure redirects for React Router
5. Deploy!

## Project Structure

```
wmoi/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities (Supabase client, auth helpers)
│   ├── hooks/          # Custom React hooks
│   └── types/          # TypeScript type definitions
├── supabase/
│   ├── migrations/     # Database migrations
│   └── seed.sql       # Seed data
├── public/            # Static assets
└── amplify.yml       # AWS Amplify build configuration
```

## Documentation

- [Complete Setup Checklist](./COMPLETE_SETUP_CHECKLIST.md)
- [Pastor Login Setup](./PASTOR_LOGIN_SETUP.md)
- [AWS Amplify Deployment](./AMPLIFY_DEPLOYMENT.md)

## License

Copyright © 2024 Word Ministries of India
