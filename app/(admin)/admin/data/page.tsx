"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  Gift,
  RotateCcw,
  Trash2,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import AdminIdleLogout from "@/components/AdminIdleLogout";
import { useAdminFetch } from "@/lib/useAdminFetch";

type TargetTable = "orders" | "claims" | "refunds";

type Row = {
  id: string;
  created_at: string;
  full_name: string;
  status: string;
  hasFile: boolean;
};

const TABLE_META: Record<TargetTable, { label: string; endpoint: string }> = {
  orders: { label: "Pesanan", endpoint: "/api/admin/orders" },
  claims: { label: "Klaim Cashback", endpoint: "/api/admin/claims" },
  refunds: { label: "Refund", endpoint: "/api/admin/refunds" },
};

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function fmtDate(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function AdminDataPage() {
  const af = useAdminFetch();
  const [tab, setTab] = useState<TargetTable>("orders");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmState, setConfirmState] = useState<
    null | { scope: "selected" | "all"; includeFiles: boolean }
  >(null);
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const res = await af(TABLE_META[tab].endpoint);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat data.");
      const list: any[] = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
      setRows(
        list.map((r) => ({
          id: r.id,
          created_at: r.created_at,
          full_name: r.full_name || "-",
          status: r.status || "-",
          hasFile:
            tab === "orders"
              ? Boolean(r.payment_proof_key)
              : tab === "claims"
                ? Boolean(r.payment_proof_url || r.screenshot_follow_url || r.screenshot_share_url)
                : Boolean(r.refund_proof_key),
        }))
      );
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));
  }

  async function handleDelete() {
    if (!confirmState) return;
    setError("");
    setBusy(true);
    try {
      const body =
        confirmState.scope === "all"
          ? { password, scope: "all", includeFiles: confirmState.includeFiles }
          : { password, scope: "selected", table: tab, ids: Array.from(selected), includeFiles: confirmState.includeFiles };
      const res = await af("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghapus data.");
      setResult(
        `Berhasil: ${json.totalRows} baris dihapus, ${json.totalFiles + (json.orphans || 0)} foto dibersihkan.`
      );
      setConfirmState(null);
      setPassword("");
      setPhrase("");
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const needsPhrase = confirmState?.scope === "all";
  const canSubmit = password.length > 0 && (!needsPhrase || phrase.trim() === "HAPUS SEMUA");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
      <AdminIdleLogout />
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" /> Manajemen Hapus Data
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Penghapusan permanen — tidak bisa dibatalkan</p>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
      </div>

      {result && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {result}
          <button onClick={() => setResult(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-4 animate-fade-in">
        {(Object.keys(TABLE_META) as TargetTable[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
              tab === t
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800"
            )}
          >
            {t === "orders" ? (
              <ShoppingBag className="w-3.5 h-3.5" />
            ) : t === "claims" ? (
              <Gift className="w-3.5 h-3.5" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            {TABLE_META[t].label}
          </button>
        ))}
      </div>

      <div className="card-sm">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={rows.length > 0 && selected.size === rows.length}
              onChange={toggleAll}
              disabled={loading || rows.length === 0}
              className="w-4 h-4 accent-gray-900"
            />
            Pilih semua ({rows.length})
          </label>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Muat ulang
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Memuat data…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Tidak ada data.</p>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[26rem] overflow-y-auto">
            {rows.map((r) => (
              <label
                key={r.id}
                className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={() => toggle(r.id)}
                  className="w-4 h-4 accent-gray-900 shrink-0"
                />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-gray-800 truncate">{r.full_name}</span>
                  <span className="block text-[11px] text-gray-400">{fmtDate(r.created_at)} · {r.status}</span>
                </span>
                {r.hasFile && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 shrink-0">
                    ada foto
                  </span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 grid sm:grid-cols-2 gap-3 animate-fade-in">
        <DeleteButton
          title="Hapus Terpilih + Foto"
          sub={`${selected.size} baris dipilih`}
          disabled={selected.size === 0}
          danger={false}
          onClick={() => setConfirmState({ scope: "selected", includeFiles: true })}
        />
        <DeleteButton
          title="Hapus Terpilih (data saja)"
          sub={`${selected.size} baris dipilih`}
          disabled={selected.size === 0}
          danger={false}
          onClick={() => setConfirmState({ scope: "selected", includeFiles: false })}
        />
        <div className="sm:col-span-2">
          <div className="p-4 rounded-2xl border-2 border-red-200 bg-red-50/60 flex flex-col sm:flex-row sm:items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-700">HAPUS SEMUA DATA</p>
              <p className="text-xs text-red-500">
                Mengosongkan Pesanan + Klaim + Refund sekaligus{", "}opsional beserta semua foto bukti.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setConfirmState({ scope: "all", includeFiles: true })}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 transition-all duration-200"
              >
                Semua + Foto
              </button>
              <button
                onClick={() => setConfirmState({ scope: "all", includeFiles: false })}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-700 bg-white border border-red-300 hover:bg-red-50 transition-all duration-200"
              >
                Semua (data saja)
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmState && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !busy && setConfirmState(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-7 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 text-center">Konfirmasi Penghapusan</h2>
            <p className="text-xs text-gray-500 mt-1 mb-4 text-center">
              {confirmState.scope === "all"
                ? `Semua data ${confirmState.includeFiles ? "+ semua foto " : ""}akan dihapus permanen.`
                : `${selected.size} baris ${TABLE_META[tab].label.toLowerCase()} ${confirmState.includeFiles ? "+ fotonya " : ""}akan dihapus permanen.`}
            </p>

            {needsPhrase && (
              <div className="mb-3">
                <label className="field-label">
                  Ketik <b>HAPUS SEMUA</b> untuk konfirmasi
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="HAPUS SEMUA"
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div className="mb-4">
              <label className="field-label">Password Hapus Data</label>
              <input
                type="password"
                className="input-field"
                placeholder="Masukkan password hapus data"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus={!needsPhrase}
                onKeyDown={(e) => e.key === "Enter" && canSubmit && !busy && handleDelete()}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 animate-fade-in">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmState(null)}
                disabled={busy}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={!canSubmit || busy}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
              >
                {busy ? "Menghapus…" : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeleteButton({
  title,
  sub,
  disabled,
  danger,
  onClick,
}: {
  title: string;
  sub: string;
  disabled: boolean;
  danger: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-4 rounded-2xl border-2 text-left transition-all duration-200",
        danger
          ? "border-red-200 bg-red-50/60 hover:border-red-400"
          : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/40",
        disabled && "opacity-40 pointer-events-none"
      )}
    >
      <p className={cn("text-sm font-bold", danger ? "text-red-700" : "text-gray-800")}>{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </button>
  );
}
