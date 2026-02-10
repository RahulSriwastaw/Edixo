# Q-Bank Backend (Supabase)

This directory contains the database schema and migration files for the Q-Bank platform.

## Setup Instructions

1. **Create a Supabase Project**:
   - Go to [Supabase](https://supabase.com/) and create a new project.
   - Note down the `Project URL` and `anon public key` from Project Settings > API.

2. **Apply Database Schema**:
   - Go to the **SQL Editor** in your Supabase Dashboard.
   - Open `migrations/20240208_initial_schema.sql` from this directory.
   - Copy the content and paste it into the Supabase SQL Editor.
   - Run the script.

   This will create the following tables with Row Level Security (RLS) policies:
   - `organizations`
   - `users` (linked to `auth.users`)
   - `students`
   - `courses`
   - `tests`

3. **Configure Environment Variables**:
   - Update your `.env.local` files in each app (`apps/super-admin`, `apps/Student App`, etc.) with your Supabase credentials.

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   # For Vite apps:
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## Architecture

- **Auth**: Managed by Supabase Auth.
- **Database**: PostgreSQL with RLS.
- **Storage**: Use Supabase Storage for file uploads (bucket setup required).

## Roles

The system supports the following roles (defined in `users` table):
- `super_admin`: Full access.
- `org_admin`: Manage their organization.
- `teacher`: Create content within their organization.
- `student`: Consume content.
