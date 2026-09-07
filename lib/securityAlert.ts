export type SecurityEventType =
  | "gate_failed"
  | "login_failed"
  | "login_ok"
  | "unauthorized_access"
  | "delete_password_failed"
  | "download_gate_failed";

type SecurityEvent = {
  type: SecurityEventType;
  ip: string;
  detail?: string | null;
  userAgent?: string | null;
};

// Dedupe in-memory per tipe+IP supaya scan/brute force tidak spam DB & Telegram.
const DEDUPE_MS = 10 * 60 * 1000;
const lastSeen = new Map<string, number>();

// delete_password_failed tidak di-dedupe (sudah dibatasi rate limiter 3x/15 menit,
// dan tiap kegagalan penting untuk terlihat beserta sisa kesempatannya).
const NO_DEDUPE = new Set<SecurityEventType>(["delete_password_failed"]);

const EVENT_META: Record<
  SecurityEventType,
  { title: string; tag: string; emoji: string; alert: boolean }
> = {
  gate_failed: {
    title: "🚪 KODE GATE SALAH",
    tag: "#GateGagal",
    emoji: "⛔",
    alert: true,
  },
  login_failed: {
    title: "🔐 LOGIN ADMIN GAGAL",
    tag: "#PercobaanLogin",
    emoji: "❌",
    alert: true,
  },
  login_ok: {
    title: "🔐 LOGIN ADMIN BERHASIL",
    tag: "#LoginAdmin",
    emoji: "✅",
    alert: true,
  },
  unauthorized_access: {
    title: "⚠️ PERCOBAAN AKSES TERLARANG (BYPASS)",
    tag: "#BypassTerdeteksi",
    emoji: "🚨",
    alert: true,
  },
  download_gate_failed: {
    title: "📥 KODE VERIFIKASI UNDUH SALAH",
    tag: "#DownloadGateGagal",
    emoji: "⛔",
    alert: true,
  },
  delete_password_failed: {
    title: "🗑️ PASSWORD HAPUS SALAH",
    tag: "#AksiDestructive",
    emoji: "❌",
    alert: true,
  },
};

function fmtNow(): string {
  const d = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Pengirim Telegram minimal (edge-safe) — sengaja tidak mengimpor lib/telegram.ts
// agar middleware tidak ikut membawa dependensi supabase/settings.
async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (err: any) {
    console.error("[securityAlert] telegram error:", err?.message || err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function insertAuditRow(event: SecurityEvent): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/audit_logs`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        action: event.type,
        target_type: "security",
        target_id: event.ip || "unknown",
        detail:
          [event.detail, event.userAgent ? `UA: ${event.userAgent}` : null]
            .filter(Boolean)
            .join(" | ")
            .slice(0, 500) || null,
        created_at: new Date().toISOString(),
      }),
    });
  } catch (err: any) {
    console.error("[securityAlert] audit error:", err?.message || err);
  }
}

/**
 * Catat kejadian keamanan ke audit_logs + kirim notif Telegram.
 * Dipakai di middleware (edge-safe: hanya fetch), admin-gate, admin-login,
 * dan API hapus data. Selalu resolve (tidak melempar error).
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const meta = EVENT_META[event.type];
  try {
    const dedupeKey = `${event.type}:${event.ip}`;
    const now = Date.now();
    const seen = lastSeen.get(dedupeKey);
    if (!NO_DEDUPE.has(event.type) && seen && now - seen < DEDUPE_MS) {
      return;
    }
    lastSeen.set(dedupeKey, now);
    if (lastSeen.size > 500) {
      for (const [k, v] of lastSeen) {
        if (now - v > DEDUPE_MS) lastSeen.delete(k);
      }
    }

    await insertAuditRow(event);

    if (!meta.alert) return;
    const lines = [
      `${meta.emoji} <b>${meta.title}</b> · ${meta.tag}`,
      "",
      `🌐 IP     : <code>${escapeHtml(event.ip || "unknown")}</code>`,
      `🕐 Waktu  : ${fmtNow()}`,
    ];
    if (event.detail) lines.push(`📋 Detail: ${escapeHtml(event.detail.slice(0, 200))}`);
    await sendTelegram(lines.join("\n"));
  } catch (err: any) {
    console.error("[securityAlert] error:", err?.message || err);
  }
}
