"use client";

import React, { useMemo } from "react";

interface DailyData {
  date: string;
  accuracy: number;
  avgResponseMs: number;
  sessionCount: number;
}

interface DualLineChartProps {
  data: DailyData[];
  period: string;
}

function formatDate(dateStr: string, period: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (period === "1") {
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  if (period === "30" || period === "all") {
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }
  return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
}

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export default function DualLineChart({ data, period }: DualLineChartProps) {
  const W = 400;
  const H = 140;
  const PAD = { top: 12, right: 12, bottom: 4, left: 4 };

  const { accuracyPath, responsePath, accuracyPoints, responsePoints, maxMs, minMs } =
    useMemo(() => {
      if (!data || data.length === 0) {
        return {
          accuracyPath: "",
          responsePath: "",
          accuracyPoints: [],
          responsePoints: [],
          maxMs: 0,
          minMs: 0,
        };
      }

      const n = data.length;
      const maxMs = Math.max(...data.map((d) => d.avgResponseMs), 1);
      const minMs = Math.min(...data.map((d) => d.avgResponseMs), 0);
      const msRange = maxMs - minMs || 1;

      const xFor = (i: number) =>
        PAD.left + (i / Math.max(n - 1, 1)) * (W - PAD.left - PAD.right);
      const yForAcc = (acc: number) =>
        PAD.top + (1 - acc / 100) * (H - PAD.top - PAD.bottom);
      const yForMs = (ms: number) =>
        PAD.top + (1 - (ms - minMs) / msRange) * (H - PAD.top - PAD.bottom);

      const accPts = data.map((d, i) => ({ x: xFor(i), y: yForAcc(d.accuracy) }));
      const msPts = data.map((d, i) => ({ x: xFor(i), y: yForMs(d.avgResponseMs) }));

      return {
        accuracyPath: buildPath(accPts),
        responsePath: buildPath(msPts),
        accuracyPoints: accPts,
        responsePoints: msPts,
        maxMs,
        minMs,
      };
    }, [data]);

  // Decide how many labels to show
  const labelIndices = useMemo(() => {
    if (!data || data.length <= 1) return data?.map((_, i) => i) ?? [];
    const maxLabels = 7;
    if (data.length <= maxLabels) return data.map((_, i) => i);
    const step = Math.ceil(data.length / maxLabels);
    return data.map((_, i) => i).filter((i) => i % step === 0 || i === data.length - 1);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant text-sm gap-2">
        <span className="text-3xl">📊</span>
        <span>Belum ada data untuk periode ini</span>
      </div>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-primary rounded" />
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
            Akurasi (%)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-secondary rounded" />
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
            Waktu Respons (ms)
          </span>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: "160px" }}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = PAD.top + (1 - pct / 100) * (H - PAD.top - PAD.bottom);
            return (
              <line
                key={pct}
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke="#e0e3e5"
                strokeWidth="1"
              />
            );
          })}

          {/* Accuracy area fill */}
          {accuracyPoints.length > 0 && (
            <path
              d={`${accuracyPath} L ${accuracyPoints[accuracyPoints.length - 1].x} ${H - PAD.bottom} L ${PAD.left} ${H - PAD.bottom} Z`}
              fill="url(#accGrad)"
              opacity="0.15"
            />
          )}
          <defs>
            <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3525cd" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3525cd" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Accuracy line */}
          <path
            d={accuracyPath}
            fill="none"
            stroke="#3525cd"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Response time line */}
          <path
            d={responsePath}
            fill="none"
            stroke="#7c4dff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5,3"
          />

          {/* Dots for accuracy */}
          {accuracyPoints.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#3525cd" />
          ))}

          {/* Dots for response */}
          {responsePoints.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#7c4dff" />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {data.map((d, i) =>
            labelIndices.includes(i) ? (
              <span
                key={i}
                className="text-[9px] text-on-surface-variant font-bold"
                style={{ flex: "0 0 auto" }}
              >
                {formatDate(d.date, period)}
              </span>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
