# Super Admin Panel

This is the Super Admin control center for the Q-Bank platform.

## Features
- **Organization Management**: Create and manage tenant organizations.
- **User Management**: Oversee users across the platform.
- **Global Settings**: Configure platform-wide settings.
- **Access Control**: Restricted to users with `super_admin` role.

## Prerequisites
Ensure you have the following environment variables in `.env.local` or `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Running the App
```bash
npm install
npm run dev
```

## Project Structure
- `app/`: Next.js App Router pages.
- `components/layout`: Dashboard layout and sidebar.
- `components/organizations`: Organization management components.
- `components/auth`: Authentication guards.
- `lib/supabase.ts`: Centralized Supabase client.
