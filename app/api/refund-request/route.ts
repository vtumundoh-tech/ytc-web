import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getRequestMeta } from "@/lib/requestMeta";
import { notifyRefundRequest } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const meta = getRequestMeta(req);
    const rl = await checkRateLimit(rateLimitKey("refund-request", meta.ip), 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const body = await req.json();
    const token = String(body?.token || "").trim();
    if (token.length < 16) {
      return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, rejection_type, full_name, email, whatsapp, tier_label, amount, amount_paid_by_customer, amount_remaining")
      .eq("download_token", token)
      .maybeSingle();
    if (error) throw error;
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }
    if (order.status !== "cancelled" && order.status !== "failed") {
      return NextResponse.json({ error: "Pesanan tidak dalam status yang bisa diajukan refund." }, { status: 400 });
    }
    if (order.rejection_type !== "insufficient") {
      return NextResponse.json({ error: "Pesanan ini tidak memenuhi syarat pengajuan refund." }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("refund_requests")
      .select("id")
      .eq("order_id", order.id)
      .in("status", ["pending", "processed"])
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "Refund untuk pesanan ini sudah diajukan." }, { status: 409 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("refund_requests")
      .insert({
        order_id: order.id,
        full_name: order.full_name,
        email: order.email,
        whatsapp: order.whatsapp,
        tier_label: order.tier_label,
        amount: order.amount_paid_by_customer || order.amount,
        status: "pending",
      })
      .select("id, created_at")
      .single();
    if (insertError) throw insertError;

    void notifyRefundRequest({
      full_name: order.full_name,
      whatsapp: order.whatsapp,
      email: order.email,
      tier_label: order.tier_label,
      amount: order.amount_paid_by_customer || order.amount,
      paid_at: null,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Refund untuk pesanan ini sudah diajukan. Muat ulang halaman." }, { status: 409 });
    }
    console.error("refund-request error:", err);
    return NextResponse.json({ error: "Gagal mengajukan refund. Coba lagi beberapa saat." }, { status: 500 });
  }
}