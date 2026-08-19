import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getRequestMeta } from "@/lib/requestMeta";
import { generateDownloadToken } from "@/lib/cashCode";
import { notifyNewOrder } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const meta = getRequestMeta(req);
    const rl = await checkRateLimit(rateLimitKey("order-supplement", meta.ip), 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const body = await req.json();
    const token = String(body?.token || "").trim();
    if (token.length < 16) {
      return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data: parent, error } = await supabase
      .from("orders")
      .select("id, status, rejection_type, amount_remaining, full_name, whatsapp, email, tier, tier_label")
      .eq("download_token", token)
      .maybeSingle();
    if (error) throw error;
    if (!parent) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }
    if (parent.status !== "cancelled" && parent.status !== "failed") {
      return NextResponse.json({ error: "Pesanan tidak dalam status yang bisa dilengkapi." }, { status: 400 });
    }
    if (parent.rejection_type !== "insufficient") {
      return NextResponse.json({ error: "Pesanan ini tidak memerlukan pembayaran pelengkap." }, { status: 400 });
    }
    const remaining = Number(parent.amount_remaining) || 0;
    if (remaining <= 0) {
      return NextResponse.json({ error: "Nominal pelengkap tidak valid." }, { status: 400 });
    }

    const { data: refundReq } = await supabase
      .from("refund_requests")
      .select("id")
      .eq("order_id", parent.id)
      .in("status", ["pending", "processed"])
      .maybeSingle();
    if (refundReq) {
      return NextResponse.json({ error: "Refund untuk pesanan ini sudah diajukan." }, { status: 409 });
    }

    const { data: existingSupplement } = await supabase
      .from("orders")
      .select("id")
      .eq("supplement_for", parent.id)
      .in("status", ["pending", "paid"])
      .maybeSingle();
    if (existingSupplement) {
      return NextResponse.json({ error: "Pembayaran pelengkap sudah pernah dibuat." }, { status: 409 });
    }

    const supplementId = `YTC-SUP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const downloadToken = generateDownloadToken();
    const now = new Date().toISOString();

    const { data: inserted, error: insertError } = await supabase
      .from("orders")
      .insert({
        full_name: parent.full_name,
        whatsapp: parent.whatsapp || "",
        email: parent.email,
        tier: parent.tier,
        tier_label: `${parent.tier_label} (Pelengkap)`,
        amount: remaining,
        status: "pending",
        payment_type: "qris",
        midtrans_order_id: supplementId,
        supplement_for: parent.id,
        download_token: downloadToken,
        download_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        agree_snk: true,
        ip_address: meta.ip,
        user_agent: meta.userAgent,
        browser: meta.browser,
        os: meta.os,
        device_type: meta.deviceType,
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    void notifyNewOrder({
      full_name: parent.full_name,
      whatsapp: parent.whatsapp,
      email: parent.email,
      tier_label: `${parent.tier_label} (Pelengkap)`,
      amount: remaining,
      midtrans_order_id: supplementId,
      paid_at: null,
      pending: true,
    });

    return NextResponse.json({
      ok: true,
      orderId: inserted?.id,
      midtransOrderId: supplementId,
      amount: remaining,
      downloadToken,
    });
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Pembayaran pelengkap sudah pernah dibuat. Muat ulang halaman." }, { status: 409 });
    }
    console.error("order-supplement error:", err);
    return NextResponse.json({ error: "Gagal membuat pembayaran pelengkap. Coba lagi beberapa saat." }, { status: 500 });
  }
}