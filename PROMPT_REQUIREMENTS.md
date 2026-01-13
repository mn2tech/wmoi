# WMOI Church Admin - Prompt Requirements

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL + Storage)

## Key Requirements

### Data Model
- **churches**: id, name, location, pastor_name, pastor_phone, pastor_email, pastor_photo_url, attendance, tithes, created_at
- **members**: id, church_id, name, age, gender, role, created_at

### Features
1. Supabase email/password auth
2. Church Form page with:
   - Dynamic church dropdown
   - Pastor details + photo upload
   - Attendance & tithes fields
   - Dynamic member rows (add/remove)
3. Manage Churches page (add new churches)
4. Dashboard/Reports with:
   - KPI cards
   - Charts (react-chartjs-2)
   - Export (CSV, Excel, PDF)
5. Sidebar layout
6. Mobile-friendly

### Seed Data
- 13 churches from spreadsheet
- 6 placeholder churches
- Total: 19 churches
