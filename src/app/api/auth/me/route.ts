import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { encrypt } from '@/lib/jwt';
import { Database } from '@/types/database.types';

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return []; },
        setAll() { },
      }
    });

    // Check refresh token in database
    const { data: tokenData, error: tokenError } = await (supabase as any)
      .from('user_tokens')
      .select('*, users(email, name)')
      .eq('refresh_token', refresh_token)
      .single() as any;

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    if (tokenData.is_revoked) {
      return NextResponse.json({ error: 'Token revoked' }, { status: 401 });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    // Fetch role
    const { data: userRole } = await (supabase as any)
      .from('user_roles')
      .select('roles(role_name)')
      .eq('user_id', tokenData.user_id)
      .single() as any;

    const roleName = userRole?.roles?.role_name || 'CLIENT';
    const email = tokenData.users?.email || '';
    const name = tokenData.users?.name || email.split('@')[0];

    const accessDurationMin = parseInt(process.env.JWT_DURATION_ACCESS_TOKEN || '60', 10);

    // Generate new Access Token
    const newAccessToken = await encrypt({ userId: tokenData.user_id, email, role: roleName }, `${accessDurationMin}m`);

    // Also update access_token in db
    await (supabase as any)
      .from('user_tokens')
      .update({ access_token: newAccessToken })
      .eq('id', tokenData.id);

    return NextResponse.json({ 
      success: true, 
      access_token: newAccessToken,
      user: {
        userId: tokenData.user_id,
        email,
        name,
        role: roleName
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
