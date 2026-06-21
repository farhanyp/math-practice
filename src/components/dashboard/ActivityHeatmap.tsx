"use client";

import React, { useMemo } from "react";

interface DayData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data: DayData[];
}

const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const DAYS = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

function getColor(count: number): string {
  if (count === 0) return "bg-surface-container";
  if (count === 1) return "bg-primary/20";
  if (count === 2) return "bg-primary/40";
  if (count <= 4) return "bg-primary/60";
  return "bg-primary";
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    if (!data || data.length === 0) return { weeks: [], monthLabels: [] };

    // Pad the front with empty days so first day aligns with correct weekday
    const firstDate = new Date(data[0].date + "T00:00:00");
    const startDayOfWeek = firstDate.getDay(); // 0=Sun, 6=Sat

    const padded: (DayData | null)[] = [
      ...Array(startDayOfWeek).fill(null),
      ...data,
    ];

    // Split into weeks (columns of 7)
    const weeksArr: (DayData | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeksArr.push(padded.slice(i, i + 7));
    }

    // Month labels: track which week each month starts at
    const labels: { weekIndex: number; label: string }[] = [];
    let lastMonth = -1;
    weeksArr.forEach((week, wi) => {
      week.forEach((day) => {
        if (!day) return;
        const d = new Date(day.date + "T00:00:00");
        const m = d.getMonth();
        if (m !== lastMonth) {
          labels.push({ weekIndex: wi, label: MONTHS[m] });
          lastMonth = m;
        }
      });
    });

    return { weeks: weeksArr, monthLabels: labels };
  }, [data]);

  const totalSessions = data.reduce((s, d) => s + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  return (
    <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-headline-md text-lg font-bold text-on-surface">
            Aktivitas Latihan
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {activeDays} hari aktif · {totalSessions} total sesi (1 tahun terakhir)
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
            Kurang
          </span>
          {[0, 1, 2, 3, 4].map((v) => (
            <div
              key={v}
              className={`w-3 h-3 rounded-sm ${getColor(v)}`}
            />
          ))}
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
            Banyak
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: "28px" }}>
            {monthLabels.map((ml, i) => (
              <div
                key={i}
                className="text-[10px] text-on-surface-variant font-bold"
                style={{ position: "relative", left: `${ml.weekIndex * 14}px`, marginRight: 0 }}
              >
                {ml.label}
              </div>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAYS.map((d, i) => (
                <div
                  key={d}
                  className="h-3 flex items-center text-[9px] text-on-surface-variant font-bold leading-none"
                  style={{ opacity: i % 2 === 0 ? 1 : 0 }}
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`w-3 h-3 rounded-sm transition-all cursor-default group relative ${
                      day ? getColor(day.count) : "opacity-0"
                    }`}
                    title={day ? `${day.date}: ${day.count} sesi` : ""}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
