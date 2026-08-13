import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/security";
import { notifyPaymentClaimed } from "@/lib/telegram";

export const dynamic = "force-dynamic";

type OrderInfo = {
  id: string;
  status: string;
  full_name: string;
  tier_label: string;
  amount: number;
  midtrans_order_id: string;
  customer_claimed_pay_at: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const rl = await checkRateLimit(rateLimitKey("order-confirm", getClientIp(req)), 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const body = await req.json();
    const token = String(body?.token || "").trim();
    if (token.length < 16) {
      return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("orders")
      .select("id, status, full_name, tier_label, amount, midtrans_order_id, customer_claimed_pay_at")
      .eq("download_token", token)
      .maybeSingle();
    if (error) throw error;

    const order = data as OrderInfo | null;
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }
    if (order.status === "paid") {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }
    if (order.status !== "pending") {
      return NextResponse.json({ error: "Status pesanan tidak bisa dikonfirmasi." }, { status: 400 });
    }

    const now = new Date().toISOString();
    if (!order.customer_claimed_pay_at) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({ customer_claimed_pay_at: now })
        .eq("id", order.id);
      if (updateError) {
        console.error("order-confirm update error:", updateError);
      }
    }

    void notifyPaymentClaimed({
      full_name: order.full_name,
      tier_label: order.tier_label,
      amount: order.amount,
      midtrans_order_id: order.midtrans_order_id,
    });

    return NextResponse.json({ ok: true, alreadyPaid: false });
  } catch (err: any) {
    console.error("order-confirm error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi nanti." }, { status: 500 });
  }
}