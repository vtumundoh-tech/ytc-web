import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
// import { createSnapTransaction } from "@/lib/midtrans"; // Midtrans dinonaktifkan sementara (mode tes)
import { getSettings } from "@/lib/settings";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getRequestMeta } from "@/lib/requestMeta";
import { generateCashbackCode, generateDownloadToken } from "@/lib/cashCode";
import { sendInvoiceEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const meta = getRequestMeta(req);
    const rl = checkRateLimit(rateLimitKey("checkout", meta.ip), 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const body = await req.json();
    const { fullName, whatsapp, email, tier, addon1080, agreeSnk } = body || {};

    if (!fullName || !email || !tier) {
      return NextResponse.json({ error: "Data belum lengkap (nama & email wajib)." }, { status: 400 });
    }
    if (agreeSnk !== true) {
      return NextResponse.json({ error: "Anda harus setuju dengan Syarat & Ketentuan." }, { status: 400 });
    }

    const settings = await getSettings();
    const tierData = settings.tiers.find((t) => t.value === tier);
    if (!tierData) {
      return NextResponse.json({ error: "Paket tidak valid." }, { status: 400 });
    }

    const hasAddon = addon1080 === true;
    const basePrice = settings.promoEnabled ? tierData.amount : tierData.originalAmount;
    const addonPrice = hasAddon ? settings.addonPrices[tier] || 0 : 0;
    const totalAmount = basePrice + addonPrice;
    const tierLabel = hasAddon ? `${tierData.label} (1080p)` : `${tierData.label} (720p)`;
    const itemName = `Lisensi YouTube Clipper - ${tierLabel}`;

    const orderId = `YTC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const cashbackCode = generateCashbackCode();
    const downloadToken = generateDownloadToken();
    const downloadExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const supabase = supabaseServer();
    const now = new Date().toISOString();
    const { error: insertError } = await supabase.from("orders").insert({
      full_name: fullName,
      whatsapp: whatsapp || null,
      email,
      tier: tierData.value,
      tier_label: tierLabel,
      amount: totalAmount,
      status: "paid",
      cashback_code: cashbackCode,
      download_token: downloadToken,
      download_expires_at: downloadExpiresAt,
      paid_at: now,
      payment_type: "manual",
      midtrans_order_id: orderId,
      agree_snk: true,
      ip_address: meta.ip,
      user_agent: meta.userAgent,
      browser: meta.browser,
      os: meta.os,
      device_type: meta.deviceType,
    });
    if (insertError) throw insertError;

    const emailSent = await sendInvoiceEmail({
      full_name: fullName,
      email,
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

    return NextResponse.json({ ok: true, paid: true, cashbackCode, emailSent, downloadToken });
  } catch (err: any) {
    console.error("checkout error:", err);
    return NextResponse.json({ error: "Gagal membuat transaksi. Coba lagi beberapa saat." }, { status: 500 });
  }
}
