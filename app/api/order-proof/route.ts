import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getRequestMeta } from "@/lib/requestMeta";
import { notifyPaymentClaimed } from "@/lib/telegram";
import {
  validateFileSignature,
  validateFileSize,
  isAllowedMimeType,
} from "@/lib/fileValidation";

const BUCKET = "cashback-proofs";

function randomHex(len: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  try {
    const meta = getRequestMeta(req);
    const rl = await checkRateLimit(rateLimitKey("order-proof", meta.ip), 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const form = await req.formData();
    const token = String(form.get("token") || "").trim();
    const file = form.get("paymentProof") as File | null;

    if (token.length < 16) {
      return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "Bukti bayar wajib dilampirkan." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (!validateFileSize(arrayBuffer.byteLength)) {
      return NextResponse.json({ error: "File terlalu besar (maks 5MB)." }, { status: 400 });
    }
    const mime = file.type || "image/jpeg";
    if (!isAllowedMimeType(mime) || !validateFileSignature(arrayBuffer, mime)) {
      return NextResponse.json({ error: "File tidak valid. Hanya JPEG/PNG/WebP yang diperbolehkan." }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, full_name, tier_label, amount, midtrans_order_id, payment_proof_key, customer_claimed_pay_at")
      .eq("download_token", token)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }
    if (order.status === "paid") {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }
    if (order.status !== "pending") {
      return NextResponse.json({ error: "Status pesanan tidak bisa dilengkapi bukti bayar." }, { status: 400 });
    }

    const ext = mime.split("/")[1] || "jpg";
    const path = `payment-${Date.now()}-${randomHex(6)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(arrayBuffer), {
      contentType: mime,
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_proof_key: path,
        customer_claimed_pay_at: order.customer_claimed_pay_at || now,
      })
      .eq("id", order.id);
    if (updateError) throw updateError;

    void notifyPaymentClaimed({
      full_name: order.full_name,
      tier_label: order.tier_label,
      amount: order.amount,
      midtrans_order_id: order.midtrans_order_id,
    });

    return NextResponse.json({ ok: true, alreadyPaid: false });
  } catch (err: any) {
    console.error("order-proof error:", err);
    return NextResponse.json({ error: "Gagal mengirim bukti bayar. Coba lagi beberapa saat." }, { status: 500 });
  }
}