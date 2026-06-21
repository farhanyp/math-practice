"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number | null;
  deltaUnit?: string; // e.g. "%" or "ms"
  progressPct?: number;
  progressColor?: string;
  isLoading?: boolean;
  note?: string;
}

export default function StatCard({
  label,
  value,
  unit,
  delta,
  deltaUnit = "%",
  progressPct,
  progressColor = "bg-primary",
  isLoading,
  note,
}: StatCardProps) {
  const hasImproved =
    deltaUnit === "ms"
      ? delta !== null && delta !== undefined && delta < 0   // lower ms = improvement
      : delta !== null && delta !== undefined && delta > 0;

  const hasDeclined =
    deltaUnit === "ms"
      ? delta !== null && delta !== undefined && delta > 0
      : delta !== null && delta !== undefined && delta < 0;

  const displayDelta =
    delta !== null && delta !== undefined
      ? deltaUnit === "ms"
        ? `${delta > 0 ? "+" : ""}${delta}ms`
        : `${delta > 0 ? "+" : ""}${delta}%`
      : null;

  return (
    <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
          {label}
        </span>

        {isLoading ? (
          <div className="mt-2 h-10 w-24 bg-surface-container animate-pulse rounded-lg" />
        ) : (
          <div className="flex items-baseline gap-2 mt-2 flex-wrap">
            <span className="font-display-numeral text-4xl font-black text-primary leading-none">
              {value}
            </span>
            {unit && (
              <span className="text-sm text-on-surface-variant font-medium">{unit}</span>
            )}
            {displayDelta && (
              <span
                className={`font-label-caps text-[10px] font-bold flex items-center px-2 py-0.5 rounded-full ${
                  hasImproved
                    ? "bg-secondary/10 text-secondary"
                    : hasDeclined
                    ? "bg-error/10 text-error"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {hasImproved ? (
                  <TrendingUp className="w-3 h-3 mr-1" strokeWidth={3} />
                ) : hasDeclined ? (
                  <TrendingDown className="w-3 h-3 mr-1" strokeWidth={3} />
                ) : (
                  <Minus className="w-3 h-3 mr-1" strokeWidth={3} />
                )}
                {displayDelta}
              </span>
            )}
          </div>
        )}

        {note && (
          <p className="text-[10px] text-on-surface-variant mt-1">{note}</p>
        )}
      </div>

      {progressPct !== undefined && (
        <div className="mt-6 h-1.5 bg-surface-container rounded-full overflow-hidden">
          {isLoading ? (
            <div className="h-full w-1/2 bg-surface-container-high animate-pulse rounded-full" />
          ) : (
            <div
              className={`h-full ${progressColor} rounded-full transition-all duration-700`}
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          )}
        </div>
      )}
    </div>
  );
}
