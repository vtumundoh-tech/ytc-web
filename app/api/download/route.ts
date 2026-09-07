import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { createInstallerUrl } from "@/lib/download";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getClientIp, safeEqual } from "@/lib/security";
import { generateDownloadToken } from "@/lib/cashCode";
import { logSecurityEvent } from "@/lib/securityAlert";

export const dynamic = "force-dynamic";

const DOWNLOAD_TOKEN_TTL_MS = 15 * 60 * 60 * 1000; // 15 jam
const PRESIGNED_TTL_SECONDS = 5 * 60; // 5 menit
const MAX_GATE_FAILURES = 5;
const GATE_LOCK_MS = 15 * 60 * 1000; // 15 menit

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(rateLimitKey("download", ip), 30, 600_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      /* body bukan JSON — token/code kosong */
    }
    const token = String(body.token || "").trim();
    const code = String(body.code || "").trim();

    if (token.length < 16 || !code) {
      return NextResponse.json({ error: "Link unduh tidak valid." }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, download_expires_at, download_code, gate_failed_attempts, gate_locked_until")
      .eq("download_token", token)
      .maybeSingle();

    if (error) throw error;
    if (!order || order.status !== "paid") {
      return NextResponse.json({ error: "Order tidak ditemukan atau belum dikonfirmasi." }, { status: 404 });
    }
    if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) {
      return NextResponse.json({ error: "Tautan unduh sudah kedaluwarsa. Minta link baru ke admin." }, { status: 410 });
    }
    if (order.gate_locked_until && new Date(order.gate_locked_until) > new Date()) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi beberapa menit." }, { status: 429 });
    }
    if (!order.download_code) {
      return NextResponse.json({ error: "Kode verifikasi tidak tersedia. Minta admin mengirim ulang link." }, { status: 400 });
    }

    const codeOk = await safeEqual(String(code || ""), String(order.download_code || ""));
    if (!codeOk) {
      const attempts = (Number(order.gate_failed_attempts) || 0) + 1;
      const lockUntil = attempts >= MAX_GATE_FAILURES ? new Date(Date.now() + GATE_LOCK_MS).toISOString() : null;
      const { error: upErr } = await supabase
        .from("orders")
        .update({
          gate_failed_attempts: lockUntil ? 0 : attempts,
          gate_locked_until: lockUntil,
        })
        .eq("id", order.id);
      if (upErr) console.error("download gate update:", upErr);
      if (lockUntil) {
        await logSecurityEvent({
          type: "download_gate_failed",
          ip,
          detail: `Order ${order.id} terkunci 15 menit (5x kode verifikasi salah)`,
          userAgent: req.headers.get("user-agent"),
        });
      }
      return NextResponse.json({ error: "Kode verifikasi salah." }, { status: 401 });
    }

    const url = await createInstallerUrl(PRESIGNED_TTL_SECONDS);
    if (!url) {
      return NextResponse.json({ error: "Unduhan belum disiapkan. Hubungi admin." }, { status: 503 });
    }

    // Limitnya terjaga: link & kode sekali pakai. Setelah dipakai, token di-rotate
    // sehingga akses berikutnya gagal sampai admin mengirim ulang link baru.
    const newToken = generateDownloadToken();
    const { error: rotateError } = await supabase
      .from("orders")
      .update({
        download_token: newToken,
        download_code: null,
        download_expires_at: new Date(Date.now() + DOWNLOAD_TOKEN_TTL_MS).toISOString(),
        gate_failed_attempts: 0,
        gate_locked_until: null,
      })
      .eq("id", order.id);
    if (rotateError) console.error("download rotate:", rotateError);

    return NextResponse.json({ ok: true, url });
  } catch (err: any) {
    console.error("download error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi nanti." }, { status: 500 });
  }
}