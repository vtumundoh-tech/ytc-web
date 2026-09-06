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
    const { fullName, whatsapp, email, tier, agreeSnk, addon1080, referralCode } = body || {};

    const fullNameStr = String(fullName || "").trim();
    const emailStr = String(email || "").trim();
    const whatsappStr = String(whatsapp || "").trim();
    const referralStr = String(referralCode || "").trim().toUpperCase().replace(/\s+/g, "-");
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

    const supabase = supabaseServer();

    const { data: verifiedRec } = await supabase
      .from("email_verifications")
      .select("verified_at")
      .eq("email", emailStr.toLowerCase())
      .gt("verified_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!verifiedRec?.verified_at) {
      return NextResponse.json({ error: "Email belum diverifikasi. Masukkan kode verifikasi sebelum melanjutkan pembayaran." }, { status: 403 });
    }

    const settings = await getSettings();
    const tierData = settings.tiers.find((t) => t.value === tier);
    if (!tierData) {
      return NextResponse.json({ error: "Paket tidak valid." }, { status: 400 });
    }

    let referralDiscount = 0;
    let referralCodeRow: any = null;
    if (referralStr) {
      const { data: rc, error: rcError } = await supabase
        .from("referral_codes")
        .select("id, code, discount_amount, max_uses, current_uses, active")
        .eq("code", referralStr)
        .maybeSingle();
      if (rcError) {
        return NextResponse.json({ error: "Kode referral tidak valid." }, { status: 400 });
      }
      if (!rc) {
        return NextResponse.json({ error: "Kode referral tidak ditemukan." }, { status: 400 });
      }
      if (rc.active !== true) {
        return NextResponse.json({ error: "Kode referral sudah tidak aktif." }, { status: 400 });
      }
      if (rc.max_uses !== null && rc.current_uses >= rc.max_uses) {
        return NextResponse.json({ error: "Kode referral sudah mencapai batas pemakaian." }, { status: 400 });
      }
      referralCodeRow = rc;
      referralDiscount = Math.max(0, Number(rc.discount_amount) || 0);
    }

    const addonWanted = addon1080 === true || addon1080 === "true" || addon1080 === 1 || addon1080 === "1";
    const tierIs1080 = /1080/i.test(tier);
    const hasAddon = tierIs1080 || addonWanted;
    const addonPrice = addonWanted && !tierIs1080 ? settings.addonPrices[tier] || 0 : 0;
    const basePrice = settings.promoEnabled ? tierData.amount : tierData.originalAmount;
    const totalAmount = Math.max(0, basePrice + addonPrice - referralDiscount);
    const tierLabel = hasAddon ? `${tierData.label} (1080p)` : `${tierData.label} (720p)`;

    // SAAT INI KHUSUS QRIS — semua pesanan masuk alur QRIS (pending → bukti bayar → verifikasi admin).
    // TODO: buka lagi baris asli di bawah saat metode pembayaran lain sudah siap.
    const qrisEnabled = true;
    // const qrisEnabled = settings.qrisEnabled === true;
    const isInstant = !qrisEnabled;

    const orderId = `YTC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const cashbackCode = generateCashbackCode();
    const downloadToken = generateDownloadToken();
    const downloadExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const now = new Date().toISOString();
    const orderInsert: any = {
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
    };
    if (referralCodeRow) {
      orderInsert.referral_code = referralCodeRow.code;
      orderInsert.referral_discount = referralDiscount;
    }
    const { error: insertError } = await supabase.from("orders").insert(orderInsert);
    if (insertError) throw insertError;

    if (referralCodeRow) {
      await supabase
        .from("referral_codes")
        .update({ current_uses: (referralCodeRow.current_uses || 0) + 1 })
        .eq("id", referralCodeRow.id);
    }

    if (isInstant) {
      void notifyNewOrder({
        full_name: fullNameStr,
        whatsapp: whatsappStr,
        email: emailStr,
        tier_label: tierLabel,
        amount: totalAmount,
        midtrans_order_id: orderId,
        paid_at: now,
        pending: false,
      });
    }

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
      referralDiscount,
      cashbackCode,
      downloadToken,
      emailSent,
    });
  } catch (err: any) {
    console.error("checkout error:", err);
    return NextResponse.json({ error: "Gagal membuat transaksi. Coba lagi beberapa saat." }, { status: 500 });
  }
}