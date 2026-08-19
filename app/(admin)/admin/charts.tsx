"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export type DashboardBucket = {
  key: string;
  label: string;
  total: number;
  pending: number;
  paid: number;
  revenue: number;
};

export type DashboardSlice = {
  status: string;
  count: number;
  revenue: number;
};

const SLICE_COLORS: Record<string, string> = {
  paid: "#059669",
  pending: "#f59e0b",
  expired: "#9ca3af",
  failed: "#ef4444",
  cancelled: "#64748b",
};

function rupiah(n: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

export default function AdminCharts({
  series,
  slices,
  mode,
  activeBucket,
  activeStatus,
  onBucket,
  onStatus,
}: {
  series: DashboardBucket[];
  slices: DashboardSlice[];
  mode: "daily" | "monthly";
  activeBucket: string | null;
  activeStatus: string | null;
  onBucket: (b: DashboardBucket) => void;
  onStatus: (s: DashboardSlice) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">
            Tren {mode === "daily" ? "Harian (30 hari)" : "Bulanan (12 bulan)"}
          </h3>
          <span className="text-[11px] text-gray-400">Klik bar untuk melihat detail order</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={series} onClick={(d: any) => d?.activePayload?.[0]?.payload && onBucket(d.activePayload[0].payload)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis yAxisId="count" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} width={30} />
            <YAxis yAxisId="rev" orientation="right" tick={{ fontSize: 10, fill: "#10b981" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => (v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + "jt" : v >= 1_000 ? Math.round(v / 1_000) + "rb" : String(v))} width={42} />
            <Tooltip
              formatter={(value: any, name: any) => (name === "Pendapatan" ? rupiah(Number(value) || 0) : value)}
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="count" dataKey="total" name="Total Order" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Bar yAxisId="count" dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Line yAxisId="rev" dataKey="revenue" name="Pendapatan" stroke="#059669" strokeWidth={2} dot={{ r: 2.5, fill: "#059669" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">Komposisi Status</h3>
          <span className="text-[11px] text-gray-400">Klik irisan</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart onClick={(d: any) => d?.activePayload?.[0]?.payload && onStatus(d.activePayload[0].payload)}>
            <Pie
              data={slices}
              dataKey="count"
              nameKey="status"
              innerRadius={48}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={2}
            >
              {slices.map((s) => (
                <Cell
                  key={s.status}
                  fill={SLICE_COLORS[s.status] || "#9ca3af"}
                  style={{ outline: "none", cursor: "pointer" }}
                  opacity={activeStatus && activeStatus !== s.status ? 0.35 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => {
                const slice = slices.find((s) => s.status === name);
                return [`${value} order (${slice ? rupiah(slice.revenue) : ""})`, name];
              }}
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 space-y-1.5">
          {slices.map((s) => (
            <button
              key={s.status}
              type="button"
              onClick={() => onStatus(s)}
              className={cnList(
                "w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs text-left transition-all duration-200",
                activeStatus === s.status ? "bg-gray-100" : "hover:bg-gray-50"
              )}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SLICE_COLORS[s.status] || "#9ca3af" }} />
                <span className="capitalize text-gray-700">{s.status}</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="text-gray-400">{s.count}</span>
                <span className="text-gray-500 font-medium w-24 text-right">{rupiah(s.revenue)}</span>
              </span>
            </button>
          ))}
          {activeBucket && (
            <div className="mt-1 px-3 py-1.5 rounded-lg bg-blue-50 text-[11px] text-blue-700">
              Data ditampilkan untuk: <strong>{activeBucket}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cnList(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}
