"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Dumbbell, User, Mail, Lock, Loader2, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useRegister } from '@/hooks/useRegister';

export default function RegisterPage() {
  const {
    loading,
    success,
    errorMsg,
    register,
  } = useRegister();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      document.body.style.backgroundPosition = `${x * 10}% ${y * 10}%`;
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.style.backgroundPosition = '';
    };
  }, []);

  return (
    <div className="kinetic-gradient h-[100dvh] overflow-hidden flex items-center justify-center font-body-md text-on-surface p-2 md:p-4 w-full">
      {/* Main Registration Container */}
      <main className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col h-full justify-center">

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-4 text-center shrink-0">
          <div className="mb-2 flex items-center gap-2">
            <Dumbbell className="text-primary w-8 h-8" strokeWidth={2.5} />
            <h1 className="font-headline-md text-xl font-black tracking-tight text-primary">Math Muscle</h1>
          </div>
          <h2 className="font-headline-lg text-lg text-on-background mb-1">Daftar Akun Baru</h2>
          <p className="font-body-md text-sm text-on-surface-variant max-w-xs">Mulai perjalanan atlet mental Anda hari ini.</p>
        </div>

        {/* Registration Card */}
        <div className="glass-card rounded-xl p-5 shadow-xl overflow-hidden relative shrink-0">
          {/* Subtle Decorative Element */}
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg border border-error/20 flex items-center gap-3" id="register-error">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-body-md text-sm">{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" id="registerForm" onSubmit={register}>
            {/* Nama Lengkap */}
            <div className="space-y-1">
              <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase" htmlFor="name">Nama Lengkap</label>
              <div className="relative group input-focus-ring transition-all border border-surface-variant rounded-lg bg-surface-container-lowest">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors w-5 h-5" />
                <input className="w-full bg-transparent border-none py-2.5 pl-10 pr-3 focus:ring-0 text-on-surface placeholder:text-surface-dim font-body-md outline-none text-sm" id="name" name="name" placeholder="John Doe" required type="text" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase" htmlFor="email">Email</label>
              <div className="relative group input-focus-ring transition-all border border-surface-variant rounded-lg bg-surface-container-lowest">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors w-5 h-5" />
                <input className="w-full bg-transparent border-none py-2.5 pl-10 pr-3 focus:ring-0 text-on-surface placeholder:text-surface-dim font-body-md outline-none text-sm" id="email" name="email" placeholder="email@atlet.com" required type="email" />
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Password */}
              <div className="space-y-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase" htmlFor="password">Password</label>
                <div className="relative group input-focus-ring transition-all border border-surface-variant rounded-lg bg-surface-container-lowest">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input className="w-full bg-transparent border-none py-2.5 pl-10 pr-3 focus:ring-0 text-on-surface placeholder:text-surface-dim font-body-md outline-none text-sm" id="password" name="password" placeholder="••••••••" required type="password" />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase" htmlFor="confirm_password">Konfirmasi Password</label>
                <div className="relative group input-focus-ring transition-all border border-surface-variant rounded-lg bg-surface-container-lowest">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input className="w-full bg-transparent border-none py-2.5 pl-10 pr-3 focus:ring-0 text-on-surface placeholder:text-surface-dim font-body-md outline-none text-sm" id="confirm_password" name="confirm_password" placeholder="••••••••" required type="password" />
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-1">
              <input className="mt-0.5 rounded text-primary focus:ring-primary h-3.5 w-3.5 border-surface-variant" id="terms" required type="checkbox" />
              <label className="text-xs leading-tight text-on-surface-variant" htmlFor="terms">
                Saya setuju dengan <Link className="text-primary hover:underline font-medium" href="#">Syarat &amp; Ketentuan</Link> serta kebijakan privasi pelatihan mental ini.
              </label>
            </div>

            {/* Primary CTA */}
            <button
              className={`w-full ${success ? 'bg-secondary' : 'bg-primary hover:bg-primary-container hover:scale-[1.01] active:scale-95'} text-on-primary py-3 px-4 rounded-lg font-headline-md text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 group`}
              type="submit"
              disabled={loading || success}
              style={loading ? { opacity: 0.7 } : {}}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Mendaftarkan...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Berhasil Terdaftar!</span>
                </>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="transition-transform group-hover:translate-x-1 w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-4 text-center font-body-md text-sm text-on-surface-variant shrink-0">
          Sudah punya akun? <Link className="text-primary font-bold hover:underline" href="/login">Masuk</Link>
        </p>

      </main>
    </div>
  );
}
