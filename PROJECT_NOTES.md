# Project Notes

## Two Versions Available

This repository contains **two different implementations** of the WMOI Church Management System:

### 1. Next.js Version (Original)
- **Location**: Root directory files
- **Tech Stack**: Next.js 14, Prisma, SQLite, NextAuth.js
- **Status**: Fully functional MVP
- **Use Case**: Self-hosted, no external dependencies

### 2. Vite + Supabase Version (New - Per Prompt)
- **Location**: `src/` directory and Vite config files
- **Tech Stack**: Vite + React, Supabase (PostgreSQL + Auth + Storage)
- **Status**: Complete implementation per prompt requirements
- **Use Case**: Cloud-hosted, scalable, production-ready

## Which One to Use?

**Use the Vite + Supabase version if:**
- You want cloud-hosted database (Supabase)
- You need file storage for pastor photos
- You prefer modern React with Vite
- You want automatic scaling

**Use the Next.js version if:**
- You prefer self-hosted solutions
- You want everything in one codebase
- You don't need cloud storage
- You're comfortable with SQLite

## Migration Path

To switch from Next.js to Vite version:

1. Install Vite dependencies:
   ```bash
   npm install --save-dev vite @vitejs/plugin-react
   npm install @supabase/supabase-js react-router-dom chart.js react-chartjs-2 jspdf xlsx
   ```

2. Set up Supabase project (see README-VITE.md)

3. Run the migration: `supabase/migrations/001_initial_schema.sql`

4. Update package.json scripts:
   ```json
   {
     "dev": "vite",
     "build": "tsc && vite build",
     "preview": "vite preview"
   }
   ```

5. Start using the Vite version!

## Next Steps

1. **Choose your version** based on requirements
2. **Set up Supabase** (for Vite version) or **configure Prisma** (for Next.js version)
3. **Update seed data** with your actual 13 churches
4. **Deploy** to Vercel or your preferred hosting
