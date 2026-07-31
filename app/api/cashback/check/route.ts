import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getRequestMeta } from "@/lib/requestMeta";

type OrderMatch = {
  full_name: string;
  whatsapp: string;
  email: string | null;
  tier: string;
  tier_label: string;
  amount: number;
  license_key: string | null;
  machine_id: string | null;
};

export const dynamic = "force-dynamic";

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function GET(req: NextRequest) {
  try {
    const meta = getRequestMeta(req);
    const rl = checkRateLimit(rateLimitKey("cashback-check", meta.ip), 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const q = (req.nextUrl.searchParams.get("q") || "").trim();
    if (q.length < 3) {
      return NextResponse.json({ error: "Isi Machine ID, key lisensi, atau nama lengkap (min 3 karakter)." }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("orders")
      .select("full_name, whatsapp, email, tier, tier_label, amount, license_key, machine_id")
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const list = (data || []) as OrderMatch[];
    const needle = normalize(q);

    const found = list.find((o) => {
      if (o.machine_id && normalize(o.machine_id) === needle) return true;
      if (o.license_key && normalize(o.license_key) === needle) return true;
      return normalize(o.full_name) === needle;
    });

    if (!found) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      data: {
        full_name: found.full_name,
        whatsapp: found.whatsapp,
        email: found.email || "",
        tier: found.tier,
        addon1080: /1080p/i.test(found.tier_label || ""),
        amount: found.amount,
        license_key: found.license_key || "",
      },
    });
  } catch (err: any) {
    console.error("cashback check error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi nanti." }, { status: 500 });
  }
}
