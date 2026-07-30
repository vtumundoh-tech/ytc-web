import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkGoQRISStatus } from "@/lib/goqris";

export async function GET(req: NextRequest) {
  try {
    const refId = req.nextUrl.searchParams.get("ref_id");
    if (!refId) {
      return NextResponse.json({ error: "ref_id wajib diisi" }, { status: 400 });
    }

    const result = await checkGoQRISStatus(refId);

    if (result.payment_status === "paid") {
      const supabase = supabaseServer();
      const { error } = await supabase
        .from("orders")
        .update({
          status: "paid",
          goqris_trx_id: result.trx_id,
          paid_at: new Date().toISOString(),
        })
        .eq("ref_id", refId);

      if (error) throw error;
    }

    return NextResponse.json({
      status: result.payment_status,
      paidAt: result.paid_at || null,
    });
  } catch (err: any) {
    console.error("check-payment error:", err);
    return NextResponse.json({ error: err.message || "Gagal cek status" }, { status: 500 });
  }
}
