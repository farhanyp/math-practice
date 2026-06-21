'use server';

import * as argon2 from 'argon2';
import crypto from 'crypto';
import { createServerClient } from '@supabase/ssr';
import { encrypt } from '@/lib/jwt';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// We must use the ANON key to interact with Supabase DB.
// Since we have no RLS policy yet, or if they have policies, we assume ANON key works or we will get errors.
// A Service Role Key is better for manual auth but we only have PUBLISHABLE_KEY right now.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

function getSupabase() {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return []; },
      setAll() { },
    }
  });
}

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = (formData.get('email') as string || '').toLowerCase();
  const password = formData.get('password') as string;
  
  if (!name || !email || !password) {
    return { error: 'Semua field wajib diisi' };
  }

  const supabase = getSupabase();

  // 1. Hash password with argon2
  const hashedPassword = await argon2.hash(password);

  // 2. Generate UUID for user
  const userId = crypto.randomUUID();

  // 3. Insert into users table
  const { error: userError } = await (supabase as any).from('users').insert({
    id: userId,
    name,
    email,
    password: hashedPassword,
  });

  if (userError) {
    console.error(userError);
    // Usually code 23505 is unique violation (email already exists)
    if (userError.code === '23505') {
      return { error: 'Email sudah terdaftar.' };
    }
    return { error: 'Gagal mendaftar pengguna.' };
  }

  // 4. Get 'CLIENT' role from roles table
  const { data: roleData, error: roleError } = await (supabase as any)
    .from('roles')
    .select('id')
    .eq('role_name', 'CLIENT')
    .single();

  if (roleError || !roleData) {
    console.error(roleError);
    return { error: 'Gagal menemukan role CLIENT. Pastikan master data role sudah ada.' };
  }

  // 5. Insert into user_roles
  const { error: userRoleError } = await (supabase as any).from('user_roles').insert({
    user_id: userId,
    role_id: roleData.id,
  });

  if (userRoleError) {
    console.error(userRoleError);
    return { error: 'Gagal menetapkan role pengguna.' };
  }

  return { success: true };
}

export async function loginUser(formData: FormData) {
  const email = (formData.get('email') as string || '').toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi' };
  }

  const supabase = getSupabase();

  // 1. Fetch user and their role by email
  const { data: user, error: fetchError } = await (supabase as any)
    .from('users')
    .select('*, user_roles(roles(role_name))')
    .eq('email', email)
    .single();

  console.log('Login attempt for email:', email);
  
  if (fetchError) {
    console.error('Login Fetch Error:', fetchError);
  }
  
  console.log('User found in DB:', !!user);

  if (fetchError || !user || !user.password) {
    console.log('Returning early because no user or fetch error');
    return { error: 'Email atau password yang Anda masukkan salah.' };
  }

  // 2. Verify password with argon2
  try {
    const isMatch = await argon2.verify(user.password, password);
    console.log('Argon2 verify result:', isMatch);
    if (!isMatch) {
      return { error: 'Email atau password yang Anda masukkan salah.' };
    }
  } catch (err) {
    console.error('Argon2 Error:', err);
    return { error: 'Gagal memverifikasi password.' };
  }

  // 3. Extract role
  let roleName = 'CLIENT';
  if (user.user_roles && user.user_roles.length > 0 && user.user_roles[0].roles) {
    roleName = user.user_roles[0].roles.role_name;
  }

  const accessDurationMin = parseInt(process.env.JWT_DURATION_ACCESS_TOKEN || '60', 10);
  const refreshDurationMin = parseInt(process.env.JWT_DURATION_REFRESH_TOKEN || '10080', 10);

  // 4. Generate Access Token and Refresh Token
  const accessToken = await encrypt({ userId: user.id, email: user.email, role: roleName }, `${accessDurationMin}m`);
  const refreshToken = crypto.randomUUID();

  // Expiration of refresh token
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + refreshDurationMin);

  // 5. Save tokens to user_tokens
  const { error: tokenError } = await (supabase as any).from('user_tokens').insert({
    user_id: user.id,
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt.toISOString()
  });

  if (tokenError) {
    console.error(tokenError);
    return { error: 'Gagal membuat sesi login.' };
  }

  return { 
    success: true,
    accessToken,
    refreshToken,
    user: {
      userId: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      role: roleName
    }
  };
}

export async function logoutUser(refreshToken?: string | null) {
  if (refreshToken) {
    const supabase = getSupabase();
    // Mark token as revoked in database
    await (supabase as any)
      .from('user_tokens')
      .update({ is_revoked: true })
      .eq('refresh_token', refreshToken);
  }

  return { success: true };
}
