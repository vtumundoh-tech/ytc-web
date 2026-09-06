"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ScrollText, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import AdminIdleLogout from "@/components/AdminIdleLogout";
import { useAdminFetch } from "@/lib/useAdminFetch";
import DateRangeBar, { defaultRange, fmtRangeID, type DateRange } from "@/components/DateRangeBar";
import type { LogsStats } from "./logs-charts";

const Charts = dynamic(() => import("./logs-charts"), { ssr: false });

type LogEntry = {
  id: number;
  action: string;
  target_type: string | null;
  target_id: string | null;
  detail: string | null;
  created_at: string;
};

const ACTION_META: Record<string, { label: string; emoji: string; cls: string }> = {
  gate_failed: { label: "Kode Gate Salah", emoji: "⛔", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  login_failed: { label: "Login Gagal", emoji: "❌", cls: "bg-red-50 text-red-700 border-red-200" },
  login_ok: { label: "Login Berhasil", emoji: "✅", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  unauthorized_access: { label: "Bypass Terdeteksi", emoji: "🚨", cls: "bg-red-50 text-red-700 border-red-200" },
  delete_password_failed: { label: "Password Hapus Salah", emoji: "🔑", cls: "bg-red-50 text-red-700 border-red-200" },
  delete_all_orders: { label: "Hapus Semua Pesanan", emoji: "🗑️", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  delete_all_claims: { label: "Hapus Semua Klaim", emoji: "🗑️", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  delete_all_refunds: { label: "Hapus Semua Refund", emoji: "🗑️", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  delete_selected_orders: { label: "Hapus Pesanan Terpilih", emoji: "🗑️", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  delete_selected_claims: { label: "Hapus Klaim Terpilih", emoji: "🗑️", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  delete_selected_refunds: { label: "Hapus Refund Terpilih", emoji: "🗑️", cls: "bg-gray-100 text-gray-600 border-gray-200" },
};

const FILTERS: Array<{ key: string; label: string }> = [
  { key: "all", label: "Semua" },
  { key: "security", label: "Keamanan" },
  { key: "delete", label: "Penghapusan" },
];

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function LogsChartsSection({ stats, range }: { stats: LogsStats; range: DateRange }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Aktivitas {fmtRangeID(range)} · per {stats.granularity === "monthly" ? "bulan" : "hari"}
      </p>
      <Charts stats={stats} />
    </div>
  );
}

export default function AdminLogsPage() {
  const af = useAdminFetch();
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [range, setRange] = useState<DateRange>(() => defaultRange(7));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<LogsStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await af(
        `/api/admin/logs?filter=${filter}&page=${page}&from=${range.from}&to=${range.to}&stats=1`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat logs.");
      setLogs(json.logs || []);
      setTotal(json.total || 0);
      setStats(json.stats || null);
    } catch {
      setLogs([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [filter, page, range]);

  useEffect(() => {
    load();
  }, [load]);

  function changeRange(r: DateRange) {
    setRange(r);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / 50));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
      <AdminIdleLogout />
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-gray-700" /> Logs Admin
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Riwayat kejadian keamanan & penghapusan data</p>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
      </div>

      <div className="space-y-4 mb-4 animate-fade-in">
        <DateRangeBar value={range} onChange={changeRange} />
        {stats && stats.perDay.length > 0 && <LogsChartsSection stats={stats} range={range} />}
      </div>

      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
                filter === f.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Muat ulang
        </button>
      </div>

      <div className="card-sm divide-y divide-gray-100 min-h-[12rem]">
        {loading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Memuat…</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">Belum ada log.</p>
        ) : (
          logs.map((log) => {
            const meta = ACTION_META[log.action] || {
              label: log.action,
              emoji: "•",
              cls: "bg-gray-50 text-gray-500 border-gray-200",
            };
            return (
              <div key={log.id} className="py-3 flex items-start gap-3">
                <span
                  className={cn(
                    "shrink-0 text-[10px] font-bold px-2 py-1 rounded-full border whitespace-nowrap",
                    meta.cls
                  )}
                >
                  {meta.emoji} {meta.label}
                </span>
                <span className="flex-1 min-w-0 text-xs text-gray-600 break-words">
                  {log.target_type === "security" && log.target_id ? (
                    <>
                      IP: <code className="text-[11px] bg-gray-50 rounded px-1">{log.target_id}</code>
                      {log.detail ? ` — ${log.detail}` : ""}
                    </>
                  ) : (
                    (log.detail || log.target_id || "-")
                  )}
                </span>
                <span className="shrink-0 text-[11px] text-gray-400 tabular-nums">{fmtTime(log.created_at)}</span>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-gray-500 tabular-nums">
            Hal {page}/{totalPages} · {total} log
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
