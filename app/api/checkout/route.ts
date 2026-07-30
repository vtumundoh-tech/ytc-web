import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { createGoQRISOrder } from "@/lib/goqris";
import { findTier } from "@/lib/tiers";

const PROJECT_NAME = "YouTube Clipper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, whatsapp, email, tier } = body || {};

    if (!fullName || !whatsapp || !tier) {
      return NextResponse.json({ error: "Data belum lengkap." }, { status: 400 });
    }

    const tierData = findTier(tier);
    if (!tierData) {
      return NextResponse.json({ error: "Paket tidak valid." }, { status: 400 });
    }

    const refId = `YTC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const goqris = await createGoQRISOrder(
      {
        refId,
        amount: tierData.amount,
        customerName: fullName,
      },
      PROJECT_NAME
    );

    const supabase = supabaseServer();
    const { error: insertError } = await supabase.from("orders").insert({
      full_name: fullName,
      whatsapp,
      email: email || null,
      tier: tierData.value,
      tier_label: tierData.label,
      amount: tierData.amount,
      status: "pending",
      ref_id: refId,
    });
    if (insertError) throw insertError;

    return NextResponse.json({
      refId,
      trxId: goqris.trx_id,
      totalAmount: goqris.total_amount,
      qrImage: goqris.payment_detail.qr_image,
      qrString: goqris.payment_detail.qr_string,
      expiresAt: goqris.expires_at,
    });
  } catch (err: any) {
    console.error("checkout error:", err);
    return NextResponse.json({ error: "Gagal membuat transaksi. Coba lagi beberapa saat." }, { status: 500 });
  }
}
