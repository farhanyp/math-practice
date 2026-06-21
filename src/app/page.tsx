"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserCircle,
  Dumbbell,
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Minus,
  X,
  Percent,
  ChevronUp,
  ChevronDown,
  Info,
  Rocket
} from 'lucide-react';
import { createClient } from '@/lib/client';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

export default function HomePage() {
  const router = useRouter();
  const [operation, setOperation] = useState<Operation>('add');
  const [mainNumber, setMainNumber] = useState<string>("7");
  const [minNumber, setMinNumber] = useState<string>("1");
  const [maxNumber, setMaxNumber] = useState<string>("12");
  const [duration, setDuration] = useState<string>("");
  const [durations, setDurations] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    async function fetchDurations() {
      const supabase = createClient();
      const { data } = await supabase
        .from('session_durations')
        .select('*')
        .order('duration_seconds', { ascending: true });
      if (data && data.length > 0) {
        setDurations(data);
        // Set default to first option
        setDuration(data[0].duration_seconds?.toString() ?? "null");
      }
    }
    fetchDurations();

    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const { logoutUser } = await import('@/actions/auth');
      await logoutUser(refreshToken);
      
      // Clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleStartQuiz = () => {
    const params = new URLSearchParams({
      operation,
      mainNumber: mainNumber || "0",
      minNumber: minNumber || "0",
      maxNumber: maxNumber || "0",
      duration: duration,
    });
    router.push(`/quiz?${params.toString()}`);
  };

  return (
    <div className="bg-white h-[100dvh] overflow-hidden flex flex-col font-body-md text-on-surface w-full">
      {/* TopNavBar */}
      <header className="flex justify-between items-center w-full px-6 h-16 shrink-0 bg-white/10 backdrop-blur-md border-b border-white/20 z-50">
        <div className="flex items-center gap-4">
          <Dumbbell className="w-8 h-8 text-primary" strokeWidth={2.5} />
          <span className="font-headline-md text-xl font-black tracking-tight text-primary">Math Muscle</span>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/50 hover:bg-white/80 text-primary border border-white/40 shadow-sm rounded-lg font-label-caps text-[10px] md:text-xs font-bold uppercase transition-all"
              >
                <TrendingUp className="w-4 h-4 md:hidden" strokeWidth={2.5} />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg font-label-caps text-[10px] md:text-xs font-bold uppercase transition-all"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" strokeWidth={2.5} />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-label-caps text-[10px] md:text-xs font-bold uppercase transition-all"
            >
              <UserCircle className="w-4 h-4 md:hidden" strokeWidth={2.5} />
              <span className="hidden md:inline">Masuk</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Quiz Configuration Card */}
        <div className="w-full max-w-4xl glass-card rounded-2xl shadow-2xl relative flex flex-col max-h-full overflow-hidden shrink-0">
          {/* Subtle Decorative Element */}
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>

          {/* Card Header */}
          <div className="px-6 py-5 border-b border-surface-variant shrink-0 bg-white/30 backdrop-blur-sm">
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface">Konfigurasi Latihan Baru</h1>
          </div>

          {/* Form Content - Grid Layout */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Operation Toggle */}
              <div className="space-y-3">
                <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-wider">Operasi Matematika</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setOperation('add')}
                    className={`flex items-center justify-center p-4 rounded-xl border border-surface-variant text-headline-md font-bold transition-all active:scale-95 ${operation === 'add' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'}`}
                    type="button"
                  >
                    <Plus strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => setOperation('subtract')}
                    className={`flex items-center justify-center p-4 rounded-xl border border-surface-variant text-headline-md font-bold transition-all active:scale-95 ${operation === 'subtract' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'}`}
                    type="button"
                  >
                    <Minus strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => setOperation('multiply')}
                    className={`flex items-center justify-center p-4 rounded-xl border border-surface-variant text-headline-md font-bold transition-all active:scale-95 ${operation === 'multiply' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'}`}
                    type="button"
                  >
                    <X strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => setOperation('divide')}
                    className={`flex items-center justify-center p-4 rounded-xl border border-surface-variant text-headline-md font-bold transition-all active:scale-95 ${operation === 'divide' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'}`}
                    type="button"
                  >
                    <Percent strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Session Duration */}
              <div className="space-y-3">
                <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-wider">Durasi Sesi</label>
                <div className="relative group input-focus-ring transition-all border border-surface-variant rounded-xl bg-surface-container-lowest">
                  <select
                    className="w-full bg-transparent border-none py-4 px-4 font-body-md text-on-surface focus:ring-0 outline-none appearance-none cursor-pointer"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    {durations.length === 0 ? (
                      <option value="" disabled>Memuat...</option>
                    ) : (
                      durations.map((d) => (
                        <option key={d.id} value={d.duration_seconds?.toString() || "0"}>
                          {d.name}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 pointer-events-none" />
                </div>
                <p className="text-xs text-on-surface-variant/80 flex items-center gap-1.5 mt-2">
                  <Info className="w-4 h-4 text-primary shrink-0" />
                  Sesi 60 detik ideal untuk membangun ritme kognitif yang konsisten.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Left Number (Focus) */}
              <div className="space-y-3">
                <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-wider">Angka Utama (Fokus)</label>
                <div className="relative group input-focus-ring transition-all border border-surface-variant rounded-xl bg-surface-container-lowest">
                  <input
                    className="w-full bg-transparent border-none py-4 px-4 text-2xl font-bold focus:ring-0 text-center outline-none"
                    type="number"
                    value={mainNumber}
                    onChange={(e) => setMainNumber(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => setMainNumber((Number(mainNumber) + 1).toString())} className="text-primary hover:text-primary-container">
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={() => setMainNumber((Number(mainNumber) - 1).toString())} className="text-primary hover:text-primary-container">
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Number Range */}
              <div className="space-y-3">
                <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-wider">Rentang Angka Kanan</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative group input-focus-ring transition-all border border-surface-variant rounded-xl bg-surface-container-lowest">
                    <input
                      className="w-full bg-transparent border-none py-4 px-4 font-bold text-lg text-center focus:ring-0 outline-none"
                      placeholder="Min"
                      type="number"
                      value={minNumber}
                      onChange={(e) => setMinNumber(e.target.value)}
                    />
                  </div>
                  <span className="text-on-surface-variant font-bold px-1">—</span>
                  <div className="flex-1 relative group input-focus-ring transition-all border border-surface-variant rounded-xl bg-surface-container-lowest">
                    <input
                      className="w-full bg-transparent border-none py-4 px-4 font-bold text-lg text-center focus:ring-0 outline-none"
                      placeholder="Max"
                      type="number"
                      value={maxNumber}
                      onChange={(e) => setMaxNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-6 py-5 bg-white/30 backdrop-blur-md border-t border-surface-variant mt-auto shrink-0">
            <button
              onClick={handleStartQuiz}
              className="w-full bg-primary hover:bg-primary-container text-on-primary py-4 rounded-xl font-headline-md text-lg kinetic-hover shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-all group"
            >
              <span>Mulai Sesi Kuis</span>
              <Rocket className="w-6 h-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
