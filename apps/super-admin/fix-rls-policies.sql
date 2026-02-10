-- ================================================================
-- FIX RLS POLICY INFINITE RECURSION
-- ================================================================
-- Copy paste ye SQL Supabase SQL Editor me
-- ================================================================

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Super admins have full access to users" ON users;
DROP POLICY IF EXISTS "Super admins have full access to organizations" ON organizations;
DROP POLICY IF EXISTS "Super admins have full access to courses" ON courses;
DROP POLICY IF EXISTS "Super admins have full access to students" ON students;
DROP POLICY IF EXISTS "Super admins have full access to blogs" ON blogs;
DROP POLICY IF EXISTS "Super admins have full access to tools" ON tools;
DROP POLICY IF EXISTS "Super admins have full access to feature_flags" ON feature_flags;
DROP POLICY IF EXISTS "Super admins full access" ON users;
DROP POLICY IF EXISTS "Super admins org access" ON organizations;
DROP POLICY IF EXISTS "Anyone can read published blogs" ON blogs;

-- Step 2: Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags DISABLE ROW LEVEL SECURITY;

-- Step 3: Now tables are accessible!
-- Let's verify and create super admin

-- Check if auth user exists
SELECT id, email FROM auth.users WHERE email = 'admin@qbank.com';

-- If auth user exists, add to users table
INSERT INTO users (auth_user_id, email, full_name, role, status, created_at)
SELECT 
    id,
    'admin@qbank.com',
    'Super Admin',
    'super_admin',
    'active',
    NOW()
FROM auth.users 
WHERE email = 'admin@qbank.com'
ON CONFLICT (auth_user_id) DO UPDATE
SET role = 'super_admin', status = 'active';

-- Verify super admin
SELECT id, email, full_name, role, status FROM users WHERE role = 'super_admin';

-- SUCCESS MESSAGE
SELECT 'RLS disabled! Super Admin ready! Login at http://localhost:3000' AS status;
