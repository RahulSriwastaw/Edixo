-- ================================================
-- CREATE SUPER ADMIN USER
-- ================================================
-- Run this AFTER running database-setup.sql
-- ================================================

-- Step 1: First create the auth user in Supabase Dashboard
-- Go to: Authentication > Users > Add User
-- Email: admin@qbank.com
-- Password: Admin@123

-- Step 2: Get the auth user ID and insert into users table
-- Replace 'YOUR_AUTH_USER_ID' with the actual ID from auth.users

-- Option A: If you know the auth user ID
INSERT INTO public.users (auth_user_id, email, full_name, role, status, created_at)
VALUES (
    'YOUR_AUTH_USER_ID',  -- Replace with actual UUID from auth.users
    'admin@qbank.com',
    'Super Admin',
    'super_admin',
    'active',
    NOW()
)
ON CONFLICT (auth_user_id) 
DO UPDATE SET role = 'super_admin', status = 'active';

-- Option B: Automatic (if auth user already exists)
DO $$
DECLARE
    v_auth_user_id UUID;
BEGIN
    -- Get auth user ID
    SELECT id INTO v_auth_user_id
    FROM auth.users 
    WHERE email = 'admin@qbank.com'
    LIMIT 1;

    -- Check if we found the user
    IF v_auth_user_id IS NULL THEN
        RAISE NOTICE 'Auth user not found! Please create user in Supabase Dashboard first.';
        RAISE NOTICE 'Go to: Authentication > Users > Add User';
        RAISE NOTICE 'Email: admin@qbank.com';
        RAISE NOTICE 'Password: Admin@123';
    ELSE
        -- Insert or update in users table
        INSERT INTO public.users (auth_user_id, email, full_name, role, status, created_at)
        VALUES (
            v_auth_user_id,
            'admin@qbank.com',
            'Super Admin',
            'super_admin',
            'active',
            NOW()
        )
        ON CONFLICT (auth_user_id) 
        DO UPDATE SET 
            role = 'super_admin', 
            status = 'active',
            updated_at = NOW();

        RAISE NOTICE 'Super admin user created successfully!';
        RAISE NOTICE 'Auth User ID: %', v_auth_user_id;
    END IF;
END $$;

-- Verify super admin was created
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.status,
    u.created_at,
    au.email_confirmed_at
FROM public.users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.role = 'super_admin';

-- If you see the user above, you're ready to login!
-- Email: admin@qbank.com
-- Password: Admin@123
