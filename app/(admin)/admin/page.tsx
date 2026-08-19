"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ShoppingBag, Gift, Users, DollarSign, ExternalLink, Save, Download, FileText, Settings, Power, Search, Calendar, Filter, X, QrCode, Upload, RotateCcw, AlertTriangle, Paperclip } from "lucide-react";
import { useMemo } from "react";
import { parseJsonSafe, isHeicFile, HEIC_ERROR } from "@/lib/fetchJson";

type Order = {
  id: string;
  created_at: string;
  full_name: string;
  whatsapp: string;
  email: string | null;
  tier_label: string;
  amount: number;
  status: string;
  payment_type: string | null;
  midtrans_order_id: string;
  machine_id: string | null;
  license_key: string | null;
  cashback_code: string | null;
  email_status: string | null;
  admin_notes: string | null;
  rejection_reason: string | null;
  rejection_email_sent_at: string | null;
  agree_snk: boolean;
  ip_address: string | null;
  user_agent: string | null;
  browser: string | null;
  os: string | null;
  device_type: string | null;
  payment_proof_url: string | null;
  rejection_type: string | null;
  amount_paid_by_customer: number | null;
  amount_remaining: number | null;
  supplement_for: string | null;
};

type Claim = {
  id: string;
  created_at: string;
  full_name: string;
  whatsapp: string;
  email: string | null;
  machine_id: string;
  license_key: string;
  tier: string;
  amount_paid: number;
  payment_proof_url: string | null;
  screenshot_follow_url: string;
  screenshot_like_url: string;
  screenshot_share_url: string;
  notes: string | null;
  status: string;
  admin_notes: string | null;
  agree_snk: boolean;
  ip_address: string | null;
  user_agent: string | null;
  browser: string | null;
  os: string | null;
  device_type: string | null;
};

const ORDER_STATUSES = ["pending", "paid", "expired", "failed", "cancelled"];
const CLAIM_STATUSES = ["pending", "approved", "paid", "rejected"];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  expired: "bg-gray-50 text-gray-500 border-gray-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-gray-50 text-gray-500 border-gray-200",
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function parseNum(s: string): number {
  const n = parseInt(s.replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminPage() {
  const [tab, setTab] = useState<"orders" | "claims" | "refunds" | "settings">("orders");
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin-logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola pembelian & klaim cashback</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" /> Keluar
        </button>
      </div>

      <div className="flex gap-2 mb-6 animate-fade-in">
        <TabBtn active={tab === "orders"} onClick={() => setTab("orders")}>
          <ShoppingBag className="w-3.5 h-3.5" /> Pembelian
        </TabBtn>
        <TabBtn active={tab === "claims"} onClick={() => setTab("claims")}>
          <Gift className="w-3.5 h-3.5" /> Klaim Cashback
        </TabBtn>
        <TabBtn active={tab === "refunds"} onClick={() => setTab("refunds")}>
          <RotateCcw className="w-3.5 h-3.5" /> Refund
        </TabBtn>
        <TabBtn active={tab === "settings"} onClick={() => setTab("settings")}>
          <Settings className="w-3.5 h-3.5" /> Pengaturan
        </TabBtn>
      </div>

      <div className="animate-slide-up" key={tab}>
        {tab === "orders" ? <OrdersTab /> : tab === "claims" ? <ClaimsTab /> : tab === "refunds" ? <RefundsTab /> : <SettingsTab />}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
        active
          ? "bg-gray-900 text-white shadow-sm"
          : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800"
      )}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", STATUS_STYLES[status] || "bg-gray-50 text-gray-500")}>
      {status}
    </span>
  );
}

function DeviceInfo({
  ip,
  browser,
  os,
  deviceType,
}: {
  ip: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
}) {
  if (!ip && !browser && !os && !deviceType) return null;
  const parts = [ip, [browser, os].filter(Boolean).join(" / "), deviceType].filter(Boolean);
  return (
    <div className="text-[11px] text-gray-400">
      IP: {parts.join(" · ")}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card-sm animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

type FilterState = {
  query: string;
  fromDate: string;
  toDate: string;
  tier: string;
};

function FilterBar({
  state,
  onState,
  tierOptions,
  placeholder,
  accent,
}: {
  state: FilterState;
  onState: (s: FilterState) => void;
  tierOptions: string[];
  placeholder: string;
  accent: "emerald" | "violet";
}) {
  const focus = accent === "emerald"
    ? "focus:ring-emerald-500/20 focus:border-emerald-400"
    : "focus:ring-violet-500/20 focus:border-violet-400";

  function preset(days: number) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    return {
      fromDate: from.toISOString().slice(0, 10),
      toDate: to.toISOString().slice(0, 10),
    };
  }

  function hasAnyFilter() {
    return state.query.trim() !== "" || state.fromDate !== "" || state.toDate !== "" || state.tier !== "";
  }

  return (
    <div className="card-sm space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter</span>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className={cn("w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none placeholder:text-gray-300", focus)}
            value={state.query}
            onChange={(e) => onState({ ...state, query: e.target.value })}
            placeholder={placeholder}
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onState({ ...state, ...preset(1) })}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors duration-200"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => onState({ ...state, ...preset(7) })}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors duration-200"
          >
            Minggu Ini
          </button>
          <button
            type="button"
            onClick={() => onState({ ...state, ...preset(30) })}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors duration-200"
          >
            Bulan Ini
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            className={cn("rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none", focus)}
            value={state.fromDate}
            onChange={(e) => onState({ ...state, fromDate: e.target.value })}
          />
          <span className="text-gray-400 text-sm">—</span>
          <input
            type="date"
            className={cn("rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none", focus)}
            value={state.toDate}
            onChange={(e) => onState({ ...state, toDate: e.target.value })}
          />
        </div>

        <select
          className={cn("rounded-lg border border-gray-200 px-2.5 py-2 text-sm bg-white focus:outline-none", focus)}
          value={state.tier}
          onChange={(e) => onState({ ...state, tier: e.target.value })}
        >
          <option value="">Semua Paket</option>
          {tierOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {hasAnyFilter() && (
          <button
            type="button"
            onClick={() => onState({ query: "", fromDate: "", toDate: "", tier: "" })}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
          >
            <X className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  type OrderDraft = { status: string; admin_notes: string; rejection_reason: string; rejection_type: string; amount_paid_by_customer: string; amount_remaining: string };
  const [drafts, setDrafts] = useState<Record<string, Partial<OrderDraft>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>({ query: "", fromDate: "", toDate: "", tier: "" });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function draftFor(o: Order): OrderDraft {
    return {
      status: o.status,
      admin_notes: o.admin_notes || "",
      rejection_reason: o.rejection_reason || "",
      rejection_type: o.rejection_type || (o.status === "cancelled" || o.status === "failed" ? "other" : ""),
      amount_paid_by_customer: o.amount_paid_by_customer != null ? String(o.amount_paid_by_customer) : "",
      amount_remaining: o.amount_remaining != null ? String(o.amount_remaining) : "",
      ...drafts[o.id],
    };
  }

  function isDirty(o: Order): boolean {
    const d = draftFor(o);
    return d.status !== o.status || d.admin_notes !== (o.admin_notes || "") || d.rejection_reason !== (o.rejection_reason || "")
      || d.rejection_type !== (o.rejection_type || (o.status === "cancelled" || o.status === "failed" ? "other" : ""))
      || parseNum(d.amount_paid_by_customer) !== (o.amount_paid_by_customer ?? 0)
      || parseNum(d.amount_remaining) !== (o.amount_remaining ?? 0);
  }

  function setDraft(id: string, patch: Partial<OrderDraft>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function save(o: Order) {
    setSaving(o.id);
    setError(null);
    const d = draftFor(o);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: o.id,
          status: d.status,
          admin_notes: d.admin_notes,
          rejection_reason: d.rejection_reason,
          rejection_type: d.rejection_type,
          amount_paid_by_customer: parseNum(d.amount_paid_by_customer),
          amount_remaining: parseNum(d.amount_remaining),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan.");
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[o.id];
        return next;
      });
      await load();
      setSavedId(o.id);
      setTimeout(() => setSavedId(null), 2500);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan.");
    } finally {
      setSaving(null);
    }
  }

  const paid = orders.filter((o) => o.status === "paid").length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const total = orders.reduce((s, o) => s + (o.status === "paid" ? o.amount : 0), 0);

  const tierOptions = Array.from(new Set(orders.map((o) => o.tier_label).filter(Boolean))).sort();

  const filtered = useMemo(() => {
    const q = filter.query.trim().toLowerCase();
    const from = filter.fromDate ? new Date(filter.fromDate + "T00:00:00").getTime() : null;
    const to = filter.toDate ? new Date(filter.toDate + "T23:59:59.999").getTime() : null;
    return orders.filter((o) => {
      if (filter.tier && o.tier_label !== filter.tier) return false;
      if (q && !`${o.full_name} ${o.whatsapp} ${o.email || ""} ${o.midtrans_order_id} ${o.cashback_code || ""}`.toLowerCase().includes(q)) return false;
      if (from || to) {
        const t = new Date(o.created_at).getTime();
        if (from && t < from) return false;
        if (to && t > to) return false;
      }
      return true;
    });
  }, [orders, filter]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="grid grid-cols-3 gap-3 flex-1">
          <SummaryCard icon={Users} label="Total Order" value={orders.length} color="blue" />
          <SummaryCard icon={ShoppingBag} label="Pending" value={pending} color="amber" />
          <SummaryCard icon={DollarSign} label="Pendapatan" value={rupiah(total)} color="emerald" />
        </div>
        <a
          href="/api/admin/orders/export"
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-all duration-200 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </a>
      </div>

      <FilterBar
        state={filter}
        onState={setFilter}
        tierOptions={tierOptions}
        placeholder="Cari nama / WA / email / ID…"
        accent="emerald"
      />

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      {filtered.length !== orders.length && (
        <div className="text-xs text-gray-500">
          Menampilkan <strong className="text-gray-700">{filtered.length}</strong> dari{" "}
          <strong className="text-gray-700">{orders.length}</strong> data pembelian.
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card-sm text-center py-12">
          <ShoppingBag className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {orders.length === 0 ? "Belum ada data pembelian." : "Tidak ada data yang cocok dengan filter."}
          </p>
        </div>
      ) : (
        filtered.map((o) => {
          const d = draftFor(o);
          const isSaving = saving === o.id;
          const dirty = isDirty(o);
          const isSaved = savedId === o.id;
          return (
            <div key={o.id} className="card-sm space-y-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                    {o.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{o.full_name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {o.whatsapp}{o.email ? ` · ${o.email}` : ""}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{rupiah(o.amount)}</div>
                  <div className="text-xs text-gray-500">{o.tier_label}</div>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                ID: {o.midtrans_order_id}
                {o.cashback_code ? <><span className="mx-1.5">·</span><span className="font-mono">{o.cashback_code}</span></> : ""}
                <span className="mx-1.5">·</span>
                {new Date(o.created_at).toLocaleString("id-ID")}
                {o.payment_type ? <><span className="mx-1.5">·</span>{o.payment_type}</> : ""}
              </div>

              <DeviceInfo ip={o.ip_address} browser={o.browser} os={o.os} deviceType={o.device_type} />

              <div className="grid sm:grid-cols-6 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Status</label>
                  <select
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    value={d.status}
                    onChange={(e) => setDraft(o.id, { status: e.target.value })}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Catatan</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 placeholder:text-gray-300"
                    value={d.admin_notes}
                    onChange={(e) => setDraft(o.id, { admin_notes: e.target.value })}
                    placeholder="Catatan"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Status Email</label>
                  <div className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm bg-gray-50 text-gray-500">
                    {o.email_status === "sent" ? "Terkirim" : o.email_status === "failed" ? "Gagal" : "—"}
                  </div>
                </div>
              </div>

              <div className={cn("p-3 rounded-xl border", d.status === "cancelled" || d.status === "failed" ? "bg-red-50/60 border-red-100" : "bg-gray-50 border-gray-100")}>
                <div className="grid sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Tipe Penolakan</label>
                    <select
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300"
                      value={d.rejection_type || "other"}
                      onChange={(e) => setDraft(o.id, { rejection_type: e.target.value })}
                    >
                      <option value="other">Lainnya (standar)</option>
                      <option value="insufficient">Jumlah pembayaran kurang (insufficient)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Dibayar Pelanggan (Rp)</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 placeholder:text-gray-300"
                      value={d.amount_paid_by_customer}
                      onChange={(e) => setDraft(o.id, { amount_paid_by_customer: e.target.value })}
                      placeholder="mis. 50000"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Sisa Kekurangan (Rp)</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 placeholder:text-gray-300"
                      value={d.amount_remaining}
                      onChange={(e) => setDraft(o.id, { amount_remaining: e.target.value })}
                      placeholder="mis. 10000"
                      inputMode="numeric"
                    />
                  </div>
                </div>
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  Alasan Penolakan (dikirim ke email pelanggan)
                </label>
                <textarea
                  className={cn(
                    "w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none placeholder:text-gray-300 min-h-[60px] bg-white",
                    d.status === "cancelled" || d.status === "failed"
                      ? "focus:ring-2 focus:ring-red-500/20 focus:border-red-300"
                      : "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  )}
                  value={d.rejection_reason}
                  onChange={(e) => setDraft(o.id, { rejection_reason: e.target.value })}
                  placeholder="Contoh: Jumlah pembayaran tidak sesuai. Pesanan tidak dapat diproses dan dana akan dikembalikan paling lambat 1x24 jam."
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Simpan dengan status <strong>Cancelled</strong> atau <strong>Failed</strong> + alasan → email penolakan otomatis terkirim ke pelanggan (sekali saja).
                  {d.rejection_type === "insufficient" ? (
                    <span className="text-blue-600 ml-1">
                      Tipe <strong>insufficient</strong> → pelanggan bisa memilih <em>Ajukan Refund</em> atau <em>Bayar Kekurangan</em> (pembayaran pelengkap) dari halaman status.
                    </span>
                  ) : (
                    ""
                  )}
                  {o.rejection_email_sent_at && (
                    <span className="text-emerald-600 ml-1">✓ Email penolakan terkirim {new Date(o.rejection_email_sent_at).toLocaleString("id-ID")}</span>
                  )}
                </p>
              </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <StatusBadge status={o.status} />
                  {dirty && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Perubahan belum disimpan
                    </span>
                  )}
                  {isSaved && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✓ Tersimpan
                    </span>
                  )}
                  {o.agree_snk && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✅ S&K
                    </span>
                  )}
                  {o.payment_proof_url && <ProofLink url={o.payment_proof_url} label="Bukti Bayar" />}
                  <Link
                    href={`/admin/invoice/order/${o.id}`}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all duration-200"
                  >
                    <FileText className="w-3 h-3" /> Invoice
                  </Link>
                </div>
                <button
                  onClick={() => save(o)}
                  disabled={isSaving || !dirty}
                  title={dirty ? "Simpan perubahan status/catatan" : "Tidak ada perubahan"}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <Save className="w-3 h-3" />
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function ClaimsTab() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  type ClaimDraft = { status: string; admin_notes: string };
  const [drafts, setDrafts] = useState<Record<string, Partial<ClaimDraft>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>({ query: "", fromDate: "", toDate: "", tier: "" });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/claims");
    const data = await res.json();
    setClaims(data.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function draftFor(c: Claim): ClaimDraft {
    return { status: c.status, admin_notes: c.admin_notes || "", ...drafts[c.id] };
  }

  function isDirty(c: Claim): boolean {
    const d = draftFor(c);
    return d.status !== c.status || d.admin_notes !== (c.admin_notes || "");
  }

  function setDraft(id: string, patch: Partial<ClaimDraft>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function save(c: Claim) {
    setSaving(c.id);
    setError(null);
    const d = draftFor(c);
    try {
      const res = await fetch("/api/admin/claims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, status: d.status, admin_notes: d.admin_notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan.");
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[c.id];
        return next;
      });
      await load();
      setSavedId(c.id);
      setTimeout(() => setSavedId(null), 2500);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan.");
    } finally {
      setSaving(null);
    }
  }

  const pending = claims.filter((c) => c.status === "pending").length;
  const total = claims.reduce((s, c) => s + (c.status === "paid" ? c.amount_paid : 0), 0);

  const tierOptions = Array.from(new Set(claims.map((c) => c.tier.replace("_", " ")).filter(Boolean))).sort();

  const filtered = useMemo(() => {
    const q = filter.query.trim().toLowerCase();
    const from = filter.fromDate ? new Date(filter.fromDate + "T00:00:00").getTime() : null;
    const to = filter.toDate ? new Date(filter.toDate + "T23:59:59.999").getTime() : null;
    return claims.filter((c) => {
      const readableTier = c.tier.replace("_", " ");
      if (filter.tier && readableTier !== filter.tier) return false;
      if (q && !`${c.full_name} ${c.whatsapp} ${c.email || ""} ${c.machine_id} ${c.license_key}`.toLowerCase().includes(q)) return false;
      if (from || to) {
        const t = new Date(c.created_at).getTime();
        if (from && t < from) return false;
        if (to && t > to) return false;
      }
      return true;
    });
  }, [claims, filter]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="grid grid-cols-3 gap-3 flex-1">
          <SummaryCard icon={Gift} label="Total Klaim" value={claims.length} color="purple" />
          <SummaryCard icon={ShoppingBag} label="Pending" value={pending} color="amber" />
          <SummaryCard icon={DollarSign} label="Tercairkan" value={rupiah(total)} color="emerald" />
        </div>
        <a
          href="/api/admin/claims/export"
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-all duration-200 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </a>
      </div>

      <FilterBar
        state={filter}
        onState={setFilter}
        tierOptions={tierOptions}
        placeholder="Cari nama / WA / email / key…"
        accent="violet"
      />

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      {filtered.length !== claims.length && (
        <div className="text-xs text-gray-500">
          Menampilkan <strong className="text-gray-700">{filtered.length}</strong> dari{" "}
          <strong className="text-gray-700">{claims.length}</strong> klaim cashback.
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card-sm text-center py-12">
          <Gift className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {claims.length === 0 ? "Belum ada klaim cashback." : "Tidak ada data yang cocok dengan filter."}
          </p>
        </div>
      ) : (
        filtered.map((c) => {
          const d = draftFor(c);
          const isSaving = saving === c.id;
          const dirty = isDirty(c);
          const isSaved = savedId === c.id;
          return (
            <div key={c.id} className="card-sm space-y-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-xs font-bold text-violet-500 shrink-0">
                    {c.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{c.full_name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {c.whatsapp}{c.email ? ` · ${c.email}` : ""}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{rupiah(c.amount_paid)}</div>
                  <div className="text-xs text-gray-500">{c.tier.replace("_", " ")}</div>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                {new Date(c.created_at).toLocaleString("id-ID")}
              </div>

              <DeviceInfo ip={c.ip_address} browser={c.browser} os={c.os} deviceType={c.device_type} />

              <div className="flex flex-wrap gap-2">
                {c.payment_proof_url && <ProofLink url={c.payment_proof_url} label="Bukti Bayar" />}
                {c.screenshot_follow_url && <ProofLink url={c.screenshot_follow_url} label="Bukti Follow/Subscribe" />}
                <LikeProofLinks value={c.screenshot_like_url} />
                {c.screenshot_share_url && <ProofLink url={c.screenshot_share_url} label="Bukti Share" />}
              </div>

              {c.notes && (
                <div className="text-xs text-gray-500 italic p-3 rounded-lg bg-gray-50">
                  "{c.notes}"
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Status</label>
                  <select
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                    value={d.status}
                    onChange={(e) => setDraft(c.id, { status: e.target.value })}
                  >
                    {CLAIM_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Catatan Admin</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 placeholder:text-gray-300"
                    value={d.admin_notes}
                    onChange={(e) => setDraft(c.id, { admin_notes: e.target.value })}
                    placeholder="Catatan"
                  />
                </div>
              </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  {dirty && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Perubahan belum disimpan
                    </span>
                  )}
                  {isSaved && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✓ Tersimpan
                    </span>
                  )}
                  {c.agree_snk && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✅ S&K
                    </span>
                  )}
                  <Link
                    href={`/admin/invoice/claim/${c.id}`}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-gray-500 hover:text-violet-600 hover:bg-violet-50 border border-transparent hover:border-violet-200 transition-all duration-200"
                  >
                    <FileText className="w-3 h-3" /> Invoice
                  </Link>
                </div>
                <button
                  onClick={() => save(c)}
                  disabled={isSaving || !dirty}
                  title={dirty ? "Simpan perubahan status/catatan" : "Tidak ada perubahan"}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <Save className="w-3 h-3" />
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

type RefundRequest = {
  id: string;
  created_at: string;
  full_name: string;
  email: string | null;
  whatsapp: string | null;
  tier_label: string | null;
  amount: number;
  status: string;
  admin_notes: string | null;
  processed_at: string | null;
  order_id: string | null;
  refund_proof_url: string;
  customer_proof_url: string;
};

function RefundsTab() {
  const [items, setItems] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/refunds");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat data refund.");
      setItems(data.data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data refund.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const pending = items.filter((r) => r.status === "pending");
  const processed = items.filter((r) => r.status === "processed");

  async function process(item: RefundRequest) {
    setSavingId(item.id);
    setError(null);
    const file = files[item.id];
    try {
      if (file && isHeicFile(file)) throw new Error(HEIC_ERROR);
      const fd = new FormData();
      fd.append("id", item.id);
      fd.append("admin_notes", notes[item.id] || "");
      if (file) fd.append("proofFile", file);
      const res = await fetch("/api/admin/refunds", { method: "POST", body: fd });
      const data = await parseJsonSafe<{ error?: string }>(res);
      if (!data.ok) throw new Error(data.error || "Gagal memproses refund.");
      setFiles((f) => ({ ...f, [item.id]: null }));
      setNotes((n) => { const next = { ...n }; delete next[item.id]; return next; });
      await load();
    } catch (err: any) {
      setError(err.message || "Gagal memproses refund.");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={RotateCcw} label="Menunggu Proses" value={pending.length} color="amber" />
        <SummaryCard icon={RotateCcw} label="Sudah Diproses" value={processed.length} color="emerald" />
        <SummaryCard icon={DollarSign} label="Total Dikembalikan" value={rupiah(processed.reduce((s, r) => s + r.amount, 0))} color="blue" />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>
      )}

      {items.length === 0 ? (
        <div className="card-sm text-center py-12">
          <RotateCcw className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Belum ada pengajuan refund.</p>
        </div>
      ) : (
        items.map((item) => {
          const isPending = item.status === "pending";
          const isSaving = savingId === item.id;
          return (
            <div key={item.id} className="card-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{item.full_name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.email || item.whatsapp || "—"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{rupiah(item.amount)}</div>
                  <div className="text-xs text-gray-500">{item.tier_label || "—"}</div>
                </div>
              </div>

              <div className="text-[11px] text-gray-400">
                Diajukan: {new Date(item.created_at).toLocaleString("id-ID")}
                {item.status === "processed" && item.processed_at && (
                  <> · Diproses: {new Date(item.processed_at).toLocaleString("id-ID")}</>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {item.customer_proof_url && (
                  <a href={item.customer_proof_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all duration-200">
                    <ExternalLink className="w-3 h-3" /> Bukti Bayar Pelanggan
                  </a>
                )}
                {item.refund_proof_url && (
                  <a href={item.refund_proof_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all duration-200">
                    <ExternalLink className="w-3 h-3" /> Bukti Transfer Refund
                  </a>
                )}
                <StatusBadge status={item.status === "processed" ? "paid" : "pending"} />
              </div>

              {isPending && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Catatan Admin (opsional)
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 placeholder:text-gray-300"
                      value={notes[item.id] || ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))}
                      placeholder="Contoh: Refund disimpan ke BCA xxxxxx atas nama pemesan"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Bukti Transfer Refund (wajib, JPEG/PNG/WebP ≤5MB) — dikirim sebagai lampiran email
                    </label>
                    <label className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/70 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors duration-200">
                      {files[item.id] ? (
                        <span className="text-sm font-medium text-emerald-700 break-all flex items-center gap-2">
                          <Paperclip className="w-4 h-4" /> {files[item.id]?.name}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                          <Upload className="w-4 h-4" /> Pilih bukti transfer
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => setFiles((f) => ({ ...f, [item.id]: e.target.files?.[0] || null }))}
                      />
                    </label>
                  </div>
                  <button
                    onClick={() => process(item)}
                    disabled={isSaving || !files[item.id]}
                    className="flex items-center justify-center gap-2 w-full text-xs font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg transition-all duration-200"
                  >
                    {isSaving ? <Power size={14} /> : <Save size={14} />}
                    {isSaving ? "Memproses…" : "Proses & Kirim Email Refund"}
                  </button>
                </>
              )}

              {item.admin_notes && (
                <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <strong>Catatan admin:</strong> {item.admin_notes}
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function SettingsTab() {
  type TierForm = { value: string; label: string; originalAmount: string; discountPercent: string };
  type SettingsForm = {
    promo_enabled: boolean;
    tiers: TierForm[];
    addon_prices: Record<string, string>;
    cashback_tiers: Record<string, string>;
    qris_enabled: boolean;
    qris_image_url: string;
    qris_instructions: string;
    qris_payment_notice: string;
  };

  const [form, setForm] = useState<SettingsForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  const [error, setError] = useState("");
  const [initialJson, setInitialJson] = useState("");
  const [qrisUploading, setQrisUploading] = useState(false);

  async function handleQrisUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setQrisUploading(true);
    setError("");
    try {
      if (isHeicFile(file)) throw new Error(HEIC_ERROR);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/qris-image", { method: "POST", body: fd });
      const data = await parseJsonSafe<{ error?: string; publicUrl?: string }>(res);
      if (!data.ok) throw new Error(data.error || "Gagal mengunggah.");
      setForm((f) => (f ? { ...f, qris_image_url: data.data.publicUrl || "" } : f));
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah gambar QRIS.");
    } finally {
      setQrisUploading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/settings?t=${Date.now()}`, { cache: "no-store" });
        const text = await res.text();
        const d = text ? JSON.parse(text) : {};
        if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
        const data = d.data;
        if (data && Array.isArray(data.tiers)) {
          const nextForm: SettingsForm = {
            promo_enabled: data.promo_enabled === true,
            tiers: data.tiers.map((t: any) => ({
              value: t.value,
              label: t.label,
              originalAmount: String(t.originalAmount ?? ""),
              discountPercent: String(t.discountPercent ?? ""),
            })),
            addon_prices: Object.fromEntries(
              Object.entries(data.addon_prices || {}).map(([k, v]) => [k, String(v)])
            ),
            cashback_tiers: Object.fromEntries(
              Object.entries(data.cashback_tiers || {}).map(([k, v]) => [k, String(v)])
            ),
            qris_enabled: data.qris_enabled === true,
            qris_image_url: data.qris_image_url || "",
            qris_instructions: data.qris_instructions || "",
            qris_payment_notice: data.qris_payment_notice || "",
          };
          setForm(nextForm);
          setInitialJson(JSON.stringify(nextForm));
          if (data.updated_at) setSavedAt(data.updated_at);
        }
      } catch (e: any) {
        setError(e.message || "Gagal memuat pengaturan.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function setTier(value: string, patch: Partial<TierForm>) {
    setForm((f) => (f ? { ...f, tiers: f.tiers.map((t) => (t.value === value ? { ...t, ...patch } : t)) } : f));
  }

  function computedPromo(originalAmount: number, discountPercent: number): number {
    const pct = Math.min(100, Math.max(0, discountPercent));
    const price = originalAmount * (1 - pct / 100);
    return Math.round(price);
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const tiers = form.tiers.map((t) => {
        const originalAmount = Number(t.originalAmount) || 0;
        const discountPercent = Number(t.discountPercent) || 0;
        return {
          value: t.value,
          label: t.label,
          amount: computedPromo(originalAmount, discountPercent),
          originalAmount,
          discountPercent,
        };
      });
      const cashback_tiers = Object.fromEntries(
        Object.entries(form.cashback_tiers).map(([k, v]) => [k, Number(v) || 0])
      );
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promo_enabled: form.promo_enabled,
          tiers,
          addon_prices: {},
          cashback_tiers,
          qris_enabled: form.qris_enabled,
          qris_image_url: form.qris_image_url,
          qris_instructions: form.qris_instructions,
          qris_payment_notice: form.qris_payment_notice,
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || `Gagal menyimpan. (HTTP ${res.status})`);
      setSaved(true);
      setSavedAt(new Date().toISOString());
      setInitialJson(JSON.stringify(form));
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSkeleton />;
  if (!form) {
    return (
      <div className="card-sm text-center py-12">
        <Settings className="w-8 h-8 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-400">Pengaturan tidak ditemukan. Jalankan schema terbaru di Supabase.</p>
      </div>
    );
  }

  const promoActive = form.promo_enabled;
  const dirty = initialJson ? JSON.stringify(form) !== initialJson : false;

  return (
    <div className="space-y-4">
      {dirty && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
          Ada perubahan yang belum disimpan — klik <strong>Simpan Pengaturan</strong> di bawah agar berlaku.
        </div>
      )}

      <div className={cn("card-sm space-y-4", promoActive ? "border-emerald-200" : "border-gray-200")}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Power className={cn("w-4 h-4", promoActive ? "text-emerald-600" : "text-gray-400")} />
              Promo / Diskon
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {promoActive
                ? "Promo AKTIF — harga promo ditampilkan & ditagih ke pelanggan."
                : "Promo NONAKTIF — harga normal (originalAmount) ditampilkan & ditagih."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => (f ? { ...f, promo_enabled: !f.promo_enabled } : f))}
            className={cn(
              "relative w-14 h-8 rounded-full transition-colors duration-300",
              promoActive ? "bg-emerald-500" : "bg-gray-300"
            )}
          >
            <span
              className={cn(
                "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
                promoActive ? "left-7" : "left-1"
              )}
            />
          </button>
        </div>
        <p className="text-[11px] text-gray-400 -mt-2">
          Toggle ini baru berlaku setelah menekan tombol <strong>Simpan Pengaturan</strong> di bawah.
        </p>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
            Pengaturan berhasil disimpan.
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className={cn("card-sm space-y-4", form.qris_enabled ? "border-blue-200" : "border-gray-200")}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <QrCode className={cn("w-4 h-4", form.qris_enabled ? "text-blue-600" : "text-gray-400")} />
              Pembayaran QRIS (Statis)
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {form.qris_enabled
                ? "QRIS AKTIF — checkout membuat pesanan 'menunggu bayar'. Setelah pelanggan bayar, ubah status order jadi 'Lunas' → email invoice & link unduhan otomatis terkirim."
                : "QRIS NONAKTIF — checkout langsung menandai pesanan lunas tanpa pembayaran (mode lama)."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => (f ? { ...f, qris_enabled: !f.qris_enabled } : f))}
            className={cn(
              "relative w-14 h-8 rounded-full transition-colors duration-300",
              form.qris_enabled ? "bg-blue-500" : "bg-gray-300"
            )}
          >
            <span
              className={cn(
                "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
                form.qris_enabled ? "left-7" : "left-1"
              )}
            />
          </button>
        </div>
        <p className="text-[11px] text-gray-400 -mt-2">
          Toggle ini baru berlaku setelah menekan tombol <strong>Simpan Pengaturan</strong> di bawah.
        </p>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">URL Gambar QRIS</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              value={form.qris_image_url}
              onChange={(e) => setForm((f) => (f ? { ...f, qris_image_url: e.target.value } : f))}
              placeholder="https://.../qris.png"
            />
            <label className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors duration-200">
              <Upload className="w-3.5 h-3.5" />
              {qrisUploading ? "Mengunggah…" : "Upload QRIS"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={qrisUploading}
                onChange={handleQrisUpload}
              />
            </label>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Upload gambar QRIS statis langsung dari sini, atau tempel URL dari hosting lain. Keduanya mengisi field yang satu ini — tidak konflik.
          </p>
        </div>

        {form.qris_image_url && (
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Pratinjau QRIS</label>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.qris_image_url} alt="Pratinjau QRIS" className="w-40 h-40 object-contain" />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Instruksi Pembayaran</label>
          <textarea
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-h-[120px]"
            value={form.qris_instructions}
            onChange={(e) => setForm((f) => (f ? { ...f, qris_instructions: e.target.value } : f))}
            placeholder={"1. Buka GoPay / e-wallet\n2. Scan QRIS\n3. Bayar"}
          />
          <p className="text-[11px] text-gray-400 mt-1">Satu langkah per baris.</p>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Pemberitahuan Nominal QRIS</label>
          <textarea
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-h-[100px]"
            value={form.qris_payment_notice}
            onChange={(e) => setForm((f) => (f ? { ...f, qris_payment_notice: e.target.value } : f))}
            placeholder="Harap isi jumlah pembayaran yang sesuai…"
          />
          <p className="text-[11px] text-gray-400 mt-1">Ditampilkan di modal QRIS & pada popup konfirmasi sebelum upload bukti bayar.</p>
        </div>
      </div>

      <div className="card-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Harga Paket</h3>
          <span className="text-[10px] text-gray-400">Harga promo otomatis mengikuti % Diskon · % Diskon = angka badge yang tampil</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left font-semibold text-gray-500 pb-2">Paket</th>
                <th className="text-right font-semibold text-gray-500 pb-2">Harga Normal</th>
                <th className="text-right font-semibold text-gray-500 pb-2">Harga Promo (otomatis)</th>
                <th className="text-right font-semibold text-gray-500 pb-2">% Diskon</th>
              </tr>
            </thead>
            <tbody>
              {form.tiers.map((t) => (
                <tr key={t.value} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-gray-900">{t.label}</td>
                  <td className="py-3">
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      value={t.originalAmount}
                      onChange={(e) => setTier(t.value, { originalAmount: e.target.value })}
                    />
                  </td>
                  <td className="py-3">
                    <div className="text-right font-semibold text-emerald-600 whitespace-nowrap">
                      {rupiah(computedPromo(Number(t.originalAmount) || 0, Number(t.discountPercent) || 0))}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        className="w-20 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                        value={t.discountPercent}
                        onChange={(e) => setTier(t.value, { discountPercent: e.target.value })}
                      />
                      <span className="text-gray-400 text-xs">%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-sm space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm">Cashback per Paket</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {form.tiers.map((t) => (
            <div key={t.value}>
              <label className="text-xs font-medium text-gray-500 block mb-1">{t.label}</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                value={form.cashback_tiers[t.value] ?? ""}
                onChange={(e) =>
                  setForm((f) =>
                    f ? { ...f, cashback_tiers: { ...f.cashback_tiers, [t.value]: e.target.value } } : f
                  )
                }
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-gray-400 space-y-0.5">
            <p>
              {savedAt
                ? `Terakhir disimpan: ${new Date(savedAt).toLocaleString("id-ID")}`
                : "Belum pernah disimpan."}
          </p>
          </div>
          <button
            onClick={save}
            disabled={saving || !dirty}
            title={dirty ? "Simpan semua perubahan di tab ini" : "Tidak ada perubahan"}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl transition-all duration-200"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: string | number;
  color: "blue" | "amber" | "emerald" | "purple";
}) {
  const colors: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100" },
    purple: { bg: "bg-violet-50", icon: "text-violet-600", border: "border-violet-100" },
  };
  const s = colors[color];

  return (
    <div className={cn("card-sm flex items-center gap-3", s.border)}>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
        <Icon className={cn("w-4 h-4", s.icon)} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-500 truncate">{label}</div>
        <div className="text-sm font-bold text-gray-900 truncate">{value}</div>
      </div>
    </div>
  );
}

function ProofLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all duration-200"
    >
      <ExternalLink className="w-3 h-3" />
      {label}
    </a>
  );
}

function LikeProofLinks({ value }: { value: string | null }) {
  if (!value) return null;
  let urls: string[] = [];
  try {
    const parsed = JSON.parse(value);
    urls = Array.isArray(parsed) ? parsed : [value];
  } catch {
    urls = [value];
  }
  if (urls.length === 0) return null;
  return (
    <>
      {urls.map((u, i) => (
        <ProofLink key={`${u}-${i}`} url={u} label={urls.length > 1 ? `Bukti Like & Comment #${i + 1}` : "Bukti Like & Comment"} />
      ))}
    </>
  );
}
