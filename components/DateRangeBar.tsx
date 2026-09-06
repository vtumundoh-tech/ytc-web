"use client";

import { Calendar } from "lucide-react";

export type DateRange = { from: string; to: string };

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function defaultRange(days = 7): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: toISODate(from), to: toISODate(to) };
}

export function rangeDays(r: DateRange): number {
  if (!r.from || !r.to) return 0;
  const a = new Date(r.from + "T00:00:00");
  const b = new Date(r.to + "T00:00:00");
  return Math.floor((b.getTime() - a.getTime()) / 86400000) + 1;
}

// Periode pembanding: jendela sama panjang tepat sebelum tanggal mulai.
export function shiftRangeBack(r: DateRange): DateRange {
  const days = rangeDays(r) || 1;
  const a = new Date((r.from || toISODate(new Date())) + "T00:00:00");
  a.setDate(a.getDate() - days);
  return { from: toISODate(a), to: toISODate(new Date(a.getTime() + (days - 1) * 86400000)) };
}

export function fmtRangeID(r: DateRange): string {
  const fmt = (s: string) => {
    const [y, m, d] = s.split("-");
    return `${Number(d)}/${Number(m)}/${y}`;
  };
  return `${fmt(r.from)} – ${fmt(r.to)}`;
}

const PRESETS = [
  { label: "7 Hari", days: 7 },
  { label: "30 Hari", days: 30 },
  { label: "1 Tahun", days: 365 },
];

export default function DateRangeBar({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
}) {
  const inputCls =
    "rounded-lg border border-gray-200 px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400";

  return (
    <div className="card-sm flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <Calendar className="w-4 h-4 text-gray-400" /> Rentang
      </span>

      <div className="flex items-center gap-1.5">
        {PRESETS.map((p) => {
          const active = rangeDays(value) === p.days;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(defaultRange(p.days))}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 ${
                active ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="date"
          className={inputCls}
          value={value.from}
          max={value.to || undefined}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
        />
        <span className="text-gray-400 text-sm">—</span>
        <input
          type="date"
          className={inputCls}
          value={value.to}
          min={value.from || undefined}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
        />
      </div>
    </div>
  );
}
