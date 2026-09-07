import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getRequestMeta } from "@/lib/requestMeta";

export async function GET(req: NextRequest) {
  const meta = getRequestMeta(req);
  const rl = await checkRateLimit(rateLimitKey("referral-check", meta.ip), 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }

  const q = (req.nextUrl.searchParams.get("q") || "").trim().toUpperCase().replace(/\s+/g, "-");
  if (q.length < 3) {
    return NextResponse.json({ found: false, error: "Kode terlalu pendek." }, { status: 400 });
  }

  const supabase = supabaseServer() as any;
  const { data, error } = await supabase
    .from("referral_codes")
    .select("code, discount_amount, max_uses, current_uses, active")
    .eq("code", q)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ found: false, error: "Gagal memeriksa kode." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ found: false, ok: false, reason: "not_found" });
  }

  const limitReached = data.active === true && data.max_uses !== null && data.current_uses >= data.max_uses;
  const valid = data.active === true && !limitReached;

  return NextResponse.json({
    found: true,
    ok: valid,
    reason: limitReached ? "limit_reached" : data.active === true ? "ok" : "inactive",
    code: data.code,
    discount_amount: Number(data.discount_amount) || 0,
    active: data.active === true,
    limit_reached: limitReached,
  });
}