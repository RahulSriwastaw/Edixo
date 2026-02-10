-- ==================================================================
-- Supabase Function: Create Org Admin User
-- ==================================================================
-- This function creates both an auth user and a database user entry
-- for organization administrators. It can be called from the client
-- without needing the service role key.
--
-- IMPORTANT: This function must be created by a user with sufficient
-- privileges (super admin or via Supabase Dashboard SQL Editor)
-- ==================================================================

CREATE OR REPLACE FUNCTION create_org_admin_user(
  p_org_id UUID,
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- Run with the privileges of the function creator
AS $$
DECLARE
  v_auth_user_id UUID;
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Step 1: Create the auth user using Supabase's auth.users table
  -- Note: Direct INSERT into auth.users requires SECURITY DEFINER
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',  -- Default instance_id
    gen_random_uuid(),                        -- Generate new UUID
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),        -- Hash the password
    NOW(),                                    -- Auto-confirm email
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    jsonb_build_object('full_name', p_full_name, 'phone', p_phone),
    NOW(),
    NOW(),
    '',
    ''
  )
  RETURNING id INTO v_auth_user_id;

  -- Step 2: Create the user entry in public.users table
  INSERT INTO public.users (
    auth_user_id,
    org_id,
    email,
    full_name,
    role,
    status,
    created_at,
    updated_at
  )
  VALUES (
    v_auth_user_id,
    p_org_id,
    p_email,
    p_full_name,
    'org_admin',
    'active',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_user_id;

  -- Step 3: Return success response
  v_result := json_build_object(
    'success', true,
    'user_id', v_user_id,
    'auth_user_id', v_auth_user_id,
    'email', p_email
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, return error details
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
-- Note: You may want to restrict this further based on your security requirements
GRANT EXECUTE ON FUNCTION create_org_admin_user(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_org_admin_user(UUID, TEXT, TEXT, TEXT, TEXT) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION create_org_admin_user IS 'Creates an organization admin user with auth credentials and database entry. Requires: org_id, email, password, full_name. Optional: phone.';
