"use client";

import React from "react";

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

interface OperationBreakdownProps {
  data: OperationData[];
}

const OP_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  addition:       { bg: "bg-secondary/10",  text: "text-secondary", bar: "bg-secondary" },
  subtraction:    { bg: "bg-error/10",      text: "text-error",     bar: "bg-error" },
  multiplication: { bg: "bg-primary/10",    text: "text-primary",   bar: "bg-primary" },
  division:       { bg: "bg-amber-500/10",  text: "text-amber-600", bar: "bg-amber-500" },
};
const DEFAULT_COLOR = { bg: "bg-surface-container", text: "text-on-surface-variant", bar: "bg-on-surface-variant" };

function OP_SYMBOL(key: string) {
  const map: Record<string, string> = {
    addition: "+", subtraction: "−", multiplication: "×", division: "÷",
  };
  return map[key] ?? "?";
}

export default function OperationBreakdown({ data }: OperationBreakdownProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-on-surface-variant text-sm gap-2">
        <span className="text-3xl">📈</span>
        <span>Belum ada data operasi</span>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="space-y-5">
      {data.map((op) => {
        const colors = OP_COLORS[op.key] ?? DEFAULT_COLOR;
        const correctPct = op.total > 0 ? (op.correct / op.total) * 100 : 0;
        const wrongPct   = op.total > 0 ? (op.wrong / op.total) * 100 : 0;
        const skipPct    = op.total > 0 ? (op.skipped / op.total) * 100 : 0;
        const toPct      = op.total > 0 ? (op.timeout / op.total) * 100 : 0;
        const barWidth   = (op.total / maxTotal) * 100;

        return (
          <div key={op.key} className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-base shrink-0`}
                >
                  {OP_SYMBOL(op.key)}
                </span>
                <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface">
                  {op.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded-full font-label-caps text-[10px] font-bold ${colors.bg} ${colors.text}`}
                >
                  {op.accuracy}%
                </span>
                <span className="text-[10px] text-on-surface-variant font-bold">
                  {op.total} soal
                </span>
                {op.avgResponseMs > 0 && (
                  <span className="text-[10px] text-on-surface-variant font-bold hidden sm:inline">
                    ~{(op.avgResponseMs / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            </div>

            {/* Stacked bar: correct / wrong / skip / timeout */}
            <div
              className="h-4 bg-surface-container rounded-full overflow-hidden flex"
              style={{ width: "100%" }}
            >
              <div
                title={`Benar: ${op.correct}`}
                className={`h-full ${colors.bar} transition-all`}
                style={{ width: `${(correctPct / 100) * barWidth}%` }}
              />
              <div
                title={`Salah: ${op.wrong}`}
                className="h-full bg-error/60 transition-all"
                style={{ width: `${(wrongPct / 100) * barWidth}%` }}
              />
              <div
                title={`Skip: ${op.skipped}`}
                className="h-full bg-amber-400/60 transition-all"
                style={{ width: `${(skipPct / 100) * barWidth}%` }}
              />
              <div
                title={`Timeout: ${op.timeout}`}
                className="h-full bg-on-surface-variant/30 transition-all"
                style={{ width: `${(toPct / 100) * barWidth}%` }}
              />
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
        {[
          { color: "bg-primary", label: "Benar" },
          { color: "bg-error/60", label: "Salah" },
          { color: "bg-amber-400/60", label: "Skip" },
          { color: "bg-on-surface-variant/30", label: "Timeout" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
