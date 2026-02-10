import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations if available, otherwise use anon key with different approach
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Generate secure random password
function generateSecurePassword(length = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org_id, email, full_name, phone } = body;

    // Validate input
    if (!org_id || !email || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields: org_id, email, full_name' },
        { status: 400 }
      );
    }

    // Generate secure password
    const password = generateSecurePassword();

    // Check if we have service role key
    if (supabaseServiceKey && supabaseServiceKey !== 'YOUR_SERVICE_ROLE_KEY_HERE') {
      // Use admin API with service role key
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          phone: phone || null,
        }
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        return NextResponse.json(
          { error: 'Failed to create auth user: ' + authError.message },
          { status: 500 }
        );
      }

      // Create user entry in users table
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            auth_user_id: authData.user.id,
            org_id,
            email,
            full_name,
            role: 'org_admin',
            status: 'active',
          }
        ])
        .select()
        .single();

      if (userError) {
        console.error('User table creation error:', userError);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json(
          { error: 'Failed to create user entry: ' + userError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user_id: userData.id,
        auth_user_id: authData.user.id,
        email,
        password,
        full_name,
      });

    } else {
      // Alternative: Use SQL function approach via direct database insert
      // This requires a database function to be created first
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

      // Call RPC function that will create both auth user and database entry
      const { data, error } = await supabaseClient.rpc('create_org_admin_user', {
        p_org_id: org_id,
        p_email: email,
        p_password: password,
        p_full_name: full_name,
        p_phone: phone || null
      });

      if (error) {
        console.error('RPC error:', error);
        return NextResponse.json(
          {
            error: 'Service Role Key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file. Get it from: Supabase Dashboard → Settings → API → service_role key',
            details: error.message
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user_id: data?.user_id || null,
        auth_user_id: data?.auth_user_id || null,
        email,
        password,
        full_name,
      });
    }

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

