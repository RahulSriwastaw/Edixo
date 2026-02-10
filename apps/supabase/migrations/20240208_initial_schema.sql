-- Enable RLS
alter table if exists public.organizations enable row level security;
alter table if exists public.users enable row level security;
alter table if exists public.students enable row level security;
alter table if exists public.courses enable row level security;
alter table if exists public.tests enable row level security;

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    plan_type VARCHAR(50) DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (Teachers & Admins)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'org_admin', 'teacher')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    permissions JSONB DEFAULT '{}',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(auth_user_id),
    UNIQUE(org_id, email)
);

-- Students
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    profile_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(auth_user_id),
    UNIQUE(org_id, email)
);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(20) CHECK (type IN ('free', 'paid', 'subscription')),
    price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tests
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(20) CHECK (type IN ('mock', 'practice', 'quiz')),
    duration_minutes INTEGER,
    total_marks INTEGER,
    passing_marks INTEGER,
    shuffle_questions BOOLEAN DEFAULT true,
    show_result_immediately BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'draft',
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.courses enable row level security;
alter table public.tests enable row level security;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
DECLARE
  v_role VARCHAR;
BEGIN
  SELECT role INTO v_role FROM public.users WHERE auth_user_id = auth.uid();
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user org_id
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT org_id INTO v_org_id FROM public.users WHERE auth_user_id = auth.uid();
  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES

-- Organizations
-- Super admin can do anything
CREATE POLICY "Super Admin can do everything on organizations" ON public.organizations
    FOR ALL
    USING (public.get_current_user_role() = 'super_admin');

-- Org admins can view their own organization
CREATE POLICY "Org Admin can view own organization" ON public.organizations
    FOR SELECT
    USING (id = public.get_current_user_org_id());

-- Users
-- Super admin can do anything
CREATE POLICY "Super Admin can do everything on users" ON public.users
    FOR ALL
    USING (public.get_current_user_role() = 'super_admin');

-- Org Admin can view users in their org
CREATE POLICY "Org Admin can view users in own org" ON public.users
    FOR SELECT
    USING (org_id = public.get_current_user_org_id());

-- Org Admin can update users in their org
CREATE POLICY "Org Admin can update users in own org" ON public.users
    FOR UPDATE
    USING (org_id = public.get_current_user_org_id());

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    USING (auth_user_id = auth.uid());

-- Students
-- Org Admin & Teachers can view students in their org
CREATE POLICY "Staff can view students in own org" ON public.students
    FOR SELECT
    USING (org_id = public.get_current_user_org_id());

-- Students can view their own profile
CREATE POLICY "Students can view own profile" ON public.students
    FOR SELECT
    USING (auth_user_id = auth.uid());

-- Courses
-- Org members can view published courses
CREATE POLICY "Org members can view published courses" ON public.courses
    FOR SELECT
    USING (
        (org_id = public.get_current_user_org_id()) OR 
        (org_id IN (SELECT org_id FROM public.students WHERE auth_user_id = auth.uid()))
    );

-- Staff can manage courses
CREATE POLICY "Staff can manage courses" ON public.courses
    FOR ALL
    USING (
        org_id = public.get_current_user_org_id() AND 
        public.get_current_user_role() IN ('org_admin', 'teacher')
    );

-- Tests
-- Org members can view published tests
CREATE POLICY "Org members can view published tests" ON public.tests
    FOR SELECT
    USING (
        (org_id = public.get_current_user_org_id()) OR 
        (org_id IN (SELECT org_id FROM public.students WHERE auth_user_id = auth.uid()))
    );

-- Staff can manage tests
CREATE POLICY "Staff can manage tests" ON public.tests
    FOR ALL
    USING (
        org_id = public.get_current_user_org_id() AND 
        public.get_current_user_role() IN ('org_admin', 'teacher')
    );
