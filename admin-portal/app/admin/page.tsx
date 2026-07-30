"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShoppingBag, Gift, Users, DollarSign, ExternalLink, Save } from "lucide-react";

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
  license_key: string | null;
  admin_notes: string | null;
  agree_snk: boolean;
};

type Claim = {
  id: string;
  created_at: string;
  full_name: string;
  whatsapp: string;
  machine_id: string;
  license_key: string;
  tier: string;
  amount_paid: number;
  screenshot_follow_url: string;
  screenshot_like_url: string;
  screenshot_share_url: string;
  notes: string | null;
  status: string;
  admin_notes: string | null;
  agree_snk: boolean;
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

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminPage() {
  const [tab, setTab] = useState<"orders" | "claims">("orders");
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
      </div>

      <div className="animate-slide-up" key={tab}>
        {tab === "orders" ? <OrdersTab /> : <ClaimsTab />}
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

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  type OrderDraft = { status: string; license_key: string; admin_notes: string };
  const [drafts, setDrafts] = useState<Record<string, Partial<OrderDraft>>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function draftFor(o: Order): OrderDraft {
    return { status: o.status, license_key: o.license_key || "", admin_notes: o.admin_notes || "", ...drafts[o.id] };
  }

  function setDraft(id: string, patch: Partial<OrderDraft>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function save(o: Order) {
    setSaving(o.id);
    const d = draftFor(o);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: o.id, status: d.status, license_key: d.license_key, admin_notes: d.admin_notes }),
    });
    setSaving(null);
    load();
  }

  const paid = orders.filter((o) => o.status === "paid").length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const total = orders.reduce((s, o) => s + (o.status === "paid" ? o.amount : 0), 0);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={Users} label="Total Order" value={orders.length} color="blue" />
        <SummaryCard icon={ShoppingBag} label="Pending" value={pending} color="amber" />
        <SummaryCard icon={DollarSign} label="Pendapatan" value={rupiah(total)} color="emerald" />
      </div>

      {orders.length === 0 ? (
        <div className="card-sm text-center py-12">
          <ShoppingBag className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Belum ada data pembelian.</p>
        </div>
      ) : (
        orders.map((o) => {
          const d = draftFor(o);
          const isSaving = saving === o.id;
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
                <span className="mx-1.5">·</span>
                {new Date(o.created_at).toLocaleString("id-ID")}
                {o.payment_type ? <><span className="mx-1.5">·</span>{o.payment_type}</> : ""}
              </div>

              <div className="grid sm:grid-cols-4 gap-3 items-end">
                <div>
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
                  <label className="text-xs font-medium text-gray-500 block mb-1">Key Lisensi</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 placeholder:text-gray-300"
                    value={d.license_key}
                    onChange={(e) => setDraft(o.id, { license_key: e.target.value })}
                    placeholder="Isi setelah key dibuat"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Catatan</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 placeholder:text-gray-300"
                    value={d.admin_notes}
                    onChange={(e) => setDraft(o.id, { admin_notes: e.target.value })}
                    placeholder="Catatan"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <StatusBadge status={o.status} />
                  {o.agree_snk && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✅ S&K
                    </span>
                  )}
                </div>
                <button
                  onClick={() => save(o)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white px-4 py-2 rounded-lg transition-all duration-200"
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

  function setDraft(id: string, patch: Partial<ClaimDraft>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function save(c: Claim) {
    setSaving(c.id);
    const d = draftFor(c);
    await fetch("/api/admin/claims", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, status: d.status, admin_notes: d.admin_notes }),
    });
    setSaving(null);
    load();
  }

  const pending = claims.filter((c) => c.status === "pending").length;
  const total = claims.reduce((s, c) => s + (c.status === "paid" ? c.amount_paid : 0), 0);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={Gift} label="Total Klaim" value={claims.length} color="purple" />
        <SummaryCard icon={ShoppingBag} label="Pending" value={pending} color="amber" />
        <SummaryCard icon={DollarSign} label="Tercairkan" value={rupiah(total)} color="emerald" />
      </div>

      {claims.length === 0 ? (
        <div className="card-sm text-center py-12">
          <Gift className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Belum ada klaim cashback.</p>
        </div>
      ) : (
        claims.map((c) => {
          const d = draftFor(c);
          const isSaving = saving === c.id;
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
                      {c.whatsapp} · Machine ID: {c.machine_id}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{rupiah(c.amount_paid)}</div>
                  <div className="text-xs text-gray-500">Key: {c.license_key}</div>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                {new Date(c.created_at).toLocaleString("id-ID")}
              </div>

              <div className="flex flex-wrap gap-2">
                <ProofLink url={c.screenshot_follow_url} label="Bukti Follow" />
                <ProofLink url={c.screenshot_like_url} label="Bukti Like" />
                <ProofLink url={c.screenshot_share_url} label="Bukti Share" />
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
                  {c.agree_snk && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✅ S&K
                    </span>
                  )}
                </div>
                <button
                  onClick={() => save(c)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white px-4 py-2 rounded-lg transition-all duration-200"
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
