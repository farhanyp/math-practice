import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await decrypt(accessToken);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = payload.userId;

  const db = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  }) as any;

  // Fetch sessions from the last 365 days
  const from = new Date();
  from.setDate(from.getDate() - 364);

  const { data: sessions } = await db
    .from('sessions')
    .select('id, created_at')
    .eq('user_id', userId)
    .gte('created_at', from.toISOString())
    .order('created_at', { ascending: true });

  // Build a map: dateStr → sessionCount
  const countMap = new Map<string, number>();
  for (const s of ((sessions as any[]) ?? [])) {
    const d = (s.created_at as string).substring(0, 10);
    countMap.set(d, (countMap.get(d) ?? 0) + 1);
  }

  // Build full 365-day array
  const heatmap: { date: string; count: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().substring(0, 10);
    heatmap.push({ date: dateStr, count: countMap.get(dateStr) ?? 0 });
  }

  return NextResponse.json({ heatmap });
}
