import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { sendInvoiceEmail, sendOrderRejectedEmail } from "@/lib/mail";
import { generateDownloadToken } from "@/lib/cashCode";
import { writeAudit } from "@/lib/audit";

const ORDER_STATUSES = ["pending", "paid", "expired", "failed", "cancelled"];
const REJECTED_STATUSES = ["cancelled", "failed"];
const DOWNLOAD_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PROOF_BUCKET = "cashback-proofs";
const SIGN_EXPIRY_SECONDS = 60 * 60;

async function signedProofUrl(supabase: any, path: string | null): Promise<string> {
  if (!path) return "";
  const { data, error } = await supabase.storage.from(PROOF_BUCKET).createSignedUrl(path, SIGN_EXPIRY_SECONDS);
  if (error || !data) return "";
  return data.signedUrl;
}

type Order = {
  id: string;
  status: string;
  email: string | null;
  full_name: string;
  tier_label: string;
  amount: number;
  midtrans_order_id: string;
  download_token: string | null;
  download_expires_at: string | null;
  email_status: string | null;
  cashback_code?: string | null;
  rejection_reason?: string | null;
  rejection_email_sent_at?: string | null;
};

export async function GET() {
  const supabase = supabaseServer() as any;
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Gagal memuat data." }, { status: 500 });
  const rows = await Promise.all(
    (data || []).map(async (o: any) => ({
      ...o,
      payment_proof_url: await signedProofUrl(supabase, o.payment_proof_key),
    }))
  );
  return NextResponse.json({ data: rows });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, admin_notes, rejection_reason } = body || {};
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  const normalizedStatus = String(status || "").toLowerCase();
  if (normalizedStatus && !ORDER_STATUSES.includes(normalizedStatus)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  const supabase = supabaseServer() as any;

  const { data: existing, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, email, full_name, tier_label, amount, midtrans_order_id, download_token, download_expires_at, email_status, cashback_code, rejection_reason, rejection_email_sent_at")
    .eq("id", id)
    .maybeSingle();
  if (fetchError || !existing) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }
  const order = existing as Order;

  const update: Record<string, unknown> = { status: normalizedStatus, admin_notes };
  if (typeof rejection_reason === "string") update.rejection_reason = rejection_reason;
  let emailSent: boolean | null = null;
  let emailKind: "invoice" | "rejected" | null = null;

  if (normalizedStatus === "paid" && order.status !== "paid") {
    let downloadToken = order.download_token;
    if (!downloadToken) {
      downloadToken = generateDownloadToken();
      update.download_token = downloadToken;
      update.download_expires_at = new Date(Date.now() + DOWNLOAD_TOKEN_TTL_MS).toISOString();
    }
    update.paid_at = new Date().toISOString();
    emailSent = await sendInvoiceEmail({
      full_name: order.full_name,
      email: order.email,
      tier_label: order.tier_label,
      amount: order.amount,
      midtrans_order_id: order.midtrans_order_id,
      paid_at: new Date().toISOString(),
      downloadToken,
      cashbackCode: order.cashback_code,
    });
    emailKind = "invoice";
    update.email_status = emailSent ? "sent" : "failed";
  } else if (
    REJECTED_STATUSES.includes(normalizedStatus) &&
    order.status !== normalizedStatus &&
    typeof rejection_reason === "string" &&
    rejection_reason.trim() !== "" &&
    !order.rejection_email_sent_at
  ) {
    emailSent = await sendOrderRejectedEmail({
      full_name: order.full_name,
      email: order.email,
      midtrans_order_id: order.midtrans_order_id,
      tier_label: order.tier_label,
      amount: order.amount,
      reason: rejection_reason,
    });
    emailKind = "rejected";
    if (emailSent) update.rejection_email_sent_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase.from("orders").update(update).eq("id", id);
  if (updateError) return NextResponse.json({ error: "Gagal menyimpan." }, { status: 500 });

  const emailDetail =
    emailKind === "invoice"
      ? emailSent
        ? " | invoice email terkirim"
        : " | invoice email gagal"
      : emailKind === "rejected"
        ? emailSent
          ? " | email penolakan terkirim"
          : " | email penolakan gagal"
        : "";

  await writeAudit(supabase, {
    action: "order_status_change",
    target_type: "order",
    target_id: order.id,
    detail: `${order.status || "-"} -> ${normalizedStatus}${emailDetail}`,
  });

  return NextResponse.json({ ok: true });
}