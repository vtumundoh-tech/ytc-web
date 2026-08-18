import { supabaseServer } from "@/lib/supabaseServer";
import { getSettings } from "@/lib/settings";

const BOT_API = "https://api.telegram.org";

function rupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtShortDate(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function daysSince(iso?: string | null): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function isConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum diset, notifikasi dilewati.");
    return false;
  }
  try {
    const res = await fetch(`${BOT_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn("[telegram] sendMessage gagal:", res.status, body.slice(0, 300));
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn("[telegram] sendMessage error:", err?.message || err);
    return false;
  }
}

export type OrderNotifData = {
  full_name: string;
  whatsapp?: string | null;
  email?: string | null;
  tier_label: string;
  amount: number;
  midtrans_order_id: string;
  paid_at?: string | null;
  pending?: boolean;
};

export async function notifyNewOrder(order: OrderNotifData): Promise<boolean> {
  if (!isConfigured()) return false;
  const pending = order.pending === true;
  const lines = [
    pending
      ? "🛒 <b>PESANAN BARU — MENUNGGU PEMBAYARAN QRIS</b> · #PesananBaru"
      : "🛒 <b>PESANAN BARU</b> · #PesananBaru",
    "",
    `👤 Nama    : <b>${escapeHtml(order.full_name)}</b>`,
    `📱 WA      : ${order.whatsapp ? escapeHtml(order.whatsapp) : "-"}`,
    `📧 Email   : ${order.email ? escapeHtml(order.email) : "-"}`,
    `📦 Paket   : ${escapeHtml(order.tier_label)}`,
    `💰 Total   : ${rupiah(order.amount)}`,
    `🆔 ID      : <code>${order.midtrans_order_id}</code>`,
    `🕐 Waktu   : ${pending ? fmtDate(new Date().toISOString()) : fmtDate(order.paid_at)}`,
  ];
  if (pending) {
    lines.push(
      "",
      "⏳ <i>Segera verifikasi pembayaran di GoPay merchant, lalu ubah status order menjadi \"Lunas\" di panel admin — email invoice & unduhan otomatis terkirim.</i>"
    );
  }
  return sendTelegramMessage(lines.join("\n"));
}

export type PaymentClaimedData = {
  full_name: string;
  tier_label: string;
  amount: number;
  midtrans_order_id: string;
};

export async function notifyPaymentClaimed(data: PaymentClaimedData): Promise<boolean> {
  if (!isConfigured()) return false;
  const lines = [
    "🙏 <b>PELANGGAN MENGONFIRMASI SUDAH BAYAR</b> · #ButuhVerifikasi",
    "",
    `👤 Nama    : <b>${escapeHtml(data.full_name)}</b>`,
    `📦 Paket   : ${escapeHtml(data.tier_label)}`,
    `💰 Nominal : ${rupiah(data.amount)}`,
    `🆔 Order   : <code>${data.midtrans_order_id}</code>`,
    "",
    "⚠️ <i>Cek pembayaran QRIS & bukti bayar di panel admin, lalu ubah status order menjadi \"Lunas\" — email invoice & unduhan otomatis terkirim.</i>",
  ];
  return sendTelegramMessage(lines.join("\n"));
}

export type RefundRequestNotifData = {
  full_name: string;
  whatsapp?: string | null;
  email?: string | null;
  tier_label: string;
  amount: number;
  paid_at?: string | null;
};

export async function notifyRefundRequest(data: RefundRequestNotifData): Promise<boolean> {
  if (!isConfigured()) return false;
  const lines = [
    "💸 <b>PERMINTAAN REFUND BARU</b> · #RefundBaru",
    "",
    `👤 Nama    : <b>${escapeHtml(data.full_name)}</b>`,
    `📱 WA      : ${data.whatsapp ? escapeHtml(data.whatsapp) : "-"}`,
    `📧 Email   : ${data.email ? escapeHtml(data.email) : "-"}`,
    `📦 Paket   : ${escapeHtml(data.tier_label)}`,
    `💰 Refund  : ${rupiah(data.amount)}`,
    `🕐 Waktu   : ${fmtDate(new Date().toISOString())}`,
    "",
    "⚠️ <i>Tinjau di panel admin (tab Refund), lalu upload bukti transfer refund & submit — email dengan lampiran bukti otomatis terkirim ke pelanggan.</i>",
  ];
  return sendTelegramMessage(lines.join("\n"));
}

export type ClaimNotifData = {
  full_name: string;
  whatsapp?: string | null;
  email?: string | null;
  tier: string;
  amount_paid: number;
  id: string;
  created_at?: string | null;
};

export async function notifyNewClaim(claim: ClaimNotifData): Promise<boolean> {
  if (!isConfigured()) return false;
  const submit = fmtShortDate(claim.created_at);
  const dueFrom = new Date(claim.created_at || Date.now());
  const dueTo = new Date(dueFrom);
  dueFrom.setDate(dueFrom.getDate() + 5);
  dueTo.setDate(dueTo.getDate() + 7);
  const pad = (x: number) => String(x).padStart(2, "0");
  const range = `${pad(dueFrom.getDate())}/${pad(dueFrom.getMonth() + 1)}/${dueFrom.getFullYear()} – ${pad(dueTo.getDate())}/${pad(dueTo.getMonth() + 1)}/${dueTo.getFullYear()}`;

  const lines = [
    "🎁 <b>KLAIM CASHBACK BARU</b> · #KlaimBaru",
    "",
    `👤 Nama    : <b>${escapeHtml(claim.full_name)}</b>`,
    `📱 WA      : ${claim.whatsapp ? escapeHtml(claim.whatsapp) : "-"}`,
    `📧 Email   : ${claim.email ? escapeHtml(claim.email) : "-"}`,
    `📦 Paket   : ${escapeHtml(claim.tier)}`,
    `💰 Bayar   : ${rupiah(claim.amount_paid)}`,
    `🆔 ID      : <code>${claim.id}</code>`,
    `🕐 Submit  : ${submit}`,
    `⏰ Cairkan : ${range} (5–7 hari setelah submit)`,
  ];
  return sendTelegramMessage(lines.join("\n"));
}

const CLAIM_STATUS_LABEL: Record<string, string> = {
  pending: "🕐 Menunggu",
  approved: "⏳ Disetujui",
  paid: "✅ Dibayar",
  rejected: "❌ Ditolak",
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "🕐 Menunggu",
  paid: "✅ Lunas",
  expired: "⏰ Kedaluwarsa",
  failed: "❌ Gagal",
  cancelled: "🚫 Dibatalkan",
};

const MAX_LIST = 30;

export async function handleTelegramCommand(text: string, chatId: string | number): Promise<string | null> {
  if (!isConfigured()) return null;
  const adminChat = String(process.env.TELEGRAM_CHAT_ID);
  if (String(chatId) !== adminChat) return null;

  const cmd = text.trim().split(/\s+/)[0].toLowerCase();

  if (cmd === "/help") {
    return [
      "<b>Perintah bot:</b>",
      "",
      "/listcb — daftar semua klaim cashback + status",
      "/listo — daftar semua pembelian + status",
    ].join("\n");
  }

  if (cmd === "/listcb") {
    return buildClaimList();
  }

  if (cmd === "/listo" || cmd === "/listorder") {
    return buildOrderList();
  }

  return null;
}

async function buildClaimList(): Promise<string> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("cashback_claims")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return `Gagal memuat data cashback: ${error.message}`;

  const claims = (data || []) as any[];
  const paid = claims.filter((c) => c.status === "paid").length;
  const approved = claims.filter((c) => c.status === "approved").length;
  const pending = claims.filter((c) => c.status === "pending").length;
  const rejected = claims.filter((c) => c.status === "rejected").length;

  const settings = await getSettings().catch(() => null);

  const lines: string[] = [
    "📊 <b>CASHBACK — RINGKASAN</b>",
    `Total   : ${claims.length}`,
    `Dibayar : ${paid}`,
    `Disetujui : ${approved}`,
    `Menunggu : ${pending}`,
    `Ditolak : ${rejected}`,
    "",
    "<b>Daftar:</b>",
  ];

  claims.slice(0, MAX_LIST).forEach((c: any, i: number) => {
    const cb = settings ? (settings.cashbackTiers[c.tier] || 0) : 0;
    const day = daysSince(c.created_at);
    const label = CLAIM_STATUS_LABEL[c.status] || c.status;
    const submit = fmtShortDate(c.created_at);
    const dayPart = day !== null ? `, hari ke-${day + 1}` : "";
    lines.push(`${i + 1}. <b>${escapeHtml(c.full_name)}</b> · ${escapeHtml(c.tier)} · ${rupiah(cb)} · ${label} (submit ${submit}${dayPart})`);
  });

  const rest = claims.length - MAX_LIST;
  if (rest > 0) lines.push(`…dan ${rest} lagi`);

  return lines.join("\n");
}

async function buildOrderList(): Promise<string> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return `Gagal memuat data pembelian: ${error.message}`;

  const orders = (data || []) as any[];
  const paid = orders.filter((o) => o.status === "paid").length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const failed = orders.filter((o) => o.status === "failed" || o.status === "cancelled" || o.status === "expired").length;

  const lines: string[] = [
    "📦 <b>PESANAN — RINGKASAN</b>",
    `Total   : ${orders.length}`,
    `Lunas   : ${paid}`,
    `Menunggu : ${pending}`,
    `Batal/Gagal/Kedaluwarsa : ${failed}`,
    "",
    "<b>Daftar:</b>",
  ];

  orders.slice(0, MAX_LIST).forEach((o: any, i: number) => {
    const label = ORDER_STATUS_LABEL[o.status] || o.status;
    const date = fmtShortDate(o.created_at);
    lines.push(`${i + 1}. <b>${escapeHtml(o.full_name)}</b> · ${escapeHtml(o.tier_label)} · ${rupiah(o.amount)} · ${label} (${date})`);
  });

  const rest = orders.length - MAX_LIST;
  if (rest > 0) lines.push(`…dan ${rest} lagi`);

  return lines.join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
