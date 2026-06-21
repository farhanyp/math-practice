import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const OPERATION_LABELS: Record<string, string> = {
  addition:       'Penjumlahan (+)',
  subtraction:    'Pengurangan (-)',
  multiplication: 'Perkalian (×)',
  division:       'Pembagian (÷)',
};

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

  let sessionQuery = db
    .from('sessions')
    .select('id, operation_type')
    .eq('user_id', userId);

  if (period !== 'all') {
    const from = new Date();
    from.setDate(from.getDate() - parseInt(period));
    sessionQuery = sessionQuery.gte('created_at', from.toISOString());
  }

  const { data: sessions } = await sessionQuery;
  const sessionList: any[] = (sessions as any[]) ?? [];
  const sessionIds = sessionList.map((s: any) => s.id as string);

  // Map session_id → operation_type
  const sessionOpMap = new Map<string, string>();
  for (const s of sessionList) {
    sessionOpMap.set(s.id as string, s.operation_type as string);
  }

  if (sessionIds.length === 0) {
    return NextResponse.json({ operations: [] });
  }

  const { data: attempts } = await db
    .from('session_attempts')
    .select('session_id, is_correct, is_skipped, is_timeout, response_time_ms')
    .in('session_id', sessionIds);

  type OpBucket = {
    key: string;
    label: string;
    correct: number;
    wrong: number;
    skipped: number;
    timeout: number;
    totalResponseMs: number;
    answeredCount: number;
  };

  const opMap = new Map<string, OpBucket>();

  for (const a of ((attempts as any[]) ?? [])) {
    const opKey = sessionOpMap.get(a.session_id as string) ?? 'unknown';
    if (!opMap.has(opKey)) {
      opMap.set(opKey, {
        key: opKey,
        label: OPERATION_LABELS[opKey] ?? opKey,
        correct: 0, wrong: 0, skipped: 0, timeout: 0,
        totalResponseMs: 0, answeredCount: 0,
      });
    }
    const b = opMap.get(opKey)!;
    if (a.is_skipped) {
      b.skipped += 1;
    } else if (a.is_timeout) {
      b.timeout += 1;
    } else if (a.is_correct) {
      b.correct += 1;
      b.totalResponseMs += (a.response_time_ms as number);
      b.answeredCount   += 1;
    } else {
      b.wrong += 1;
      b.totalResponseMs += (a.response_time_ms as number);
      b.answeredCount   += 1;
    }
  }

  const operations = Array.from(opMap.values()).map((b) => {
    const total = b.correct + b.wrong + b.skipped + b.timeout;
    return {
      key:          b.key,
      label:        b.label,
      correct:      b.correct,
      wrong:        b.wrong,
      skipped:      b.skipped,
      timeout:      b.timeout,
      total,
      accuracy:     total > 0 ? parseFloat(((b.correct / total) * 100).toFixed(1)) : 0,
      avgResponseMs: b.answeredCount > 0 ? Math.round(b.totalResponseMs / b.answeredCount) : 0,
    };
  });

  operations.sort((a, b) => b.total - a.total);

  return NextResponse.json({ operations });
}
