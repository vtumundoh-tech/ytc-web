import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = supabaseServer() as any;
  const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
  if (error) return NextResponse.json({ error: "Gagal memuat pengaturan." }, { status: 500 });
  return NextResponse.json(
    { data },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { promo_enabled, tiers, addon_prices, cashback_tiers, qris_enabled, qris_image_url, qris_instructions, qris_payment_notice, usd_rate, usd_rate_label } = body || {};

    if (!Array.isArray(tiers)) {
      return NextResponse.json({ error: "Data tiers tidak valid." }, { status: 400 });
    }

    const supabase = supabaseServer() as any;
    const { error } = await supabase.from("app_settings").upsert(
      {
        id: 1,
        promo_enabled: promo_enabled === true,
        tiers,
        addon_prices: addon_prices || {},
        cashback_tiers: cashback_tiers || {},
        qris_enabled: qris_enabled === true,
        qris_image_url: typeof qris_image_url === "string" ? qris_image_url : "",
        qris_instructions: typeof qris_instructions === "string" ? qris_instructions : "",
        qris_payment_notice: typeof qris_payment_notice === "string" ? qris_payment_notice : "",
        usd_rate: Number.isFinite(Number(usd_rate)) && Number(usd_rate) > 0 ? Number(usd_rate) : 16000,
        usd_rate_label: typeof usd_rate_label === "string" ? usd_rate_label : "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) return NextResponse.json({ error: "Gagal menyimpan pengaturan." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("admin settings error:", err);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan." }, { status: 500 });
  }
}
