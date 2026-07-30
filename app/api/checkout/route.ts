import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { createSnapTransaction } from "@/lib/midtrans";
import { findTier, getAddonPrice, getTotalPrice } from "@/lib/tiers";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = checkRateLimit(rateLimitKey("checkout", ip), 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const body = await req.json();
    const { fullName, whatsapp, email, tier, addon1080 } = body || {};

    if (!fullName || !whatsapp || !tier) {
      return NextResponse.json({ error: "Data belum lengkap." }, { status: 400 });
    }

    const tierData = findTier(tier);
    if (!tierData) {
      return NextResponse.json({ error: "Paket tidak valid." }, { status: 400 });
    }

    const hasAddon = addon1080 === true;
    const totalAmount = getTotalPrice(tier, hasAddon);
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
