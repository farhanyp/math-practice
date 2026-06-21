"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dumbbell, X, Zap, BarChart2, CheckCircle2, XCircle, Trophy, SkipForward } from 'lucide-react';
import { createClient } from '@/lib/client';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide';
type CardStatus = 'idle' | 'correct-flash' | 'wrong-shake' | 'skip-flash';

interface Problem {
  leftNumber: number;
  rightNumber: number;
  correctAnswer: number;
  choices: number[];
  operationSymbol: string;
}

interface AttemptLog {
  left_number: number;
  right_number: number;
  user_answer: number | null;
  correct_answer: number;
  is_correct: boolean;
  is_skipped: boolean;
  response_time_ms: number;
}

function generateProblem(operation: Operation, mainNumber: number, minNumber: number, maxNumber: number): Problem {
  const rightNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
  let correctAnswer: number;
  let operationSymbol: string;

  switch (operation) {
    case 'add':
      correctAnswer = mainNumber + rightNumber;
      operationSymbol = '+';
      break;
    case 'subtract':
      correctAnswer = mainNumber - rightNumber;
      operationSymbol = '−';
      break;
    case 'multiply':
      correctAnswer = mainNumber * rightNumber;
      operationSymbol = '×';
      break;
    case 'divide':
      const dividend = mainNumber * rightNumber;
      correctAnswer = mainNumber;
      const choices = generateChoices(correctAnswer);
      return { leftNumber: dividend, rightNumber, correctAnswer, choices, operationSymbol: '÷' };
  }

  const choices = generateChoices(correctAnswer);
  return { leftNumber: mainNumber, rightNumber, correctAnswer, choices, operationSymbol };
}

function generateChoices(correct: number): number[] {
  const choicesSet = new Set<number>([correct]);
  const spread = Math.max(5, Math.abs(correct) * 0.2);
  while (choicesSet.size < 4) {
    const delta = Math.floor(Math.random() * spread) + 1;
    const wrong = Math.random() < 0.5 ? correct + delta : correct - delta;
    if (wrong !== correct) choicesSet.add(wrong);
  }
  return [...choicesSet].sort(() => Math.random() - 0.5);
}

function getOperationLabel(operation: Operation): string {
  switch (operation) {
    case 'add': return 'Penjumlahan';
    case 'subtract': return 'Pengurangan';
    case 'multiply': return 'Perkalian';
    case 'divide': return 'Pembagian';
  }
}

function AttemptHistoryTable({ attempts }: { attempts: AttemptLog[] }) {
  const [historyPage, setHistoryPage] = useState(1);
  const [isMobileView, setIsMobileView] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageSize = isMobileView ? 5 : 10;
  const totalPages = Math.ceil(attempts.length / pageSize);
  const pageData = attempts.slice((historyPage - 1) * pageSize, historyPage * pageSize);

  useEffect(() => {
    if (historyPage > totalPages && totalPages > 0) {
      setHistoryPage(totalPages);
    }
  }, [totalPages, historyPage]);

  const content = (
    <div className="text-left w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          Riwayat Soal ({attempts.length} soal)
        </p>
        {totalPages > 1 && (
          <span className="text-xs text-on-surface-variant/60">Hal. {historyPage}/{totalPages}</span>
        )}
      </div>
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container/30 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-surface-container">
            <tr>
              <th className="py-2 px-2 md:px-3 text-left text-on-surface-variant font-semibold">#</th>
              <th className="py-2 px-2 md:px-3 text-left text-on-surface-variant font-semibold">Soal</th>
              <th className="py-2 px-2 md:px-3 text-left text-on-surface-variant font-semibold">Jawaban</th>
              <th className="py-2 px-2 md:px-3 text-left text-on-surface-variant font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((a, i) => {
              const globalIdx = (historyPage - 1) * pageSize + i;
              return (
                <tr key={globalIdx} className="border-t border-outline-variant/20 hover:bg-surface-container/50 transition-colors">
                  <td className="py-2 px-2 md:px-3 text-on-surface-variant">{globalIdx + 1}</td>
                  <td className="py-2 px-2 md:px-3 font-mono font-bold text-on-surface">
                    {a.left_number} = {a.correct_answer}
                  </td>
                  <td className="py-2 px-2 md:px-3 text-on-surface-variant">
                    {a.is_skipped ? <span className="text-amber-500 font-semibold">—</span> : a.user_answer}
                  </td>
                  <td className="py-2 px-2 md:px-3">
                    {a.is_skipped ? (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold text-[10px] uppercase">
                        <SkipForward className="w-3 h-3" /> Dilewati
                      </span>
                    ) : a.is_correct ? (
                      <span className="inline-flex items-center gap-1 bg-[#15803d]/10 text-[#15803d] px-1.5 py-0.5 rounded-full font-bold text-[10px] uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Benar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-error/10 text-error px-1.5 py-0.5 rounded-full font-bold text-[10px] uppercase">
                        <XCircle className="w-3 h-3" /> Salah
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-2">
          <button
            onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
            disabled={historyPage === 1}
            className="px-2.5 py-1 rounded-lg text-xs font-bold border border-outline-variant/30 bg-white hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ‹ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setHistoryPage(p)}
              className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors ${p === historyPage
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-outline-variant/30 hover:bg-surface-container text-on-surface-variant'
                }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
            disabled={historyPage === totalPages}
            className="px-2.5 py-1 rounded-lg text-xs font-bold border border-outline-variant/30 bg-white hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-3 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-xl font-bold transition-all text-center border border-outline-variant/30 text-sm flex items-center justify-center gap-2"
      >
        Lihat Riwayat Soal ({attempts.length})
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-outline-variant/30">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-error/10 hover:text-error text-on-surface-variant transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-4">Riwayat Kuis</h3>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export default function QuizSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const operation = (searchParams.get('operation') || 'multiply') as Operation;
  const mainNumber = parseInt(searchParams.get('mainNumber') || '7');
  const minNumber = parseInt(searchParams.get('minNumber') || '1');
  const maxNumber = parseInt(searchParams.get('maxNumber') || '12');
  const durationParam = searchParams.get('duration');
  const totalSeconds = durationParam === 'null' || durationParam === null || durationParam === '0'
    ? null
    : parseInt(durationParam);

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(totalSeconds);
  const [progressWidth, setProgressWidth] = useState(100);
  const [cardStatus, setCardStatus] = useState<CardStatus>('idle');

  const [isMounted, setIsMounted] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const attemptsRef = useRef<AttemptLog[]>([]);
  const questionStartRef = useRef<number>(Date.now());
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!searchParams.toString()) {
      router.replace('/');
      return;
    }
    setCurrentProblem(generateProblem(operation, mainNumber, minNumber, maxNumber));
    setIsMounted(true);
  }, [operation, mainNumber, minNumber, maxNumber, searchParams, router]);

  const finishSession = useCallback(async () => {
    if (isFinished) return;
    setIsFinished(true);
    setIsSaving(true);

    let userId: string | null = null;
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        userId = u.userId || u.id || null;
      }
    } catch (e) {
      console.error('Failed to parse user session', e);
    }

    if (!userId) {
      setIsSaving(false);
      return;
    }

    const supabase = createClient();

    let durationId: string | null = null;
    try {
      if (totalSeconds !== null) {
        const { data: dDur } = await supabase.from('session_durations').select('id').eq('duration_seconds', totalSeconds).single();
        if (dDur) durationId = dDur.id;
      } else {
        const { data: dDur } = await supabase.from('session_durations').select('id').is('duration_seconds', null).single();
        if (dDur) durationId = dDur.id;
      }
    } catch (err) {
      console.error('Failed to fetch duration id', err);
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        operation_type: operation,
        left_number_config: { main_number: mainNumber },
        right_number_config: { min: minNumber, max: maxNumber },
        duration_id: durationId,
      })
      .select('id')
      .single();

    if (sessionError || !sessionData) {
      console.error('Failed to create session:', sessionError);
      setIsSaving(false);
      return;
    }

    sessionIdRef.current = sessionData.id;

    if (attemptsRef.current.length > 0) {
      const rows = attemptsRef.current.map(a => ({
        session_id: sessionData.id,
        ...a,
      }));
      const { error: attemptsError } = await supabase.from('session_attempts').insert(rows);
      if (attemptsError) console.error('Failed to insert attempts:', attemptsError);
    }

    setIsSaving(false);
  }, [isFinished, operation, mainNumber, minNumber, maxNumber, totalSeconds]);

  // Timer logic
  useEffect(() => {
    if (totalSeconds === null || isFinished) return;

    if (timeLeft !== null && timeLeft <= 0) {
      finishSession();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        const next = prev - 1;
        setProgressWidth(totalSeconds ? (next / totalSeconds) * 100 : 100);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, totalSeconds, isFinished, finishSession]);

  const nextProblem = () => {
    setCurrentProblem(generateProblem(operation, mainNumber, minNumber, maxNumber));
    questionStartRef.current = Date.now();
  };

  const handleAnswer = (val: number) => {
    if (isFinished || !currentProblem) return;

    const responseTime = Date.now() - questionStartRef.current;
    const isCorrect = val === currentProblem.correctAnswer;

    attemptsRef.current.push({
      left_number: currentProblem.leftNumber,
      right_number: currentProblem.rightNumber,
      user_answer: val,
      correct_answer: currentProblem.correctAnswer,
      is_correct: isCorrect,
      is_skipped: false,
      response_time_ms: responseTime,
    });

    if (isCorrect) {
      setCardStatus('correct-flash');
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      setTimeout(() => {
        setCardStatus('idle');
        nextProblem();
      }, 600);
    } else {
      setCardStatus('wrong-shake');
      setWrongCount(prev => prev + 1);
      setStreak(0);
      setTimeout(() => {
        setCardStatus('idle');
        nextProblem();
      }, 500);
    }
  };

  const handleSkip = useCallback(() => {
    if (isFinished || !currentProblem || cardStatus !== 'idle') return;

    const responseTime = Date.now() - questionStartRef.current;

    attemptsRef.current.push({
      left_number: currentProblem.leftNumber,
      right_number: currentProblem.rightNumber,
      user_answer: null,
      correct_answer: currentProblem.correctAnswer,
      is_correct: false,
      is_skipped: true,
      response_time_ms: responseTime,
    });

    setSkipCount(prev => prev + 1);
    setStreak(0);
    setCardStatus('skip-flash');

    setTimeout(() => {
      setCardStatus('idle');
      nextProblem();
    }, 400);
  }, [isFinished, currentProblem, cardStatus]);

  // Keyboard shortcuts: ArrowRight or Space = Skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        // Prevent space from scrolling the page
        if (e.key === ' ') e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  const handleGiveUp = () => {
    finishSession().then(() => router.push('/'));
  };

  const total = correctCount + wrongCount;
  const accuracy = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  const mins = timeLeft !== null ? Math.floor(timeLeft / 60).toString().padStart(2, '0') : '∞';
  const secs = timeLeft !== null ? (timeLeft % 60).toString().padStart(2, '0') : '';

  // ─── Finished Overlay ────────────────────────────────────────────────────────

  // Format duration for summary card
  const formatDuration = (sec: number | null): string => {
    if (sec === null) return 'Tanpa Batas';
    if (sec < 60) return `${sec} Detik`;
    const m = Math.round(sec / 60);
    return `${m} Menit`;
  };

  if (isFinished && !isSaving) {
    let feedbackMessage = "Terus Berlatih!";
    if (accuracy >= 90) feedbackMessage = "Luar Biasa! Sempurna!";
    else if (accuracy >= 75) feedbackMessage = "Hebat Sekali!";
    else if (accuracy >= 50) feedbackMessage = "Bagus, Tingkatkan Terus!";

    return (
      <div className="bg-white fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant/50 rounded-3xl p-6 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] text-center space-y-6 relative z-10 my-4">

          {/* Icon Header */}
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center relative shadow-inner">
              <Trophy className="w-10 h-10 md:w-12 md:h-12 text-primary drop-shadow-md animate-bounce" style={{ animationDuration: '2s' }} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-secondary rounded-full animate-ping"></div>
              <div className="absolute bottom-4 left-0 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>

          {/* Title & Feedback */}
          <div className="space-y-1">
            <h1 className="font-headline-md text-3xl md:text-4xl font-black text-on-surface tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Sesi Selesai!</h1>
            <p className="text-on-surface-variant text-base md:text-lg font-medium">{feedbackMessage}</p>
            <p className="text-on-surface-variant/70 text-sm">Hasil kuis {getOperationLabel(operation)} Anda</p>
          </div>

          {/* Stats Grid — 6 columns: 2 per row on mobile, 3 per row on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {/* Benar */}
            <div className="bg-white border border-[#15803d]/20 rounded-2xl p-2.5 md:p-4 shadow-sm">
              <div className="flex flex-col items-center gap-0.5 mb-1 md:mb-2">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#15803d]" />
                <span className="text-[9px] md:text-[10px] text-[#15803d] font-bold uppercase tracking-wide">Benar</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-[#15803d]">{correctCount}</span>
            </div>

            {/* Salah */}
            <div className="bg-white border border-error/20 rounded-2xl p-2.5 md:p-4 shadow-sm">
              <div className="flex flex-col items-center gap-0.5 mb-1 md:mb-2">
                <XCircle className="w-4 h-4 md:w-5 md:h-5 text-error" />
                <span className="text-[9px] md:text-[10px] text-on-surface-variant font-bold uppercase tracking-wide">Salah</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-error">{wrongCount}</span>
            </div>

            {/* Skip */}
            <div className="bg-white border border-amber-400/30 rounded-2xl p-2.5 md:p-4 shadow-sm">
              <div className="flex flex-col items-center gap-0.5 mb-1 md:mb-2">
                <SkipForward className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                <span className="text-[9px] md:text-[10px] text-amber-600 font-bold uppercase tracking-wide">Skip</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-amber-500">{skipCount}</span>
            </div>

            {/* Akurasi */}
            <div className="bg-white border border-primary/20 rounded-2xl p-2.5 md:p-4 shadow-sm">
              <div className="flex flex-col items-center gap-0.5 mb-1 md:mb-2">
                <BarChart2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <span className="text-[9px] md:text-[10px] text-on-surface-variant font-bold uppercase tracking-wide">Akurasi</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-primary">{accuracy}%</span>
            </div>

            {/* Total dijawab */}
            <div className="bg-white border border-[#6d28d9]/20 rounded-2xl p-2.5 md:p-4 shadow-sm">
              <div className="flex flex-col items-center gap-0.5 mb-1 md:mb-2">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-[#6d28d9]" />
                <span className="text-[9px] md:text-[10px] text-[#6d28d9] font-bold uppercase tracking-wide">Dijawab</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-[#6d28d9]">{total}</span>
            </div>

            {/* Durasi */}
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-2.5 md:p-4 shadow-sm">
              <div className="flex flex-col items-center gap-0.5 mb-1 md:mb-2">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
                <span className="text-[9px] md:text-[10px] text-on-surface-variant font-bold uppercase tracking-wide">Durasi</span>
              </div>
              <span className="text-base md:text-lg font-black text-on-surface leading-tight">{formatDuration(totalSeconds)}</span>
            </div>
          </div>

          {/* Attempt Detail Table with Pagination */}
          {attemptsRef.current.length > 0 && (
            <AttemptHistoryTable attempts={attemptsRef.current} />
          )}

          {/* DB Sync Status */}
          <div className="flex items-center justify-center">
            {sessionIdRef.current ? (
              <p className="text-xs text-[#15803d] flex items-center gap-1.5 font-medium bg-[#15803d]/10 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Hasil tersimpan di database
              </p>
            ) : (
              <p className="text-xs text-on-surface-variant/50 font-medium">Sesi tamu (tidak disimpan)</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Link href="/" className="flex-1 py-3 md:py-4 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-bold transition-all text-center border border-outline-variant/30 hover:shadow-sm text-sm md:text-base">
              Menu Utama
            </Link>
            <button
              onClick={() => {
                attemptsRef.current = [];
                setCorrectCount(0);
                setWrongCount(0);
                setSkipCount(0);
                setStreak(0);
                setTimeLeft(totalSeconds);
                setProgressWidth(100);
                setIsFinished(false);
                setCurrentProblem(generateProblem(operation, mainNumber, minNumber, maxNumber));
                questionStartRef.current = Date.now();
                sessionIdRef.current = null;
              }}
              className="flex-1 py-3 md:py-4 px-4 bg-primary text-white rounded-xl font-bold transition-all hover:bg-primary-container shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 text-sm md:text-base"
            >
              Main Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (!isMounted || !currentProblem) {
    return (
      <div className="bg-white h-[100dvh] overflow-hidden flex items-center justify-center font-body-md text-on-surface w-full">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Determine card ring color based on status
  const cardRingClass =
    cardStatus === 'correct-flash' ? 'correct-flash ring-4 ring-[#15803d]/50' :
      cardStatus === 'wrong-shake' ? 'wrong-shake ring-4 ring-error/50' :
        cardStatus === 'skip-flash' ? 'ring-4 ring-amber-400/60 border-amber-300' :
          '';

  // ─── Main Quiz UI ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-white h-[100dvh] overflow-hidden flex flex-col font-body-md text-on-surface w-full relative">

      {/* Top Header */}
      <header className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between relative z-20 shrink-0 border-b border-outline-variant/20">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
            <Dumbbell className="text-primary w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
          </div>
          <h1 className="font-headline-md text-lg md:text-xl font-black tracking-tight text-primary hidden md:block">
            Math Muscle
          </h1>
        </div>

        {/* Live Stats HUD */}
        <div className="flex items-center gap-2 md:gap-4 bg-surface-container/60 px-3 md:px-4 py-2 rounded-2xl border border-outline-variant/20">
          <div className="flex flex-col items-center">
            <span className="font-label-caps text-[9px] md:text-[10px] text-[#15803d] uppercase font-bold">Benar</span>
            <span className="font-headline-md text-base md:text-xl text-[#15803d] leading-none">{correctCount}</span>
          </div>
          <div className="w-px h-5 bg-outline-variant/40"></div>
          <div className="flex flex-col items-center">
            <span className="font-label-caps text-[9px] md:text-[10px] text-error uppercase font-bold">Salah</span>
            <span className="font-headline-md text-base md:text-xl text-error leading-none">{wrongCount}</span>
          </div>
          <div className="w-px h-5 bg-outline-variant/40"></div>
          <div className="flex flex-col items-center">
            <span className="font-label-caps text-[9px] md:text-[10px] text-amber-600 uppercase font-bold">Skip</span>
            <span className="font-headline-md text-base md:text-xl text-amber-500 leading-none">{skipCount}</span>
          </div>
          {totalSeconds !== null && (
            <>
              <div className="w-px h-5 bg-outline-variant/40 hidden md:block"></div>
              <div className="flex-col items-center hidden md:flex">
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Waktu</span>
                <span className="font-display-numeral text-xl font-bold leading-none text-primary">{mins}:{secs}</span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleGiveUp}
          className="w-9 h-9 md:w-10 md:h-10 bg-surface-container hover:bg-error/10 hover:text-error rounded-xl flex items-center justify-center transition-all text-on-surface-variant group"
          title="Selesai"
        >
          <X className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
        </button>
      </header>

      {/* Progress Bar */}
      {totalSeconds !== null && (
        <div className="px-4 md:px-6 pt-2 pb-1 relative z-20">
          <div className="w-full h-2 bg-surface-variant/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              style={{ width: `${progressWidth}%`, transition: 'width 1s linear' }}
            ></div>
          </div>
        </div>
      )}

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 md:p-8 relative z-20 overflow-hidden">

        {/* Mobile timer */}
        {totalSeconds !== null && (
          <div className="md:hidden mb-3 flex items-center gap-1.5 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Waktu:</span>
            <span className="font-display-numeral text-base font-bold text-primary">{mins}:{secs}</span>
          </div>
        )}

        {/* Problem Card */}
        <div
          id="problem-card"
          className={`w-full max-w-md bg-white border-2 border-outline-variant/20 rounded-3xl md:rounded-[2.5rem] p-6 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center transition-all duration-300 relative shrink-0 ${cardRingClass}`}
        >
          <div className="bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-3 md:mb-4">
            <span className="font-label-caps text-xs text-primary tracking-widest uppercase font-bold">
              {getOperationLabel(operation)}
            </span>
          </div>

          <h2 className="font-display-numeral text-5xl md:text-8xl text-on-surface select-none tracking-tighter font-black text-center">
            {currentProblem!.leftNumber}{' '}
            <span className="text-primary/80 mx-1 md:mx-2">{currentProblem!.operationSymbol}</span>{' '}
            {currentProblem!.rightNumber}
          </h2>
        </div>

        {/* Answer Choices Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-5 w-full max-w-lg mt-5 md:mt-10 shrink-0">
          {currentProblem!.choices.map((ans, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(ans)}
              className="relative group outline-none"
            >
              {/* Tactile Shadow Layer */}
              <div className="absolute inset-0 bg-outline-variant/25 rounded-2xl translate-y-1.5 md:translate-y-2 transition-transform group-hover:translate-y-2 md:group-hover:translate-y-3 group-active:translate-y-0"></div>

              {/* Button Surface */}
              <div className="relative bg-white border-2 border-outline-variant/20 rounded-2xl py-4 md:py-7 px-4 flex items-center justify-center transition-transform transform group-hover:-translate-y-0.5 md:group-hover:-translate-y-1 group-active:translate-y-1.5 md:group-active:translate-y-2">
                <span className="font-display-numeral text-3xl md:text-5xl font-black text-on-surface group-hover:text-primary transition-colors">
                  {ans}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          disabled={cardStatus !== 'idle'}
          className="mt-5 md:mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container/60 hover:bg-amber-50 hover:border-amber-300 text-on-surface-variant hover:text-amber-700 transition-all text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed group"
          title="Lewati soal ini (Arrow → atau Spasi)"
        >
          <SkipForward className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          <span>Lewati Soal</span>
          <span className="hidden md:inline text-[10px] opacity-60 border border-current rounded px-1 py-0.5 ml-1">→ / Space</span>
        </button>
      </main>

      {/* Footer Stats */}
      <footer className="px-4 md:px-6 py-3 flex items-center justify-center gap-4 md:gap-10 relative z-20 shrink-0 bg-surface-container/30 border-t border-outline-variant/20">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary/10 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary" strokeWidth={2.5} />
          </div>
          <span className="font-label-caps text-xs md:text-sm text-on-surface-variant uppercase font-bold">
            Streak: <span className="text-on-surface ml-0.5">{streak}</span>
          </span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/30"></div>
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" strokeWidth={2.5} />
          </div>
          <span className="font-label-caps text-xs md:text-sm text-on-surface-variant uppercase font-bold">
            Akurasi: <span className="text-on-surface ml-0.5">{accuracy}%</span>
          </span>
        </div>
      </footer>

      {/* Skip flash animation style */}
      <style jsx>{`
        @keyframes skip-flash {
          0%, 100% { background-color: white; }
          50% { background-color: #fef9c3; }
        }
        .skip-flash-anim {
          animation: skip-flash 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
