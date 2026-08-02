import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getRequestMeta } from "@/lib/requestMeta";

type OrderMatch = {
  full_name: string;
  whatsapp: string | null;
  email: string | null;
  tier: string;
  tier_label: string;
  amount: number;
  license_key: string | null;
  cashback_code: string | null;
};

export const dynamic = "force-dynamic";

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

export async function GET(req: NextRequest) {
  try {
    const meta = getRequestMeta(req);
    const rl = checkRateLimit(rateLimitKey("cashback-check", meta.ip), 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const q = normalize((req.nextUrl.searchParams.get("q") || "").trim());
    if (q.length < 6) {
      return NextResponse.json({ error: "Isi kode unik cashback dengan benar." }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("orders")
      .select("full_name, whatsapp, email, tier, tier_label, amount, license_key, cashback_code")
      .eq("status", "paid")
      .eq("cashback_code", q)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      data: {
        full_name: data.full_name,
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        tier: data.tier,
        addon1080: /1080p/i.test(data.tier_label || ""),
        amount: data.amount,
        license_key: data.license_key || "",
        cashback_code: data.cashback_code || "",
      },
    });
  } catch (err: any) {
    console.error("cashback check error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi nanti." }, { status: 500 });
  }
}
