-- SQL to create an Organization Admin user (Run in Supabase SQL Editor)

-- 1. First, ensure the user exists in auth.users (Sign up via the app or use existing user)
-- Replace 'USER_EMAIL' with the actual email of the user you want to promote

-- 2. Update the user role in the public.users table
UPDATE public.users
SET role = 'org_admin'
WHERE email = 'USER_EMAIL';

-- 3. Verify the update
SELECT * FROM public.users WHERE email = 'USER_EMAIL';
