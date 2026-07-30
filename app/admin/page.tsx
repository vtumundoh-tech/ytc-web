"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  ref_id: string;
  license_key: string | null;
  admin_notes: string | null;
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
};

const ORDER_STATUSES = ["pending", "paid", "expired", "failed", "cancelled"];
const CLAIM_STATUSES = ["pending", "approved", "paid", "rejected"];

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function AdminPage() {
  const [tab, setTab] = useState<"orders" | "claims">("orders");
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin-logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-800">
          Keluar
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        <TabBtn active={tab === "orders"} onClick={() => setTab("orders")}>Pembelian</TabBtn>
        <TabBtn active={tab === "claims"} onClick={() => setTab("claims")}>Klaim Cashback</TabBtn>
      </div>

      {tab === "orders" ? <OrdersTab /> : <ClaimsTab />}
    </main>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium ${active ? "bg-gray-900 text-white" : "bg-white text-gray-600 border"}`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    approved: "bg-blue-100 text-blue-800",
    expired: "bg-gray-100 text-gray-600",
    failed: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-600",
  };
  return <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors[status] || "bg-gray-100"}`}>{status}</span>;
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  type OrderDraft = { status: string; license_key: string; admin_notes: string };
  const [drafts, setDrafts] = useState<Record<string, Partial<OrderDraft>>>({});

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function draftFor(o: Order): OrderDraft {
    return { status: o.status, license_key: o.license_key || "", admin_notes: o.admin_notes || "", ...drafts[o.id] };
  }

  function setDraft(id: string, patch: Partial<OrderDraft>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function save(o: Order) {
    const d = draftFor(o);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: o.id, status: d.status, license_key: d.license_key, admin_notes: d.admin_notes }),
    });
    load();
  }

  if (loading) return <p className="text-sm text-gray-500">Memuat...</p>;
  if (orders.length === 0) return <p className="text-sm text-gray-500">Belum ada data pembelian.</p>;

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const d = draftFor(o);
        return (
          <div key={o.id} className="bg-white rounded-xl border p-4">
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <div>
                <div className="font-semibold text-gray-900">{o.full_name}</div>
                <div className="text-xs text-gray-500">{o.whatsapp}{o.email ? ` · ${o.email}` : ""}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{rupiah(o.amount)}</div>
                <div className="text-xs text-gray-500">{o.tier_label}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mb-3">
              Ref ID: {o.ref_id} · {new Date(o.created_at).toLocaleString("id-ID")}
            </div>

            <div className="grid sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Status</label>
                <select
                  className="w-full border rounded-lg px-2 py-1.5 text-sm"
                  value={d.status}
                  onChange={(e) => setDraft(o.id, { status: e.target.value })}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Key Lisensi</label>
                <input
                  className="w-full border rounded-lg px-2 py-1.5 text-sm font-mono"
                  value={d.license_key}
                  onChange={(e) => setDraft(o.id, { license_key: e.target.value })}
                  placeholder="Isi setelah key dibuat"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Catatan Admin</label>
                <input
                  className="w-full border rounded-lg px-2 py-1.5 text-sm"
                  value={d.admin_notes}
                  onChange={(e) => setDraft(o.id, { admin_notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <StatusBadge status={o.status} />
              <button onClick={() => save(o)} className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg font-medium">
                Simpan
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ClaimsTab() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  type ClaimDraft = { status: string; admin_notes: string };
  const [drafts, setDrafts] = useState<Record<string, Partial<ClaimDraft>>>({});

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/claims");
    const data = await res.json();
    setClaims(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function draftFor(c: Claim): ClaimDraft {
    return { status: c.status, admin_notes: c.admin_notes || "", ...drafts[c.id] };
  }

  function setDraft(id: string, patch: Partial<ClaimDraft>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function save(c: Claim) {
    const d = draftFor(c);
    await fetch("/api/admin/claims", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, status: d.status, admin_notes: d.admin_notes }),
    });
    load();
  }

  if (loading) return <p className="text-sm text-gray-500">Memuat...</p>;
  if (claims.length === 0) return <p className="text-sm text-gray-500">Belum ada klaim cashback.</p>;

  return (
    <div className="space-y-3">
      {claims.map((c) => {
        const d = draftFor(c);
        return (
          <div key={c.id} className="bg-white rounded-xl border p-4">
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <div>
                <div className="font-semibold text-gray-900">{c.full_name}</div>
                <div className="text-xs text-gray-500">{c.whatsapp} · Machine ID: {c.machine_id}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{rupiah(c.amount_paid)}</div>
                <div className="text-xs text-gray-500">Key: {c.license_key}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mb-3">{new Date(c.created_at).toLocaleString("id-ID")}</div>

            <div className="flex gap-2 mb-3">
              <a href={c.screenshot_follow_url} target="_blank" className="text-xs underline text-blue-600">Bukti Follow</a>
              <a href={c.screenshot_like_url} target="_blank" className="text-xs underline text-blue-600">Bukti Like</a>
              <a href={c.screenshot_share_url} target="_blank" className="text-xs underline text-blue-600">Bukti Share</a>
            </div>

            {c.notes && <div className="text-xs text-gray-500 mb-3 italic">Catatan user: {c.notes}</div>}

            <div className="grid sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Status</label>
                <select
                  className="w-full border rounded-lg px-2 py-1.5 text-sm"
                  value={d.status}
                  onChange={(e) => setDraft(c.id, { status: e.target.value })}
                >
                  {CLAIM_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Catatan Admin</label>
                <input
                  className="w-full border rounded-lg px-2 py-1.5 text-sm"
                  value={d.admin_notes}
                  onChange={(e) => setDraft(c.id, { admin_notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <StatusBadge status={c.status} />
              <button onClick={() => save(c)} className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg font-medium">
                Simpan
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
