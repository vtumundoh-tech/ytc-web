import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { verifyNotificationSignature } from "@/lib/midtrans";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status, payment_type } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json({ error: "Payload tidak lengkap." }, { status: 400 });
    }

    const valid = await verifyNotificationSignature({ order_id, status_code, gross_amount, signature_key });
    if (!valid) {
      return NextResponse.json({ error: "Signature tidak valid." }, { status: 403 });
    }

    let newStatus: string | null = null;
    if (transaction_status === "capture" || transaction_status === "settlement") {
      newStatus = "paid";
    } else if (transaction_status === "expire") {
      newStatus = "expired";
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      newStatus = "failed";
    } else if (transaction_status === "pending") {
      newStatus = "pending";
    }

    if (newStatus) {
      const supabase = supabaseServer();
      const update: Record<string, any> = {
        status: newStatus,
        payment_type,
        midtrans_transaction_id: body.transaction_id,
      };
      if (newStatus === "paid") update.paid_at = new Date().toISOString();

      const { error } = await supabase.from("orders").update(update).eq("midtrans_order_id", order_id);
      if (error) throw error;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
