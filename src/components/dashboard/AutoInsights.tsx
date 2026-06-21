"use client";

import React from "react";
import { Lightbulb } from "lucide-react";

interface StatsData {
  current: {
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

interface OperationData {
  key: string;
  label: string;
  accuracy: number;
}

interface AutoInsightsProps {
  stats: StatsData | null;
  operations: OperationData[];
  period: string;
}

const PERIOD_LABEL: Record<string, string> = {
  "1": "kemarin",
  "3": "3 hari lalu",
  "7": "minggu lalu",
  "30": "bulan lalu",
};

export default function AutoInsights({ stats, operations, period }: AutoInsightsProps) {
  if (!stats) return null;

  const insights: { icon: string; text: string; type: "good" | "bad" | "neutral" }[] = [];

  const { current, deltas } = stats;
  const prevLabel = PERIOD_LABEL[period] ?? "periode sebelumnya";

  // Accuracy insight
  if (deltas.accuracy !== null) {
    if (deltas.accuracy > 0) {
      insights.push({
        icon: "🎯",
        text: `Akurasi naik ${deltas.accuracy}% dibanding ${prevLabel}. Terus pertahankan!`,
        type: "good",
      });
    } else if (deltas.accuracy < -5) {
      insights.push({
        icon: "⚠️",
        text: `Akurasi turun ${Math.abs(deltas.accuracy)}% dibanding ${prevLabel}. Coba latihan lebih rutin.`,
        type: "bad",
      });
    }
  }

  // Response time insight
  if (deltas.avgResponseMs !== null) {
    if (deltas.avgResponseMs < -100) {
      insights.push({
        icon: "⚡",
        text: `Kecepatan menjawab meningkat ${Math.abs(deltas.avgResponseMs)}ms lebih cepat dari ${prevLabel}!`,
        type: "good",
      });
    } else if (deltas.avgResponseMs > 200) {
      insights.push({
        icon: "🐢",
        text: `Waktu respons melambat ${deltas.avgResponseMs}ms dibanding ${prevLabel}.`,
        type: "bad",
      });
    }
  }

  // Skip insight
  if (current.skipCount > 5) {
    insights.push({
      icon: "⏭️",
      text: `Ada ${current.skipCount} soal yang di-skip. Coba hadapi soal yang sulit ya!`,
      type: "neutral",
    });
  }

  // Worst operation
  if (operations.length > 0) {
    const worst = [...operations].sort((a, b) => a.accuracy - b.accuracy)[0];
    if (worst && worst.accuracy < 80) {
      insights.push({
        icon: "📚",
        text: `${worst.label} memiliki akurasi terendah (${worst.accuracy}%). Fokus latihan operasi ini.`,
        type: "bad",
      });
    }
    const best = [...operations].sort((a, b) => b.accuracy - a.accuracy)[0];
    if (best && best.accuracy >= 95) {
      insights.push({
        icon: "🏆",
        text: `Luar biasa! ${best.label} mencapai akurasi ${best.accuracy}%. Pertahankan!`,
        type: "good",
      });
    }
  }

  // Session consistency
  if (deltas.totalSessions !== null && deltas.totalSessions >= 20) {
    insights.push({
      icon: "🔥",
      text: `Frekuensi latihan meningkat ${deltas.totalSessions}% dari ${prevLabel}. Konsistensi luar biasa!`,
      type: "good",
    });
  }

  if (insights.length === 0) {
    if (current.totalSessions === 0) {
      insights.push({
        icon: "💪",
        text: "Belum ada sesi dalam periode ini. Mulai latihan pertama Anda sekarang!",
        type: "neutral",
      });
    } else {
      insights.push({
        icon: "✅",
        text: `Performa Anda stabil dengan ${current.totalSessions} sesi dan akurasi ${current.accuracy}%. Bagus!`,
        type: "good",
      });
    }
  }

  const typeStyle = {
    good: "border-l-secondary bg-secondary/5",
    bad: "border-l-error bg-error/5",
    neutral: "border-l-primary bg-primary/5",
  };

  return (
    <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="font-headline-md text-lg font-bold text-on-surface">
          Insight Otomatis
        </h3>
      </div>
      <div className="space-y-3">
        {insights.map((ins, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-3 rounded-xl border-l-4 ${typeStyle[ins.type]}`}
          >
            <span className="text-lg leading-none mt-0.5">{ins.icon}</span>
            <p className="text-sm text-on-surface leading-relaxed">{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
