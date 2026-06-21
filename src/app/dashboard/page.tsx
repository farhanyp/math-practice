"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Dumbbell, 
  TrendingUp, 
  Settings, 
  LogOut, 
  UserCircle, 
  TrendingDown, 
  Info, 
  BarChart2, 
  Download,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

export default function DashboardPage() {
  const [filter, setFilter] = useState<'7' | '30' | 'all'>('7');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white text-on-surface font-body-md min-h-screen flex w-full">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SideNavBar (Desktop & Collapsible Mobile) */}
      <aside className={`fixed left-0 top-0 h-full flex flex-col z-50 bg-surface border-r border-outline-variant w-64 p-6 transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-10">
          <Link href="/" className="flex flex-col">
            <h1 className="font-headline-md text-2xl font-black text-primary">Math Muscle</h1>
            <p className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest mt-1">Mental Athlete</p>
          </Link>
        </div>
        <nav className="flex-1 space-y-2">
          <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all" href="/">
            <Dumbbell className="w-5 h-5" />
            <span className="font-label-caps text-xs font-bold uppercase tracking-wider">Latihan Baru</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-lg transition-all" href="/dashboard">
            <TrendingUp className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-label-caps text-xs font-bold uppercase tracking-wider">Dashboard Perkembangan</span>
          </Link>
          <div className="pt-6 pb-2">
            <Link href="/" className="w-full flex items-center justify-center bg-primary text-white font-label-caps text-xs font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-primary-container transition-colors shadow-sm">
              Mulai Latihan
            </Link>
          </div>
        </nav>
        <div className="mt-auto border-t border-outline-variant pt-6 space-y-2">
          <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all" href="#">
            <Settings className="w-5 h-5" />
            <span className="font-label-caps text-xs font-bold uppercase tracking-wider">Pengaturan</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all" href="/login">
            <LogOut className="w-5 h-5" />
            <span className="font-label-caps text-xs font-bold uppercase tracking-wider">Keluar</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 w-full h-[100dvh] overflow-hidden">
        {/* TopNavBar (Mobile Only) */}
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
          <div className="flex items-center gap-4">
            <UserCircle className="text-primary hover:text-primary-container transition-colors w-7 h-7 cursor-pointer" strokeWidth={1.5} />
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-headline-lg text-3xl font-bold text-on-surface tracking-tight">Dashboard Statistik</h2>
                <p className="text-on-surface-variant text-sm mt-1">Analisis performa atletik kognitif Anda secara real-time.</p>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant p-1 rounded-xl shadow-sm">
                <button 
                  onClick={() => setFilter('7')}
                  className={`px-4 py-2 rounded-lg font-label-caps text-xs font-bold uppercase transition-colors ${filter === '7' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                >
                  7 Hari
                </button>
                <button 
                  onClick={() => setFilter('30')}
                  className={`px-4 py-2 rounded-lg font-label-caps text-xs font-bold uppercase transition-colors ${filter === '30' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                >
                  30 Hari
                </button>
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-label-caps text-xs font-bold uppercase transition-colors ${filter === 'all' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                >
                  Semua
                </button>
              </div>
            </header>

            {/* Top Row: Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Total Sesi */}
              <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Total Sesi</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-display-numeral text-4xl font-black text-primary">142</span>
                    <span className="text-secondary font-label-caps text-[10px] font-bold flex items-center bg-secondary/10 px-2 py-0.5 rounded-full">
                      <TrendingUp className="w-3 h-3 mr-1" strokeWidth={3} /> +12%
                    </span>
                  </div>
                </div>
                <div className="mt-6 h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-2/3 rounded-full"></div>
                </div>
              </div>

              {/* Rata-rata Akurasi */}
              <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Rata-rata Akurasi (%)</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-display-numeral text-4xl font-black text-primary">94.8</span>
                    <span className="text-secondary font-label-caps text-[10px] font-bold flex items-center bg-secondary/10 px-2 py-0.5 rounded-full">
                      <TrendingUp className="w-3 h-3 mr-1" strokeWidth={3} /> +2.1%
                    </span>
                  </div>
                </div>
                <div className="mt-6 h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[94.8%] rounded-full"></div>
                </div>
              </div>

              {/* Rata-rata Respons */}
              <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Rata-rata Respons (ms)</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-display-numeral text-4xl font-black text-primary">842</span>
                    <span className="text-tertiary font-label-caps text-[10px] font-bold flex items-center bg-error/10 px-2 py-0.5 rounded-full text-error">
                      <TrendingDown className="w-3 h-3 mr-1" strokeWidth={3} /> -45ms
                    </span>
                  </div>
                </div>
                <div className="mt-6 h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container w-3/4 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Middle Row: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Line Chart: Response Time Trend */}
              <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">Tren Waktu Respons</h3>
                  <Info className="w-5 h-5 text-on-surface-variant" />
                </div>
                <div className="relative h-48 w-full flex items-end justify-between gap-2 px-2">
                  {/* Fake Line Chart visualization using SVG */}
                  <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                    <path d="M0,120 Q50,110 100,90 T200,80 T300,50 T400,40" fill="none" stroke="#3525cd" strokeWidth="4" strokeLinecap="round"></path>
                    <circle cx="0" cy="120" fill="#3525cd" r="5" className="hover:r-6 cursor-pointer transition-all"></circle>
                    <circle cx="100" cy="90" fill="#3525cd" r="5" className="hover:r-6 cursor-pointer transition-all"></circle>
                    <circle cx="200" cy="80" fill="#3525cd" r="5" className="hover:r-6 cursor-pointer transition-all"></circle>
                    <circle cx="300" cy="50" fill="#3525cd" r="5" className="hover:r-6 cursor-pointer transition-all"></circle>
                    <circle cx="400" cy="40" fill="#3525cd" r="5" className="hover:r-6 cursor-pointer transition-all"></circle>
                    <rect fill="#e0e3e5" height="2" width="400" x="0" y="140" rx="1"></rect>
                  </svg>
                </div>
                <div className="flex justify-between mt-4 text-on-surface-variant font-label-caps text-[10px] font-bold">
                  <span>SEN</span><span>SEL</span><span>RAB</span><span>KAM</span><span>JUM</span><span>SAB</span><span>MIN</span>
                </div>
              </div>

              {/* Bar Chart: Error Distribution */}
              <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">Distribusi Kesalahan</h3>
                  <BarChart2 className="w-5 h-5 text-on-surface-variant" />
                </div>
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-label-caps text-[11px] font-bold">
                      <span className="uppercase text-on-surface">Penjumlahan (+)</span>
                      <span className="text-on-surface-variant">12 Errors</span>
                    </div>
                    <div className="h-4 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary/50 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-label-caps text-[11px] font-bold">
                      <span className="uppercase text-on-surface">Pengurangan (-)</span>
                      <span className="text-on-surface-variant">28 Errors</span>
                    </div>
                    <div className="h-4 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-error/70 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-label-caps text-[11px] font-bold">
                      <span className="uppercase text-on-surface">Perkalian (×)</span>
                      <span className="text-on-surface-variant">42 Errors</span>
                    </div>
                    <div className="h-4 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-label-caps text-[11px] font-bold">
                      <span className="uppercase text-on-surface">Pembagian (÷)</span>
                      <span className="text-on-surface-variant">8 Errors</span>
                    </div>
                    <div className="h-4 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Session Log Table */}
            <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden mb-8">
              <div className="p-4 md:p-6 border-b border-outline-variant flex justify-between items-center bg-surface/50">
                <h3 className="font-headline-md text-lg font-bold text-on-surface">Log Sesi Latihan</h3>
                <button className="flex items-center gap-2 text-primary font-label-caps text-[11px] font-bold uppercase hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">
                  <Download className="w-4 h-4" /> <span className="hidden md:inline">Ekspor CSV</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-outline-variant bg-white">
                      <th className="p-4 font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Tanggal</th>
                      <th className="p-4 font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Operasi</th>
                      <th className="p-4 font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Konfigurasi</th>
                      <th className="p-4 font-label-caps text-[11px] font-bold uppercase text-on-surface-variant text-center">Akurasi</th>
                      <th className="p-4 font-label-caps text-[11px] font-bold uppercase text-on-surface-variant text-right">Rerata Kecepatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant bg-white">
                    {/* Row 1 */}
                    <tr className="hover:bg-surface-container transition-colors group">
                      <td className="p-4 font-body-md text-sm text-on-surface font-medium">24 Okt 2023, 14:20</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">×</span>
                          <span className="font-body-md text-sm font-medium">Perkalian</span>
                        </div>
                      </td>
                      <td className="p-4 text-on-surface-variant text-sm">Level 3 (2-digit)</td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full font-label-caps text-[10px] font-bold">98%</span>
                      </td>
                      <td className="p-4 text-right font-display-numeral text-lg font-bold">1.2s</td>
                    </tr>
                    {/* Row 2 */}
                    <tr className="hover:bg-surface-container transition-colors group">
                      <td className="p-4 font-body-md text-sm text-on-surface font-medium">24 Okt 2023, 11:05</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold text-lg">+</span>
                          <span className="font-body-md text-sm font-medium">Penjumlahan</span>
                        </div>
                      </td>
                      <td className="p-4 text-on-surface-variant text-sm">Level 5 (Mixed)</td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full font-label-caps text-[10px] font-bold">100%</span>
                      </td>
                      <td className="p-4 text-right font-display-numeral text-lg font-bold">0.7s</td>
                    </tr>
                    {/* Row 3 */}
                    <tr className="hover:bg-surface-container transition-colors group">
                      <td className="p-4 font-body-md text-sm text-on-surface font-medium">23 Okt 2023, 18:45</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center font-bold text-lg">-</span>
                          <span className="font-body-md text-sm font-medium">Pengurangan</span>
                        </div>
                      </td>
                      <td className="p-4 text-on-surface-variant text-sm">Level 2 (Mental)</td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-error/10 text-error rounded-full font-label-caps text-[10px] font-bold">82%</span>
                      </td>
                      <td className="p-4 text-right font-display-numeral text-lg font-bold">2.4s</td>
                    </tr>
                    {/* Row 4 */}
                    <tr className="hover:bg-surface-container transition-colors group">
                      <td className="p-4 font-body-md text-sm text-on-surface font-medium">23 Okt 2023, 09:12</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">÷</span>
                          <span className="font-body-md text-sm font-medium">Pembagian</span>
                        </div>
                      </td>
                      <td className="p-4 text-on-surface-variant text-sm">Level 4 (Decimal)</td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full font-label-caps text-[10px] font-bold">95%</span>
                      </td>
                      <td className="p-4 text-right font-display-numeral text-lg font-bold">1.8s</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="p-4 bg-surface/30 border-t border-outline-variant flex items-center justify-between">
                <span className="font-label-caps text-[10px] text-on-surface-variant font-bold uppercase">1-10 dari 142 sesi</span>
                <div className="flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-label-caps text-xs font-bold">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant font-label-caps text-xs font-bold hover:bg-surface-container transition-colors">2</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant font-label-caps text-xs font-bold hover:bg-surface-container transition-colors">3</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
