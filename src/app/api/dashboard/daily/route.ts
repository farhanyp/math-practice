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
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') ?? '7';

  const db = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  }) as any;

  const days = period !== 'all' ? parseInt(period) : 365;
  const from = new Date();
  from.setDate(from.getDate() - days);

  let sessionQuery = db
    .from('sessions')
    .select('id, created_at, operation_type')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (period !== 'all') {
    sessionQuery = sessionQuery.gte('created_at', from.toISOString());
  }

  const { data: sessions } = await sessionQuery;
  const sessionList: any[] = (sessions as any[]) ?? [];
  const sessionIds = sessionList.map((s: any) => s.id as string);

  if (sessionIds.length === 0) {
    return NextResponse.json({ daily: [] });
  }

  const { data: attempts } = await db
    .from('session_attempts')
    .select('session_id, is_correct, is_skipped, is_timeout, response_time_ms, created_at')
    .in('session_id', sessionIds);

  const att: any[] = (attempts as any[]) ?? [];

  // Build session → date lookup
  const sessionDateMap = new Map<string, string>();
  for (const s of sessionList) {
    const d = (s.created_at as string).substring(0, 10);
    sessionDateMap.set(s.id, d);
  }

  type DayBucket = {
    date: string;
    totalAttempts: number;
    correctCount: number;
    skipCount: number;
    timeoutCount: number;
    totalResponseMs: number;
    answeredCount: number;
    sessionCount: number;
  };

  const dayMap = new Map<string, DayBucket>();

  // Count sessions per day
  for (const s of sessionList) {
    const d = sessionDateMap.get(s.id)!;
    if (!dayMap.has(d)) {
      dayMap.set(d, { date: d, totalAttempts: 0, correctCount: 0, skipCount: 0, timeoutCount: 0, totalResponseMs: 0, answeredCount: 0, sessionCount: 0 });
    }
    dayMap.get(d)!.sessionCount += 1;
  }

  for (const a of att) {
    const d = sessionDateMap.get(a.session_id as string);
    if (!d) continue;
    if (!dayMap.has(d)) {
      dayMap.set(d, { date: d, totalAttempts: 0, correctCount: 0, skipCount: 0, timeoutCount: 0, totalResponseMs: 0, answeredCount: 0, sessionCount: 0 });
    }
    const bucket = dayMap.get(d)!;
    bucket.totalAttempts += 1;
    if (a.is_correct)  bucket.correctCount += 1;
    if (a.is_skipped)  bucket.skipCount += 1;
    if (a.is_timeout)  bucket.timeoutCount += 1;
    if (!a.is_skipped && !a.is_timeout) {
      bucket.totalResponseMs += (a.response_time_ms as number);
      bucket.answeredCount   += 1;
    }
  }

  const daily = Array.from(dayMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((b) => ({
      date:         b.date,
      sessionCount: b.sessionCount,
      totalAttempts: b.totalAttempts,
      accuracy:     b.totalAttempts > 0 ? parseFloat(((b.correctCount / b.totalAttempts) * 100).toFixed(1)) : 0,
      avgResponseMs: b.answeredCount > 0 ? Math.round(b.totalResponseMs / b.answeredCount) : 0,
      skipCount:    b.skipCount,
      timeoutCount: b.timeoutCount,
      correctCount: b.correctCount,
    }));

  return NextResponse.json({ daily });
}
