import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const rl = await checkRateLimit(rateLimitKey("order-status", getClientIp(req)), 60, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });
    }

    const token = (req.nextUrl.searchParams.get("token") || "").trim();
    if (token.length < 16) {
      return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("orders")
      .select("status, amount, tier_label, payment_type, paid_at, rejection_reason")
      .eq("download_token", token)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      status: data.status,
      paid: data.status === "paid",
      rejected: data.status === "cancelled" || data.status === "failed",
      amount: data.amount,
      tierLabel: data.tier_label,
      paymentType: data.payment_type,
      paidAt: data.paid_at,
      rejectionReason: data.rejection_reason || "",
    });
  } catch (err: any) {
    console.error("order-status error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi nanti." }, { status: 500 });
  }
}