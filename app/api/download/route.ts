import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { createInstallerUrl } from "@/lib/download";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const rl = await checkRateLimit(rateLimitKey("download", getClientIp(req)), 30, 600_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const token = (req.nextUrl.searchParams.get("token") || "").trim();
    if (token.length < 16) {
      return NextResponse.json({ error: "Link unduh tidak valid." }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data: order, error } = await supabase
      .from("orders")
      .select("status, download_expires_at")
      .eq("download_token", token)
      .maybeSingle();

    if (error) throw error;
    if (!order || order.status !== "paid") {
      return NextResponse.json({ error: "Order tidak ditemukan atau belum dikonfirmasi." }, { status: 404 });
    }
    if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) {
      return NextResponse.json({ error: "Tautan unduh sudah kedaluwarsa. Hubungi admin." }, { status: 410 });
    }

    const url = await createInstallerUrl(3600);
    if (!url) {
      return NextResponse.json({ error: "Unduhan belum disiapkan. Hubungi admin." }, { status: 503 });
    }

    return NextResponse.json({ ok: true, url });
  } catch (err: any) {
    console.error("download error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi nanti." }, { status: 500 });
  }
}