"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Dumbbell, AlertCircle, Mail, Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Logic to show error for demo purposes
    if (email !== 'demo@mathmuscle.com') {
      setError(true);
      setLoading(false);
      
      // Shake effect on the container
      setShake(true);
      setTimeout(() => {
        setShake(false);
      }, 500);
    } else {
      // Success redirect simulation
      alert('Login Berhasil! Mengalihkan ke Dashboard...');
      router.push('/'); // Redirecting to home/dashboard
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md h-[100dvh] overflow-hidden flex items-center justify-center p-4 relative w-full">
      {/* Ambient Decorative Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary blur-[120px]"></div>
      </div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-[380px] transition-all duration-500 ease-in-out" id="login-screen">
        <div className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm ${shake ? 'shake' : ''}`}>
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 mb-3">
              <Dumbbell className="text-white w-8 h-8" strokeWidth={2.5} />
            </div>
            <h1 className="font-headline-md text-headline-md text-primary">Kinetic Logic</h1>
            <p className="text-on-surface-variant font-label-caps mt-1">Mental Athlete Training</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg border border-error/20 flex items-center gap-3 shake" id="login-error">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-body-md text-sm">Email atau password yang Anda masukkan salah.</span>
            </div>
          )}

          {/* Form */}
          <form className="gap-4 flex flex-col" id="login-form" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <Label className="font-label-caps text-on-surface-variant" htmlFor="email">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors w-5 h-5" />
                <Input 
                  className="w-full pl-10 pr-4 h-12 bg-white border-outline-variant rounded-lg focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary placeholder:text-outline" 
                  id="email" 
                  placeholder="nama@email.com" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="font-label-caps text-on-surface-variant" htmlFor="password">Kata Sandi</Label>
                <Link className="text-xs text-primary font-medium hover:underline" href="#">Lupa?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors w-5 h-5" />
                <Input 
                  className="w-full pl-10 pr-4 h-12 bg-white border-outline-variant rounded-lg focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary placeholder:text-outline" 
                  id="password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button 
              className="w-full h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary-container transition-all flex items-center justify-center gap-2 active:scale-[0.98]" 
              id="login-btn" 
              type="submit"
              disabled={loading}
            >
              {!loading ? (
                <span id="login-text">Masuk</span>
              ) : (
                <Loader2 className="animate-spin w-5 h-5 text-white" id="login-spinner" />
              )}
            </Button>

            <div className="mt-4 text-center text-sm text-on-surface-variant">
              Belum punya akun? <Link className="text-primary font-medium hover:underline" href="/register">Daftar</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
