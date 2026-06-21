"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Dumbbell,
  TrendingUp,
  LogOut,
  UserCircle,
  Info,
  Menu,
  RefreshCw,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

import StatCard from '@/components/dashboard/StatCard';
import DualLineChart from '@/components/dashboard/DualLineChart';
import OperationBreakdown from '@/components/dashboard/OperationBreakdown';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import AutoInsights from '@/components/dashboard/AutoInsights';

// ────────────────────────────── Types ──────────────────────────────
type FilterType = '1' | '3' | '7' | '30' | 'all';

interface StatsData {
  current: {
    totalSessions: number;
    accuracy: number;
    avgResponseMs: number;
    skipCount: number;
    timeoutCount: number;
  };
  previous: {
    totalSessions: number;
    accuracy: number;
    avgResponseMs: number;
    skipCount: number;
    timeoutCount: number;
  };
  deltas: {
    totalSessions: number | null;
    accuracy: number | null;
    avgResponseMs: number | null;
    skipCount: number | null;
    timeoutCount: number | null;
  };
}

interface DailyData {
  date: string;
  accuracy: number;
  avgResponseMs: number;
  sessionCount: number;
  totalAttempts: number;
  correctCount: number;
  skipCount: number;
  timeoutCount: number;
}

interface OperationData {
  key: string;
  label: string;
  correct: number;
  wrong: number;
  skipped: number;
  timeout: number;
  total: number;
  accuracy: number;
  avgResponseMs: number;
}

interface HeatmapDay {
  date: string;
  count: number;
}

// ────────────────────────────── Filter Config ──────────────────────
const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: '1',   label: '1 Hari' },
  { value: '3',   label: '3 Hari' },
  { value: '7',   label: '7 Hari' },
  { value: '30',  label: 'Bulanan' },
  { value: 'all', label: 'Semua' },
];

// ────────────────────────────── Component ──────────────────────────
export default function DashboardPage() {
  const [filter, setFilter]         = useState<FilterType>('7');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser]             = useState<any>(null);

  const [stats, setStats]           = useState<StatsData | null>(null);
  const [daily, setDaily]           = useState<DailyData[]>([]);
  const [operations, setOperations] = useState<OperationData[]>([]);
  const [heatmap, setHeatmap]       = useState<HeatmapDay[]>([]);

  const [loadingStats, setLoadingStats]   = useState(true);
  const [loadingDaily, setLoadingDaily]   = useState(true);
  const [loadingOps, setLoadingOps]       = useState(true);
  const [loadingHeatmap, setLoadingHeatmap] = useState(true);

  // ── Fetch user ──
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  // ── Fetch filter-dependent data ──
  const fetchFilteredData = useCallback(async (p: FilterType) => {
    setLoadingStats(true);
    setLoadingDaily(true);
    setLoadingOps(true);

    const qs = `?period=${p}`;

    try {
      const [statsRes, dailyRes, opsRes] = await Promise.all([
        fetchWithAuth(`/api/dashboard/stats${qs}`),
        fetchWithAuth(`/api/dashboard/daily${qs}`),
        fetchWithAuth(`/api/dashboard/operations${qs}`),
      ]);

      const [statsJson, dailyJson, opsJson] = await Promise.all([
        statsRes.json(),
        dailyRes.json(),
        opsRes.json(),
      ]);

      setStats(statsJson);
      setDaily(dailyJson.daily ?? []);
      setOperations(opsJson.operations ?? []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoadingStats(false);
      setLoadingDaily(false);
      setLoadingOps(false);
    }
  }, []);

  // ── Fetch heatmap (once, not filter-dependent) ──
  const fetchHeatmap = useCallback(async () => {
    setLoadingHeatmap(true);
    try {
      const res  = await fetchWithAuth('/api/dashboard/heatmap');
      const json = await res.json();
      setHeatmap(json.heatmap ?? []);
    } catch (err) {
      console.error('Failed to fetch heatmap:', err);
    } finally {
      setLoadingHeatmap(false);
    }
  }, []);

  useEffect(() => {
    fetchFilteredData(filter);
  }, [filter, fetchFilteredData]);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  // ── Helpers ──
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const isLoading = loadingStats;

  // ───────────────────────────── Render ─────────────────────────────
  return (
    <div className="bg-white text-on-surface font-body-md min-h-screen flex w-full">

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SideNavBar */}
      <aside
        className={`fixed left-0 top-0 h-full flex flex-col z-50 bg-surface border-r border-outline-variant w-64 p-6 transform transition-transform duration-300 md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-10">
          <Link href="/" className="flex flex-col">
            <h1 className="font-headline-md text-2xl font-black text-primary">Math Muscle</h1>
            <p className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest mt-1">
              Mental Athlete
            </p>
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          <Link
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
            href="/"
          >
            <Dumbbell className="w-5 h-5" />
            <span className="font-label-caps text-xs font-bold uppercase tracking-wider">
              Latihan Baru
            </span>
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-lg transition-all"
            href="/dashboard"
          >
            <TrendingUp className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-label-caps text-xs font-bold uppercase tracking-wider">
              Dashboard
            </span>
          </Link>
          <div className="pt-6 pb-2">
            <Link
              href="/"
              className="w-full flex items-center justify-center bg-primary text-white font-label-caps text-xs font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-primary-container transition-colors shadow-sm"
            >
              Mulai Latihan
            </Link>
          </div>
        </nav>

        <div className="mt-auto border-t border-outline-variant pt-6 space-y-4">
          {user && (
            <div className="flex items-center gap-3 px-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex flex-col truncate overflow-hidden">
                <span className="text-sm font-bold text-on-surface truncate">{user.name}</span>
                <span className="text-xs text-on-surface-variant truncate">{user.email}</span>
              </div>
            </div>
          )}
          <button
            onClick={async () => {
              try {
                const refreshToken = localStorage.getItem('refresh_token');
                const { logoutUser } = await import('@/actions/auth');
                await logoutUser(refreshToken);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              } catch (e) {
                console.error(e);
              }
            }}
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-label-caps text-xs font-bold uppercase tracking-wider">
              Keluar
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 w-full h-[100dvh] overflow-hidden">

        {/* Mobile TopNav */}
        <header className="flex md:hidden justify-between items-center w-full px-4 h-16 shrink-0 bg-white border-b border-outline-variant z-40 relative">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2 ml-1">
              <Dumbbell className="w-6 h-6 text-primary" strokeWidth={2.5} />
              <span className="font-headline-md text-lg font-bold text-primary">Math Muscle</span>
            </Link>
          </div>
          <UserCircle className="text-primary w-7 h-7" strokeWidth={1.5} />
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* ── Page Header + Filter ── */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-headline-lg text-3xl font-bold text-on-surface tracking-tight">
                  Dashboard Statistik
                </h2>
                <p className="text-on-surface-variant text-sm mt-1">
                  Analisis performa kognitif Anda secara real-time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Refresh */}
                <button
                  onClick={() => { fetchFilteredData(filter); fetchHeatmap(); }}
                  className="p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Filter pills */}
                <div className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant p-1 rounded-xl shadow-sm">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilter(opt.value)}
                      className={`px-3 py-2 rounded-lg font-label-caps text-xs font-bold uppercase transition-colors ${
                        filter === opt.value
                          ? 'bg-primary/10 text-primary'
                          : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              <StatCard
                label="Total Sesi"
                value={isLoading ? '—' : (stats?.current.totalSessions ?? 0)}
                delta={stats?.deltas.totalSessions ?? null}
                progressPct={isLoading ? undefined : Math.min((stats?.current.totalSessions ?? 0) / 20 * 100, 100)}
                progressColor="bg-primary"
                isLoading={isLoading}
              />
              <StatCard
                label="Rata-rata Akurasi"
                value={isLoading ? '—' : (stats?.current.accuracy ?? 0)}
                unit="%"
                delta={stats?.deltas.accuracy ?? null}
                progressPct={isLoading ? undefined : (stats?.current.accuracy ?? 0)}
                progressColor="bg-secondary"
                isLoading={isLoading}
              />
              <StatCard
                label="Rata-rata Respons"
                value={isLoading ? '—' : (stats?.current.avgResponseMs ?? 0)}
                unit="ms"
                delta={stats?.deltas.avgResponseMs ?? null}
                deltaUnit="ms"
                progressPct={isLoading ? undefined : Math.max(0, 100 - ((stats?.current.avgResponseMs ?? 0) / 5000 * 100))}
                progressColor="bg-primary-container"
                isLoading={isLoading}
              />
              <StatCard
                label="Soal Di-Skip"
                value={isLoading ? '—' : (stats?.current.skipCount ?? 0)}
                delta={stats?.deltas.skipCount ?? null}
                note="Lebih sedikit lebih baik"
                isLoading={isLoading}
              />
              <StatCard
                label="Soal Timeout"
                value={isLoading ? '—' : (stats?.current.timeoutCount ?? 0)}
                delta={stats?.deltas.timeoutCount ?? null}
                note="Lebih sedikit lebih baik"
                isLoading={isLoading}
              />
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

              {/* Dual Line Chart */}
              <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">
                    Tren Harian
                  </h3>
                  <Info className="w-5 h-5 text-on-surface-variant" />
                </div>
                {loadingDaily ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <DualLineChart data={daily} period={filter} />
                )}
              </div>

              {/* Operation Breakdown */}
              <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">
                    Per Jenis Operasi
                  </h3>
                </div>
                {loadingOps ? (
                  <div className="space-y-5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-surface-container animate-pulse rounded w-3/4" />
                        <div className="h-4 bg-surface-container animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <OperationBreakdown data={operations} />
                )}
              </div>
            </div>

            {/* ── Activity Heatmap ── */}
            {loadingHeatmap ? (
              <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
                <div className="h-6 w-48 bg-surface-container animate-pulse rounded mb-4" />
                <div className="h-24 bg-surface-container animate-pulse rounded-xl" />
              </div>
            ) : (
              <ActivityHeatmap data={heatmap} />
            )}

            {/* ── Auto Insights ── */}
            <AutoInsights
              stats={stats}
              operations={operations}
              period={filter}
            />

          </div>
        </main>
      </div>
    </div>
  );
}
