# 🚀 Quick Database Setup Guide

## Problem
Direct PostgreSQL connection se timeout aa raha hai. Supabase Dashboard se SQL run karna padega.

## ✅ Solution: Supabase Dashboard se Setup

### Step 1: Supabase Dashboard Open Karein
```
https://supabase.com/dashboard/project/jwwjjyxdepayjdjlmdmo
```

### Step 2: SQL Editor Open Karein
1. Left sidebar me **SQL Editor** par click karein
2. **New Query** button click karein

### Step 3: Database Schema Create Karein

Copy-paste ye pura SQL (`database-setup.sql` file se):

```sql
-- Run this entire script in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE NOT NULL,
    org_id UUID,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'teacher',
    status TEXT DEFAULT 'active',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'org_admin', 'teacher'))
);

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan_type TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id),
    teacher_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id),
    email TEXT NOT NULL,
    full_name TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    status TEXT DEFAULT 'draft',
    category TEXT,
    tags TEXT[],
    seo_meta JSONB DEFAULT '{}',
    view_count INT DEFAULT 0,
    author_id UUID REFERENCES users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT DEFAULT 'whiteboard_app',
    platform TEXT,
    version TEXT,
    download_url TEXT,
    is_active BOOLEAN DEFAULT true,
    force_update BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Super Admin Policy
CREATE POLICY "Super admins full access" ON users FOR ALL
USING (EXISTS (
    SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'super_admin'
));

CREATE POLICY "Super admins org access" ON organizations FOR ALL
USING (EXISTS (
    SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'super_admin'
));
```

**Click RUN (या Ctrl+Enter)**

### Step 4: Super Admin User Banayein

#### 4a. Auth User Create Karein
1. **Authentication** tab par jaayein (left sidebar)
2. **Users** par click karein
3. **Add User** button click karein
4. Fill karein:
   - **Email:** `admin@qbank.com`
   - **Password:** `Admin@123`
5. **Create User** click karein

#### 4b. Users Table me Add Karein
SQL Editor me phir se jaayein aur ye run karein:

```sql
-- Get the auth user ID
SELECT id, email FROM auth.users WHERE email = 'admin@qbank.com';

-- Copy the ID from above result, then run this:
INSERT INTO public.users (auth_user_id, email, full_name, role, status)
SELECT 
    id,
    'admin@qbank.com',
    'Super Admin',
    'super_admin',
    'active'
FROM auth.users 
WHERE email = 'admin@qbank.com';
```

### Step 5: Verify Setup

SQL Editor me ye query run karein:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check super admin user
SELECT * FROM public.users WHERE role = 'super_admin';
```

Agar super admin user dikhe, to aap tayaar hain! ✅

### Step 6: Login Karein

```
URL: http://localhost:3000
Email: admin@qbank.com
Password: Admin@123
```

---

## 📝 Quick Checklist

- [ ] Supabase Dashboard open kiya
- [ ] SQL Editor me schema SQL run kiya
- [ ] Auth user create kiya (admin@qbank.com)
- [ ] Users table me super admin add kiya
- [ ] Verification queries run kiye
- [ ] Login test kiya

---

## 🆘 Troubleshooting

**Error: "table already exists"**
- Ignore karein, RLS policies run karwa lein

**Error: "auth user not found"**
- Pehle Auth user create karein (Step 4a)

**Login nahi ho raha**
- Verify karein: `SELECT * FROM users WHERE email = 'admin@qbank.com'`
- Check karein role: `super_admin` hai

---

**Ab Supabase Dashboard me jaayein aur ye steps follow karein! 🚀**
