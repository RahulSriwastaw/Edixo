-- ================================================
-- Super Admin Database Schema Setup
-- ================================================
-- Run this script in Supabase SQL Editor
-- ================================================

-- 1. USERS TABLE
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

-- 2. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan_type TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT orgs_plan_check CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise')),
    CONSTRAINT orgs_status_check CHECK (status IN ('active', 'suspended', 'trial'))
);

-- 3. COURSES TABLE (for organization stats)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDENTS TABLE (for organization stats)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, email)
);

-- 5. BLOGS TABLE
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
    author_id UUID REFERENCES users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT blogs_status_check CHECK (status IN ('draft', 'published', 'archived'))
);

-- 6. TOOLS TABLE (for Whiteboard versions)
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT tools_platform_check CHECK (platform IN ('windows', 'android', 'ios'))
);

-- 7. FEATURE FLAGS TABLE
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

-- ================================================
-- ADD FOREIGN KEY FOR ORG_ID IN USERS
-- ================================================
ALTER TABLE users 
ADD CONSTRAINT users_org_fk 
FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- ================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_courses_org_id ON courses(org_id);
CREATE INDEX IF NOT EXISTS idx_students_org_id ON students(org_id);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);

-- ================================================
-- INSERT DEFAULT FEATURE FLAGS
-- ================================================
INSERT INTO feature_flags (name, key, description, enabled, critical) VALUES
    ('Whiteboard App', 'whiteboard', 'Enable or disable whiteboard application access globally', true, true),
    ('Mock Tests', 'mock_tests', 'Enable or disable mock test functionality for students', true, false),
    ('Paid Courses', 'paid_courses', 'Enable or disable paid course purchases and enrollments', true, true),
    ('AI Question Generator', 'ai_question_generator', 'Enable or disable AI-powered question generation tools', false, false),
    ('Public Tools', 'public_tools', 'Enable or disable public educational tools on website', true, false)
ON CONFLICT (key) DO NOTHING;

-- ================================================
-- CREATE RLS POLICIES (Row Level Security)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Super Admin has full access to everything
CREATE POLICY "Super admins have full access to users"
    ON users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins have full access to organizations"
    ON organizations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins have full access to courses"
    ON courses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins have full access to students"
    ON students FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins have full access to blogs"
    ON blogs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins have full access to tools"
    ON tools FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins have full access to feature_flags"
    ON feature_flags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Public can read published blogs
CREATE POLICY "Anyone can read published blogs"
    ON blogs FOR SELECT
    USING (status = 'published');

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
-- Run these to verify the setup

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

SELECT 'Database setup complete!' AS status;
