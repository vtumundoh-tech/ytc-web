import { NextRequest, NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getRequestMeta } from "@/lib/requestMeta";
import { safeEqual } from "@/lib/security";
import { sendEmailVerificationMail } from "@/lib/mail";

export const dynamic = "force-dynamic";

const OTP_TTL_MS = 10 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const MAX_SENDS_PER_EMAIL = 3;
const SEND_WINDOW_MS = 15 * 60 * 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function otpHash(email: string, otp: string): string {
  return createHash("sha256").update(`${email}:${otp}`).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const meta = getRequestMeta(req);
    const rl = await checkRateLimit(rateLimitKey("verify-email", meta.ip), 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const body = await req.json();
    const action = String(body?.action || "");
    const email = String(body?.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Alamat email tidak valid." }, { status: 400 });
    }

    const supabase = supabaseServer();

    if (action === "send") {
      const { count, error: countErr } = await supabase
        .from("email_verifications")
        .select("id", { count: "exact", head: true })
        .eq("email", email)
        .gte("created_at", new Date(Date.now() - SEND_WINDOW_MS).toISOString());
      if (countErr) throw countErr;
      if ((count || 0) >= MAX_SENDS_PER_EMAIL) {
        return NextResponse.json({
          error: "Sudah 3x kirim kode. Tunggu 15 menit sebelum mencoba lagi.",
        }, { status: 429 });
      }

      const { data: existing } = await supabase
        .from("email_verifications")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing && existing.locked_until && new Date(existing.locked_until).getTime() > Date.now()) {
        const waitMin = Math.ceil((new Date(existing.locked_until).getTime() - Date.now()) / 60000);
        return NextResponse.json({
          error: `Terlalu sering. Tunggu ${waitMin} menit sebelum meminta kode baru.`,
          lockedMinutes: waitMin,
        }, { status: 429 });
      }

      const otp = String(randomInt(100000, 999999));
      await supabase.from("email_verifications").delete().eq("email", email);

      const now = new Date();
      const { error: insertErr } = await supabase.from("email_verifications").insert({
        email,
        otp_hash: otpHash(email, otp),
        expires_at: new Date(now.getTime() + OTP_TTL_MS).toISOString(),
        attempts: 0,
        locked_until: null,
      });
      if (insertErr) throw insertErr;

      const sent = await sendEmailVerificationMail({ email, otp });
      if (!sent) {
        return NextResponse.json({ error: "Gagal mengirim kode verifikasi. Cek konfigurasi SMTP atau coba lagi." }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    if (action === "verify") {
      const otp = String(body?.otp || "").replace(/\s/g, "");
      if (!/^\d{6}$/.test(otp)) {
        return NextResponse.json({ error: "Kode verifikasi harus 6 digit angka." }, { status: 400 });
      }

      const { data: rec } = await supabase
        .from("email_verifications")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!rec) {
        return NextResponse.json({ error: "Kode belum dikirim. Klik \"Kirim Kode Verifikasi\" dulu." }, { status: 400 });
      }
      if (rec.locked_until && new Date(rec.locked_until).getTime() > Date.now()) {
        const waitMin = Math.ceil((new Date(rec.locked_until).getTime() - Date.now()) / 60000);
        return NextResponse.json({
          error: `3x salah. Terkunci ${waitMin} menit sebelum bisa mencoba lagi.`,
          lockedMinutes: waitMin,
        }, { status: 429 });
      }
      if (new Date(rec.expires_at).getTime() < Date.now()) {
        return NextResponse.json({ error: "Kode kedaluwarsa. Kirim ulang kode baru." }, { status: 400 });
      }

      const expected = rec.otp_hash;
      const ok = await safeEqual(expected, otpHash(email, otp));
      if (!ok) {
        const attempts = (rec.attempts || 0) + 1;
        const update: Record<string, unknown> = { attempts };
        if (attempts >= MAX_ATTEMPTS) {
          update.locked_until = new Date(Date.now() + LOCK_MS).toISOString();
        }
        await supabase.from("email_verifications").update(update).eq("id", rec.id);
        if (attempts >= MAX_ATTEMPTS) {
          return NextResponse.json({
            error: "3x kode salah. Terkunci 15 menit sebelum bisa mencoba lagi.",
            lockedMinutes: 15,
          }, { status: 429 });
        }
        return NextResponse.json({
          error: `Kode salah. Sisa percobaan: ${MAX_ATTEMPTS - attempts}x.`,
          remaining: MAX_ATTEMPTS - attempts,
        }, { status: 400 });
      }

      await supabase.from("email_verifications").update({ verified_at: new Date().toISOString() }).eq("id", rec.id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  } catch (err: any) {
    console.error("verify-email error:", err?.message || err);
    return NextResponse.json({ error: "Gagal memproses verifikasi. Coba lagi." }, { status: 500 });
  }
}