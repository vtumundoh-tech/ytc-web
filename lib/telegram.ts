import { supabaseServer } from "@/lib/supabaseServer";
import { getSettings } from "@/lib/settings";

const BOT_API = "https://api.telegram.org";

type InlineKeyboardBtn = { text: string; callback_data: string };
export type TelegramReply = { text: string; replyMarkup?: { inline_keyboard: InlineKeyboardBtn[][] } };

async function callTelegram(method: string, payload: Record<string, unknown>): Promise<any> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`${BOT_API}/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`[telegram] ${method} gagal:`, res.status, body.slice(0, 300));
      return null;
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`[telegram] ${method} error:`, err?.message || err);
    return null;
  }
}

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

export async function sendTelegramMessage(text: string, replyMarkup?: TelegramReply["replyMarkup"]): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum diset, notifikasi dilewati.");
    return false;
  }
  await callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
  return true;
}

export async function editTelegramMessage(
  chatId: string,
  messageId: number,
  text: string,
  replyMarkup?: TelegramReply["replyMarkup"]
): Promise<boolean> {
  await callTelegram("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
  return true;
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  await callTelegram("answerCallbackQuery", { callback_query_id: callbackQueryId, ...(text ? { text } : {}) });
}

export function isAdminChatId(chatId: string | number): boolean {
  return isConfigured() && String(chatId) === String(process.env.TELEGRAM_CHAT_ID);
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

export async function handleTelegramCommand(text: string, chatId: string | number): Promise<TelegramReply | null> {
  if (!isConfigured()) return null;
  const adminChat = String(process.env.TELEGRAM_CHAT_ID);
  if (String(chatId) !== adminChat) return null;

  const cmd = text.trim().split(/\s+/)[0].toLowerCase();

  if (cmd === "/help") {
    return {
      text: "<b>Perintah bot:</b>\n\n/status — Dashboard interaktif (pembelian, klaim, refund)\n/listcb — daftar klaim cashback + status\n/listo — daftar pembelian + status",
    };
  }

  if (cmd === "/status" || cmd === "/dashboard") {
    return buildDashboardReply();
  }

  if (cmd === "/listcb") {
    return { text: await buildClaimList() };
  }

  if (cmd === "/listo" || cmd === "/listorder") {
    return { text: await buildOrderList() };
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

const PAGE_SIZE = 6;

const REFUND_STATUS_LABEL: Record<string, string> = {
  pending: "🕐 Menunggu",
  processed: "✅ Diproses",
  cancelled: "🚫 Dibatalkan",
};

const ORDER_FILTERS: Array<[string, string]> = [
  ["all", "Semua"],
  ["paid", "Lunas"],
  ["pending", "Menunggu"],
  ["bad", "Gagal/Batal"],
];

const CLAIM_FILTERS: Array<[string, string]> = [
  ["all", "Semua"],
  ["pending", "Menunggu"],
  ["approved", "Disetujui"],
  ["paid", "Dibayar"],
  ["rejected", "Ditolak"],
];

const REFUND_FILTERS: Array<[string, string]> = [
  ["all", "Semua"],
  ["pending", "Menunggu"],
  ["processed", "Diproses"],
];

export function btn(text: string, callback_data: string): InlineKeyboardBtn {
  return { text, callback_data };
}

export async function buildDashboardReply(): Promise<TelegramReply> {
  const supabase = supabaseServer();
  const settled = await Promise.allSettled([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("cashback_claims").select("id", { count: "exact", head: true }),
    supabase.from("refund_requests").select("id", { count: "exact", head: true }),
  ]);
  const n = (i: number): number => (settled[i].status === "fulfilled" ? (settled[i] as any).value.count ?? 0 : 0);
  return {
    text: "📊 <b>DASHBOARD — MineClip Studios</b>\n\nPilih kategori untuk lihat daftar & status terkini.\n\n<i>Perintah lain: /listcb, /listo, /help</i>",
    replyMarkup: {
      inline_keyboard: [
        [btn(`📦 Pembelian (${n(0)})`, "cat:orders:all:1")],
        [btn(`🎁 Klaim Cashback (${n(1)})`, "cat:claims:all:1")],
        [btn(`💸 Refund (${n(2)})`, "cat:refunds:all:1")],
      ],
    },
  };
}

async function buildCategoryReply(type: string, filter: string, page: number): Promise<TelegramReply> {
  const supabase = supabaseServer();
  if (type === "orders") {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) return { text: `Gagal memuat pembelian: ${error.message}` };
    const rows = ((data || []) as any[]).filter((o) => {
      if (filter === "all") return true;
      if (filter === "paid") return o.status === "paid";
      if (filter === "pending") return o.status === "pending";
      return ["failed", "cancelled", "expired"].includes(o.status);
    });
    return buildListReply("orders", filter, page, rows, (o) => ({
      id: o.id,
      name: o.full_name,
      sub: `${o.tier_label} · ${rupiah(o.amount)}`,
      statusLabel: ORDER_STATUS_LABEL[o.status] || o.status,
    }));
  }

  if (type === "claims") {
    const { data, error } = await supabase.from("cashback_claims").select("*").order("created_at", { ascending: false });
    if (error) return { text: `Gagal memuat klaim: ${error.message}` };
    const rows = ((data || []) as any[]).filter((c) => filter === "all" || c.status === filter);
    return buildListReply("claims", filter, page, rows, (c) => ({
      id: c.id,
      name: c.full_name,
      sub: `${c.tier} · ${rupiah(c.amount_paid)}`,
      statusLabel: CLAIM_STATUS_LABEL[c.status] || c.status,
    }));
  }

  if (type === "refunds") {
    const { data, error } = await supabase.from("refund_requests").select("*").order("created_at", { ascending: false });
    if (error) return { text: `Gagal memuat refund: ${error.message}` };
    const rows = ((data || []) as any[]).filter((r) => filter === "all" || r.status === filter);
    return buildListReply("refunds", filter, page, rows, (r) => ({
      id: r.id,
      name: r.full_name,
      sub: `${r.tier_label || "-"} · ${rupiah(r.amount || 0)}`,
      statusLabel: REFUND_STATUS_LABEL[r.status] || r.status,
    }));
  }

  return { text: "Kategori tidak dikenal." };
}

function buildListReply(
  type: string,
  filter: string,
  page: number,
  rows: any[],
  row: (item: any) => { id: string; name: string; sub: string; statusLabel: string }
): TelegramReply {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const p = Math.min(Math.max(1, page), totalPages);
  const slice = rows.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);

  const headerMap: Record<string, string> = {
    orders: `📦 <b>DAFTAR PEMBELIAN</b> (${total})`,
    claims: `🎁 <b>DAFTAR KLAIM CASHBACK</b> (${total})`,
    refunds: `💸 <b>DAFTAR REFUND</b> (${total})`,
  };
  const lines: string[] = [headerMap[type] || headerMap.orders, ""];

  if (slice.length === 0) {
    lines.push("<i>Tidak ada data untuk filter ini.</i>");
  } else {
    slice.forEach((item, i) => {
      const r = row(item);
      lines.push(`${(p - 1) * PAGE_SIZE + i + 1}. <b>${escapeHtml(r.name)}</b>\n   ${escapeHtml(r.sub)} · ${r.statusLabel}`);
    });
  }

  const keyboard: InlineKeyboardBtn[][] = [];
  slice.forEach((item) => {
    const r = row(item);
    keyboard.push([btn(`#${(p - 1) * PAGE_SIZE + keyboard.length + 1} ${r.name}`, `det:${type}:${item.id}:${filter}:${p}`)]);
  });

  const nav: InlineKeyboardBtn[] = [];
  if (p > 1) nav.push(btn("‹ Hal Sebelumnya", `lst:${type}:${filter}:${p - 1}`));
  nav.push(btn(`Hal ${p}/${totalPages}`, "menu"));
  if (p < totalPages) nav.push(btn("Hal Berikutnya ›", `lst:${type}:${filter}:${p + 1}`));
  if (nav.length) keyboard.push(nav);

  keyboard.push([
    btn("📦 Pembelian", `cat:orders:all:1`),
    btn("🎁 Klaim", `cat:claims:all:1`),
    btn("💸 Refund", `cat:refunds:all:1`),
    btn("🏠 Menu", "menu"),
  ]);

  return { text: lines.join("\n"), replyMarkup: { inline_keyboard: keyboard } };
}

async function buildDetailReply(type: string, id: string, filter: string, page: number): Promise<TelegramReply> {
  const supabase = supabaseServer();
  const back = [{ text: "↩️ Kembali", callback_data: `lst:${type}:${filter}:${page}` }, { text: "🏠 Menu", callback_data: "menu" }];

  if (type === "orders") {
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
    if (error || !data) return { text: `<b>Pembelian tidak ditemukan</b> (${error?.message || "?"}).`, replyMarkup: { inline_keyboard: [back] } };
    const o = data as any;
    const lines: string[] = [
      "📦 <b>DETAIL PEMBELIAN</b>",
      `🆔 ID      : <code>${o.midtrans_order_id || o.id}</code>`,
      `👤 Nama    : <b>${escapeHtml(o.full_name || "-")}</b>`,
      `📱 WA      : ${o.whatsapp ? escapeHtml(o.whatsapp) : "-"}`,
      `📧 Email   : ${o.email ? escapeHtml(o.email) : "-"}`,
      `📦 Paket   : ${escapeHtml(o.tier_label || o.tier || "-")}`,
      `💰 Total   : ${rupiah(o.amount || 0)}`,
      `🕐 Waktu   : ${fmtDate(o.created_at)}`,
      `Status    : ${ORDER_STATUS_LABEL[o.status] || o.status}`,
    ];
    if (o.customer_claimed_pay_at) lines.push(`🕐 Klaim bayar: ${fmtDate(o.customer_claimed_pay_at)}`);
    if (o.paid_at) lines.push(`✅ Dibayar : ${fmtDate(o.paid_at)}`);
    if (o.amount_paid_by_customer != null) lines.push(`💵 Dibayar by cust: ${rupiah(o.amount_paid_by_customer)}`);
    if (o.amount_remaining != null && o.amount_remaining > 0) lines.push(`⏳ Kurang : ${rupiah(o.amount_remaining)}`);
    if (o.rejection_type) lines.push(`🚫 Alasan: ${escapeHtml(String(o.rejection_type))}`);
    if (o.supplement_for) lines.push(`🔗 Melengkapi order: <code>${o.supplement_for}</code>`);
    if (o.admin_notes) lines.push(`📝 Catatan: ${escapeHtml(o.admin_notes)}`);
    return { text: lines.join("\n"), replyMarkup: { inline_keyboard: [back] } };
  }

  if (type === "claims") {
    const { data, error } = await supabase.from("cashback_claims").select("*").eq("id", id).maybeSingle();
    if (error || !data) return { text: `<b>Klaim tidak ditemukan</b> (${error?.message || "?"}).`, replyMarkup: { inline_keyboard: [back] } };
    const c = data as any;
    const lines: string[] = [
      "🎁 <b>DETAIL KLAIM CASHBACK</b>",
      `🆔 ID      : <code>${c.id}</code>`,
      `👤 Nama    : <b>${escapeHtml(c.full_name || "-")}</b>`,
      `📱 WA      : ${c.whatsapp ? escapeHtml(c.whatsapp) : "-"}`,
      `📦 Paket   : ${escapeHtml(c.tier || "-")}`,
      `💰 Dibayar : ${rupiah(c.amount_paid || 0)}`,
      `🕐 Waktu   : ${fmtShortDate(c.created_at)}`,
      `Status    : ${CLAIM_STATUS_LABEL[c.status] || c.status}`,
    ];
    if (c.paid_at) lines.push(`✅ Dibayar : ${fmtDate(c.paid_at)}`);
    if (c.notes) lines.push(`📝 Catatan : ${escapeHtml(c.notes)}`);
    if (c.admin_notes) lines.push(`🛠 Admin    : ${escapeHtml(c.admin_notes)}`);
    return { text: lines.join("\n"), replyMarkup: { inline_keyboard: [back] } };
  }

  if (type === "refunds") {
    const { data, error } = await supabase.from("refund_requests").select("*").eq("id", id).maybeSingle();
    if (error || !data) return { text: `<b>Refund tidak ditemukan</b> (${error?.message || "?"}).`, replyMarkup: { inline_keyboard: [back] } };
    const r = data as any;
    const lines: string[] = [
      "💸 <b>DETAIL REFUND</b>",
      `🆔 ID      : <code>${r.id}</code>`,
      `👤 Nama    : <b>${escapeHtml(r.full_name || "-")}</b>`,
      `📱 WA      : ${r.whatsapp ? escapeHtml(r.whatsapp) : "-"}`,
      `📧 Email   : ${r.email ? escapeHtml(r.email) : "-"}`,
      `📦 Paket   : ${escapeHtml(r.tier_label || "-")}`,
      `💰 Refund  : ${rupiah(r.amount || 0)}`,
      `🕐 Diminta : ${fmtDate(r.created_at)}`,
      `Status    : ${REFUND_STATUS_LABEL[r.status] || r.status}`,
    ];
    if (r.processed_at) lines.push(`✅ Diproses: ${fmtDate(r.processed_at)}`);
    if (r.admin_notes) lines.push(`🛠 Admin    : ${escapeHtml(r.admin_notes)}`);
    return { text: lines.join("\n"), replyMarkup: { inline_keyboard: [back] } };
  }

  return { text: "Jenis tidak dikenal.", replyMarkup: { inline_keyboard: [back] } };
}

export async function handleTelegramCallback(data: string): Promise<TelegramReply | "menu" | null> {
  if (!isConfigured()) return null;
  const [head, ...rest] = data.split(":");

  if (head === "menu") return "menu";
  if (head === "cat") {
    const type = rest[0];
    const filter = rest[1] || "all";
    const page = parseInt(rest[2] || "1", 10) || 1;
    switch (type) {
      case "orders":
        return buildCategoryReply("orders", filter, page);
      case "claims":
        return buildCategoryReply("claims", filter, page);
      case "refunds":
        return buildCategoryReply("refunds", filter, page);
    }
    return null;
  }
  if (head === "lst") {
    const type = rest[0];
    const filter = rest[1] || "all";
    const page = parseInt(rest[2] || "1", 10) || 1;
    return buildCategoryReply(type, filter, page);
  }
  if (head === "det") {
    const type = rest[0];
    const id = rest[1];
    const filter = rest[2] || "all";
    const page = parseInt(rest[3] || "1", 10) || 1;
    return buildDetailReply(type, id, filter, page);
  }

  return null;
}
