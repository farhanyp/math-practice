"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, X, HelpCircle, Volume2, Zap, BarChart2 } from 'lucide-react';

export default function QuizSessionPage() {
  const router = useRouter();
  
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [progressWidth, setProgressWidth] = useState(100);

  const [cardStatus, setCardStatus] = useState<'idle' | 'correct-flash' | 'wrong-shake'>('idle');

  // Hardcoded problems for demo
  const problems = [
    { q: "14 × 6", a: [72, 84, 96, 78], correct: 84 },
    { q: "16 × 4", a: [64, 54, 74, 44], correct: 64 },
    { q: "13 × 7", a: [91, 81, 71, 101], correct: 91 },
    { q: "18 × 3", a: [54, 48, 64, 58], correct: 54 },
    { q: "12 × 9", a: [108, 98, 118, 106], correct: 108 }
  ];

  const [currentProblem, setCurrentProblem] = useState(problems[0]);

  // Handle timer
  useEffect(() => {
    if (timeLeft <= 0) {
      alert('Sesi Berakhir!');
      router.push('/');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      setProgressWidth((prevTimeLeft) => ((prevTimeLeft - 1) / 60) * 100);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const nextProblem = () => {
    const idx = Math.floor(Math.random() * problems.length);
    const prob = problems[idx];
    // Shuffle answers
    const shuffled = [...prob.a].sort(() => Math.random() - 0.5);
    setCurrentProblem({ ...prob, a: shuffled });
  };

  const handleAnswer = (val: number) => {
    if (val === currentProblem.correct) {
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
      }, 400);
    }
  };

  const total = correctCount + wrongCount;
  const accuracy = total === 0 ? 100 : Math.round((correctCount / total) * 100);
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="bg-white h-[100dvh] overflow-hidden flex flex-col font-body-md text-on-surface w-full">
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Unified Dashboard Frame */}
        <div className="w-full max-w-5xl glass-card rounded-2xl shadow-2xl relative flex flex-col max-h-full overflow-hidden shrink-0">
          
          {/* Subtle Decorative Element */}
          <div className="absolute top-0 left-0 w-1 h-full bg-primary z-10"></div>

          {/* Top Stats Strip */}
          <div className="px-4 md:px-8 py-4 border-b border-surface-variant flex items-center justify-between bg-white/40 backdrop-blur-md shrink-0 relative z-20">
            {/* Logo for desktop */}
            <div className="hidden md:flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Dumbbell className="text-primary w-6 h-6" strokeWidth={2.5} />
              </div>
              <h1 className="font-headline-md text-xl text-primary font-black tracking-tight">Math Muscle</h1>
            </div>

            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex flex-col items-center md:items-start px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-secondary/10 border border-secondary/20 min-w-[70px] md:min-w-[80px]">
                  <span className="font-label-caps text-[10px] text-secondary/80 uppercase font-bold">Benar</span>
                  <span className="font-headline-md text-xl md:text-2xl text-secondary leading-none mt-0.5">{correctCount}</span>
                </div>
                <div className="flex flex-col items-center md:items-start px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-error/10 border border-error/20 min-w-[70px] md:min-w-[80px]">
                  <span className="font-label-caps text-[10px] text-error/80 uppercase font-bold">Salah</span>
                  <span className="font-headline-md text-xl md:text-2xl text-error leading-none mt-0.5">{wrongCount}</span>
                </div>
                <div className="h-8 w-px bg-outline-variant/50 hidden md:block mx-1"></div>
                <div className="flex-col items-end hidden md:flex">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Sisa Waktu</span>
                  <span className="font-display-numeral text-2xl font-bold leading-none mt-1 text-primary">{mins}:{secs}</span>
                </div>
              </div>
              <Link href="/" className="px-3 md:px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg font-label-caps font-bold uppercase transition-all flex items-center gap-2 border border-transparent hover:border-error/20">
                <span className="hidden md:inline">Menyerah</span>
                <X className="w-5 h-5 md:w-4 md:h-4" />
              </Link>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-surface-container-high relative shrink-0 z-20">
            <div 
              className="h-full bg-primary progress-bar-transition shadow-[0_0_10px_rgba(53,37,205,0.3)]" 
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>

          {/* Central Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-3 md:p-6 overflow-hidden relative z-20">
            {/* Problem Statement */}
            <div 
              id="problem-card" 
              className={`w-full max-w-sm h-32 md:h-48 bg-white/70 backdrop-blur-xl border border-outline-variant/60 rounded-3xl shadow-xl flex flex-col items-center justify-center transition-all duration-300 relative shrink-0 ${cardStatus === 'correct-flash' ? 'correct-flash' : cardStatus === 'wrong-shake' ? 'wrong-shake' : ''}`}
            >
              <div className="md:hidden absolute top-3 right-4 flex flex-col items-end">
                <span className="font-label-caps text-[9px] text-on-surface-variant uppercase font-bold">Waktu</span>
                <span className="font-headline-md text-base font-bold leading-none mt-0.5 text-primary">{mins}:{secs}</span>
              </div>

              <span className="font-label-caps text-[10px] md:text-xs text-primary mb-1 md:mb-2 tracking-widest uppercase font-bold bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Perkalian Mental</span>
              <h2 className="font-display-numeral text-5xl md:text-6xl text-on-surface select-none tracking-tighter font-black mt-1">
                {currentProblem.q.split('×')[0]} <span className="text-primary mx-1 md:mx-3">×</span> {currentProblem.q.split('×')[1]}
              </h2>
            </div>
            
            {/* Answer Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 w-full max-w-lg mt-4 md:mt-6 shrink-0">
              {currentProblem.a.map((ans, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleAnswer(ans)}
                  className="flex items-center justify-center py-4 md:py-6 px-4 md:px-6 bg-white/90 backdrop-blur-md border-2 border-outline-variant/60 rounded-2xl hover:border-primary hover:bg-primary-container/10 active:bg-primary-fixed hover:scale-[1.02] active:scale-[0.98] transition-all group shadow-sm"
                >
                  <span className="font-display-numeral text-3xl md:text-4xl font-bold text-on-surface group-hover:text-primary transition-colors">{ans}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lower Controls Panel / Footer */}
          <div className="px-4 md:px-8 py-4 border-t border-surface-variant flex items-center justify-between bg-white/40 backdrop-blur-md shrink-0 relative z-20">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-secondary" strokeWidth={2.5} />
                <span className="font-label-caps text-xs md:text-sm text-on-surface-variant uppercase font-bold">Streak: <span className="text-on-surface ml-1">{streak}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" strokeWidth={2.5} />
                <span className="font-label-caps text-xs md:text-sm text-on-surface-variant uppercase font-bold">Akurasi: <span className="text-on-surface ml-1">{accuracy}%</span></span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-xl bg-white/60 border border-outline-variant/50 flex items-center justify-center hover:bg-primary/10 transition-colors text-on-surface-variant hover:text-primary">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-white/60 border border-outline-variant/50 flex items-center justify-center hover:bg-primary/10 transition-colors text-on-surface-variant hover:text-primary">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
