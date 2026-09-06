"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export type LogsStats = {
  granularity: "daily" | "monthly";
  perDay: Array<{ key: string; keamanan: number; hapus: number }>;
  totalSecurity: number;
  totalDelete: number;
  byAction: Record<string, number>;
};

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function labelOf(key: string, granularity: "daily" | "monthly"): string {
  if (granularity === "monthly") return `${MONTHS_ID[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;
  return `${Number(key.slice(8, 10))} ${MONTHS_ID[Number(key.slice(5, 7)) - 1]}`;
}

export default function LogsCharts({ stats }: { stats: LogsStats }) {
  const data = stats.perDay.map((d) => ({ ...d, label: labelOf(d.key, stats.granularity) }));

  const chips: Array<{ emoji: string; label: string; value: number }> = [
    { emoji: "🚨", label: "Bypass", value: stats.byAction["unauthorized_access"] || 0 },
    { emoji: "❌", label: "Login gagal", value: stats.byAction["login_failed"] || 0 },
    { emoji: "✅", label: "Login sukses", value: stats.byAction["login_ok"] || 0 },
    { emoji: "⛔", label: "Gate salah", value: stats.byAction["gate_failed"] || 0 },
    { emoji: "🔑", label: "Password hapus salah", value: stats.byAction["delete_password_failed"] || 0 },
  ];
  const deleteTotal = Object.entries(stats.byAction)
    .filter(([k]) => k.startsWith("delete"))
    .reduce((s, [, v]) => s + v, 0);
  chips.push({ emoji: "🗑️", label: "Hapus data", value: deleteTotal });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <span
            key={c.label}
            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-sm"
          >
            {c.emoji} {c.label} · {c.value}
          </span>
        ))}
      </div>

      <div className="card-sm pt-4 pr-2" style={{ height: 240 }}>
        {data.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">Tidak ada aktivitas pada rentang ini.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                interval="preserveStartEnd"
                minTickGap={18}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="keamanan" name="Keamanan" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
              <Bar dataKey="hapus" name="Penghapusan data" stackId="a" fill="#9ca3af" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
