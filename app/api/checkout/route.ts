import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getSettings } from "@/lib/settings";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getRequestMeta } from "@/lib/requestMeta";
import { generateCashbackCode, generateDownloadToken } from "@/lib/cashCode";
import { sendInvoiceEmail } from "@/lib/mail";
import { notifyNewOrder } from "@/lib/telegram";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    const meta = getRequestMeta(req);
    const rl = await checkRateLimit(rateLimitKey("checkout", meta.ip), 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const body = await req.json();
    const { fullName, whatsapp, email, tier, agreeSnk } = body || {};

    const fullNameStr = String(fullName || "").trim();
    const emailStr = String(email || "").trim();
    const whatsappStr = String(whatsapp || "").trim();
    const waDigits = whatsappStr.replace(/[^0-9]/g, "");

    if (!fullNameStr || !emailStr || !tier) {
      return NextResponse.json({ error: "Data belum lengkap (nama & email wajib)." }, { status: 400 });
    }
    if (!EMAIL_RE.test(emailStr)) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }
    if (waDigits.length < 8) {
      return NextResponse.json({ error: "Nomor WhatsApp wajib diisi minimal 8 digit." }, { status: 400 });
    }
    if (agreeSnk !== true) {
      return NextResponse.json({ error: "Anda harus setuju dengan Syarat & Ketentuan." }, { status: 400 });
    }

    const settings = await getSettings();
    const tierData = settings.tiers.find((t) => t.value === tier);
    if (!tierData) {
      return NextResponse.json({ error: "Paket tidak valid." }, { status: 400 });
    }

    const hasAddon = /1080p/i.test(tierData.label);
    const basePrice = settings.promoEnabled ? tierData.amount : tierData.originalAmount;
    const totalAmount = basePrice;
    const tierLabel = hasAddon ? `${tierData.label} (1080p)` : `${tierData.label} (720p)`;

    const qrisEnabled = settings.qrisEnabled === true;
    const isInstant = !qrisEnabled;

    const orderId = `YTC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const cashbackCode = generateCashbackCode();
    const downloadToken = generateDownloadToken();
    const downloadExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const supabase = supabaseServer();
    const now = new Date().toISOString();
    const { error: insertError } = await supabase.from("orders").insert({
      full_name: fullNameStr,
      whatsapp: whatsappStr,
      email: emailStr,
      tier: tierData.value,
      tier_label: tierLabel,
      amount: totalAmount,
      status: isInstant ? "paid" : "pending",
      cashback_code: cashbackCode,
      download_token: downloadToken,
      download_expires_at: downloadExpiresAt,
      paid_at: isInstant ? now : null,
      payment_type: qrisEnabled ? "qris" : "manual",
      midtrans_order_id: orderId,
      agree_snk: true,
      ip_address: meta.ip,
      user_agent: meta.userAgent,
      browser: meta.browser,
      os: meta.os,
      device_type: meta.deviceType,
    });
    if (insertError) throw insertError;

    void notifyNewOrder({
      full_name: fullNameStr,
      whatsapp: whatsappStr,
      email: emailStr,
      tier_label: tierLabel,
      amount: totalAmount,
      midtrans_order_id: orderId,
      paid_at: isInstant ? now : null,
      pending: !isInstant,
    });

    let emailSent = false;
    if (isInstant) {
      emailSent = await sendInvoiceEmail({
        full_name: fullNameStr,
        email: emailStr,
        tier_label: tierLabel,
        amount: totalAmount,
        midtrans_order_id: orderId,
        paid_at: now,
        downloadToken,
      });

      const { error: statusError } = await supabase
        .from("orders")
        .update({ email_status: emailSent ? "sent" : "failed" })
        .eq("midtrans_order_id", orderId);
      if (statusError) console.error("checkout update email_status:", statusError);
    }

    return NextResponse.json({
      ok: true,
      paid: isInstant,
      qrisEnabled,
      orderId,
      amount: totalAmount,
      cashbackCode,
      downloadToken,
      emailSent,
    });
  } catch (err: any) {
    console.error("checkout error:", err);
    return NextResponse.json({ error: "Gagal membuat transaksi. Coba lagi beberapa saat." }, { status: 500 });
  }
}