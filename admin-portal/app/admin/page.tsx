"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ShoppingBag, Gift, Users, DollarSign, ExternalLink, Save, Download, FileText, Settings, Power } from "lucide-react";

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
  const [tab, setTab] = useState<"orders" | "claims" | "settings">("orders");
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
        <TabBtn active={tab === "settings"} onClick={() => setTab("settings")}>
          <Settings className="w-3.5 h-3.5" /> Pengaturan
        </TabBtn>
      </div>

      <div className="animate-slide-up" key={tab}>
        {tab === "orders" ? <OrdersTab /> : tab === "claims" ? <ClaimsTab /> : <SettingsTab />}
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
                  <Link
                    href={`/admin/invoice/order/${o.id}`}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all duration-200"
                  >
                    <FileText className="w-3 h-3" /> Invoice
                  </Link>
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
                  <Link
                    href={`/admin/invoice/claim/${c.id}`}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-gray-500 hover:text-violet-600 hover:bg-violet-50 border border-transparent hover:border-violet-200 transition-all duration-200"
                  >
                    <FileText className="w-3 h-3" /> Invoice
                  </Link>
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

function SettingsTab() {
  type TierForm = { value: string; label: string; originalAmount: string; discountPercent: string };
  type SettingsForm = {
    promo_enabled: boolean;
    tiers: TierForm[];
    addon_prices: Record<string, string>;
    cashback_tiers: Record<string, string>;
  };

  const [form, setForm] = useState<SettingsForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  const [connHost, setConnHost] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/settings?t=${Date.now()}`, { cache: "no-store" });
        const text = await res.text();
        const d = text ? JSON.parse(text) : {};
        if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
        const data = d.data;
        if (data && Array.isArray(data.tiers)) {
          setForm({
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
          });
          if (data.updated_at) setSavedAt(data.updated_at);
        }
        if (d.meta?.supabaseUrl) {
          try {
            setConnHost(new URL(d.meta.supabaseUrl).hostname);
          } catch {
            setConnHost(d.meta.supabaseUrl);
          }
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

  function setAddon(value: string, val: string) {
    setForm((f) => (f ? { ...f, addon_prices: { ...f.addon_prices, [value]: val } } : f));
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
      const addon_prices = Object.fromEntries(
        Object.entries(form.addon_prices).map(([k, v]) => [k, Number(v) || 0])
      );
      const cashback_tiers = Object.fromEntries(
        Object.entries(form.cashback_tiers).map(([k, v]) => [k, Number(v) || 0])
      );
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promo_enabled: form.promo_enabled, tiers, addon_prices, cashback_tiers }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || `Gagal menyimpan. (HTTP ${res.status})`);
      setSaved(true);
      setSavedAt(new Date().toISOString());
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

  return (
    <div className="space-y-4">
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
        <h3 className="font-semibold text-gray-900 text-sm">Harga Addon 1080p</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {form.tiers.map((t) => (
            <div key={t.value}>
              <label className="text-xs font-medium text-gray-500 block mb-1">{t.label}</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  value={form.addon_prices[t.value] ?? ""}
                  onChange={(e) => setAddon(t.value, e.target.value)}
                />
              </div>
            </div>
          ))}
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
            {connHost && (
              <p className="text-gray-400">
                Terkoneksi ke: <span className="font-medium text-gray-600">{connHost}</span>
              </p>
            )}
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl transition-all duration-200"
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
