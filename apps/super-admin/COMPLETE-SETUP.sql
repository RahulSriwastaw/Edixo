-- ============================================================
-- SUPER ADMIN PANEL - COMPLETE DATABASE SETUP
-- ============================================================
-- Copy-paste this ENTIRE file in Supabase SQL Editor and click RUN
-- URL: https://supabase.com/dashboard/project/jwwjjyxdepayjdjlmdmo/sql
-- ============================================================

-- Step 1: Create all tables
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
    updated_at TIMESTAMPTZ DEFAULT NOW()
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
    org_id UUID,
    teacher_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID,
    email TEXT NOT NULL,
    full_name TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image_url TEXT,
    status TEXT DEFAULT 'draft',
    category TEXT,
    tags TEXT[],
    seo_meta JSONB DEFAULT '{}',
    view_count INT DEFAULT 0,
    author_id UUID,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL DEFAULT 'whiteboard_app',
    platform TEXT,
    version TEXT,
    download_url TEXT,
    is_active BOOLEAN DEFAULT true,
    force_update BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    key TEXT UNIQUE NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT false,
    critical BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Disable RLS (to avoid infinite recursion)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags DISABLE ROW LEVEL SECURITY;

-- Step 3: Create super admin user (if auth user exists)
-- IMPORTANT: First create auth user in: Authentication > Users > Add User
-- Email: admin@qbank.com
-- Password: Admin@123
-- Then this will work:

INSERT INTO public.users (auth_user_id, email, full_name, role, status, created_at)
SELECT 
    id,
    'admin@qbank.com',
    'Super Admin',
    'super_admin',
    'active',
    NOW()
FROM auth.users 
WHERE email = 'admin@qbank.com'
ON CONFLICT (auth_user_id) 
DO UPDATE SET role = 'super_admin', status = 'active', updated_at = NOW();

-- Step 4: Insert default feature flags
INSERT INTO feature_flags (name, key, description, enabled, critical) VALUES
    ('Whiteboard App', 'whiteboard', 'Enable or disable whiteboard application access globally', true, true),
    ('Mock Tests', 'mock_tests', 'Enable or disable mock test functionality for students', true, false),
    ('Paid Courses', 'paid_courses', 'Enable or disable paid course purchases and enrollments', true, true),
    ('AI Question Generator', 'ai_question_generator', 'Enable or disable AI-powered question generation tools', false, false),
    ('Public Tools', 'public_tools', 'Enable or disable public educational tools on website', true, false)
ON CONFLICT (key) DO NOTHING;

-- Step 5: Create sample organization (optional)
INSERT INTO organizations (name, slug, plan_type, status, settings) VALUES
    ('Demo Organization', 'demo-org', 'free', 'active', '{"max_teachers": 5, "max_courses": 10, "whiteboard_enabled": true}')
ON CONFLICT (slug) DO NOTHING;

-- Step 6: Verify everything
SELECT '✅ SETUP COMPLETE!' as status;
SELECT 'Super Admin User:' as info, email, role, status FROM users WHERE role = 'super_admin';
SELECT 'Total Tables:' as info, count(*) as count FROM information_schema.tables WHERE table_schema = 'public';

-- ============================================================
-- DONE! Now you can login at: http://localhost:3000
-- Email: admin@qbank.com
-- Password: Admin@123
-- ============================================================
