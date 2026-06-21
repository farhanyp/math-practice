import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

function getDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from: from.toISOString(), to: to.toISOString() };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await decrypt(accessToken);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = payload.userId;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') ?? '7';

  const db = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  }) as any;

  let currentFrom: string | null = null;
  let previousFrom: string | null = null;
  let previousTo: string | null = null;

  if (period !== 'all') {
    const days = parseInt(period);
    const current = getDateRange(days);
    currentFrom = current.from;

    const prevTo = new Date(currentFrom);
    const prevFrom = new Date(prevTo);
    prevFrom.setDate(prevFrom.getDate() - days);
    previousFrom = prevFrom.toISOString();
    previousTo = prevTo.toISOString();
  }

  async function fetchStats(fromDate: string | null, toDate: string | null) {
    let sessionQuery = db
      .from('sessions')
      .select('id')
      .eq('user_id', userId);

    if (fromDate) sessionQuery = sessionQuery.gte('created_at', fromDate);
    if (toDate) sessionQuery = sessionQuery.lte('created_at', toDate);

    const { data: sessions } = await sessionQuery;
    const sessionIds = ((sessions as any[]) ?? []).map((s: any) => s.id as string);
    const totalSessions = sessionIds.length;

    if (totalSessions === 0) {
      return { totalSessions: 0, accuracy: 0, avgResponseMs: 0, skipCount: 0, timeoutCount: 0 };
    }

    const { data: attempts } = await db
      .from('session_attempts')
      .select('is_correct, is_skipped, is_timeout, response_time_ms')
      .in('session_id', sessionIds);

    const att: any[] = (attempts as any[]) ?? [];
    const totalAttempts = att.length;

    if (totalAttempts === 0) {
      return { totalSessions, accuracy: 0, avgResponseMs: 0, skipCount: 0, timeoutCount: 0 };
    }

    const correctCount  = att.filter((a) => a.is_correct).length;
    const skipCount     = att.filter((a) => a.is_skipped).length;
    const timeoutCount  = att.filter((a) => a.is_timeout).length;
    const answered      = att.filter((a) => !a.is_skipped && !a.is_timeout);
    const avgResponseMs = answered.length > 0
      ? Math.round(answered.reduce((s: number, a: any) => s + a.response_time_ms, 0) / answered.length)
      : 0;
    const accuracy = parseFloat(((correctCount / totalAttempts) * 100).toFixed(1));

    return { totalSessions, accuracy, avgResponseMs, skipCount, timeoutCount };
  }

  const current  = await fetchStats(currentFrom, null);
  const previous = await fetchStats(previousFrom, previousTo);

  function calcDelta(curr: number, prev: number): number | null {
    if (prev === 0) return null;
    return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
  }

  return NextResponse.json({
    current,
    previous,
    deltas: {
      totalSessions: calcDelta(current.totalSessions, previous.totalSessions),
      accuracy:      calcDelta(current.accuracy,      previous.accuracy),
      avgResponseMs: previous.avgResponseMs !== 0
        ? current.avgResponseMs - previous.avgResponseMs
        : null,
      skipCount:    calcDelta(current.skipCount,    previous.skipCount),
      timeoutCount: calcDelta(current.timeoutCount, previous.timeoutCount),
    },
  });
}
