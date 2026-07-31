import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { createSnapTransaction } from "@/lib/midtrans";
import { getSettings } from "@/lib/settings";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getRequestMeta } from "@/lib/requestMeta";

export async function POST(req: NextRequest) {
  try {
    const meta = getRequestMeta(req);
    const rl = checkRateLimit(rateLimitKey("checkout", meta.ip), 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const body = await req.json();
    const { fullName, whatsapp, email, tier, addon1080, agreeSnk } = body || {};

    if (!fullName || !whatsapp || !tier) {
      return NextResponse.json({ error: "Data belum lengkap." }, { status: 400 });
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

    const supabase = supabaseServer();
    const { error: insertError } = await supabase.from("orders").insert({
      full_name: fullName,
      whatsapp,
      email: email || null,
      tier: tierData.value,
      tier_label: tierLabel,
      amount: totalAmount,
      status: "pending",
      midtrans_order_id: orderId,
      agree_snk: true,
      ip_address: meta.ip,
      user_agent: meta.userAgent,
      browser: meta.browser,
      os: meta.os,
      device_type: meta.deviceType,
    });
    if (insertError) throw insertError;

    const snap = await createSnapTransaction({
      orderId,
      amount: totalAmount,
      customerName: fullName,
      customerPhone: whatsapp,
      customerEmail: email,
      itemName,
    });

    return NextResponse.json({ token: snap.token, redirectUrl: snap.redirect_url });
  } catch (err: any) {
    console.error("checkout error:", err);
    return NextResponse.json({ error: "Gagal membuat transaksi. Coba lagi beberapa saat." }, { status: 500 });
  }
}
