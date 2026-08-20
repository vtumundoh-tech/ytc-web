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
  rejection_type?: string | null;
  amount_paid_by_customer?: number | null;
  amount_remaining?: number | null;
  rejection_email_sent_at?: string | null;
  supplement_for?: string | null;
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
  const { id, status, admin_notes, rejection_reason, rejection_type, amount_paid_by_customer, amount_remaining, resend_link } = body || {};
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  const normalizedStatus = String(status || "").toLowerCase();
  if (normalizedStatus && !ORDER_STATUSES.includes(normalizedStatus)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  const supabase = supabaseServer() as any;

  const { data: existing, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, email, full_name, tier_label, amount, midtrans_order_id, download_token, download_expires_at, email_status, cashback_code, rejection_reason, rejection_type, amount_paid_by_customer, amount_remaining, rejection_email_sent_at, supplement_for")
    .eq("id", id)
    .maybeSingle();
  if (fetchError || !existing) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }
  const order = existing as Order;

  if (resend_link === true) {
    if (order.status !== "paid") {
      return NextResponse.json({ error: "Link unduh hanya bisa dikirim ulang untuk pesanan yang sudah lunas." }, { status: 400 });
    }
    const newToken = generateDownloadToken();
    const newExpiry = new Date(Date.now() + DOWNLOAD_TOKEN_TTL_MS).toISOString();
    const { error: rotateError } = await supabase
      .from("orders")
      .update({ download_token: newToken, download_expires_at: newExpiry })
      .eq("id", order.id);
    if (rotateError) return NextResponse.json({ error: "Gagal membuat link baru. Coba lagi." }, { status: 500 });

    const sent = await sendInvoiceEmail({
      full_name: order.full_name,
      email: order.email,
      tier_label: order.tier_label,
      amount: order.amount,
      midtrans_order_id: order.midtrans_order_id,
      downloadToken: newToken,
      cashbackCode: order.supplement_for ? null : order.cashback_code,
    });
    await supabase.from("orders").update({ email_status: sent ? "sent" : "failed" }).eq("id", order.id);

    await writeAudit(supabase, {
      action: "order_download_link_resend",
      target_type: "order",
      target_id: order.id,
      detail: sent ? "Link unduh baru dikirim ulang ke email pelanggan" : "Kirim ulang link gagal (email tidak terkirim)",
    });

    return NextResponse.json({ ok: true, resent: true, emailSent: sent });
  }

  const update: Record<string, unknown> = { status: normalizedStatus, admin_notes };
  if (typeof rejection_reason === "string") update.rejection_reason = rejection_reason;
  if (typeof rejection_type === "string") update.rejection_type = rejection_type || null;
  if (Number.isFinite(Number(amount_paid_by_customer))) update.amount_paid_by_customer = Number(amount_paid_by_customer);
  if (Number.isFinite(Number(amount_remaining))) update.amount_remaining = Number(amount_remaining);
  let emailSent: boolean | null = null;
  let emailKind: "invoice" | "rejected" | null = null;
  let parentApproved = false;
  let transitionClaimed = false;

  if (normalizedStatus === "paid" && order.status !== "paid") {
    const now = new Date();
    let downloadToken = order.download_token || generateDownloadToken();

    const { data: claimed, error: claimErr } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: now.toISOString(),
        download_token: downloadToken,
        download_expires_at: new Date(now.getTime() + DOWNLOAD_TOKEN_TTL_MS).toISOString(),
      })
      .eq("id", id)
      .eq("status", order.status)
      .select("id");
    if (claimErr) {
      return NextResponse.json({ error: "Gagal menyimpan." }, { status: 500 });
    }
    if (!(claimed && claimed.length > 0)) {
      await writeAudit(supabase, {
        action: "order_status_concurrent_skipped",
        target_type: "order",
        target_id: order.id,
        detail: `transisi ke paid dilewati (sudah diproses/double-click)`,
      });
      return NextResponse.json({ ok: true, skipped: true });
    }
    transitionClaimed = true;

    if (order.supplement_for) {
      const parentId = order.supplement_for;
      const { data: parent } = await supabase
        .from("orders")
        .select("id, status, email, full_name, tier_label, amount, midtrans_order_id, download_token, download_expires_at, cashback_code, email_status")
        .eq("id", parentId)
        .maybeSingle();
      if (parent && parent.status !== "paid") {
        const parentToken = parent.download_token || generateDownloadToken();
        const { data: parentClaimed } = await supabase
          .from("orders")
          .update({
            status: "paid",
            paid_at: now.toISOString(),
            download_token: parentToken,
            download_expires_at: new Date(now.getTime() + DOWNLOAD_TOKEN_TTL_MS).toISOString(),
          })
          .eq("id", parentId)
          .eq("status", parent.status)
          .select("id");
        if (parentClaimed && parentClaimed.length > 0) {
          const sent = await sendInvoiceEmail({
            full_name: parent.full_name,
            email: parent.email,
            tier_label: parent.tier_label,
            amount: parent.amount,
            midtrans_order_id: parent.midtrans_order_id,
            paid_at: now.toISOString(),
            downloadToken: parentToken,
            cashbackCode: parent.cashback_code,
          });
          await supabase.from("orders").update({ email_status: sent ? "sent" : "failed" }).eq("id", parentId);
          parentApproved = true;
        }
      }
    }

    emailSent = await sendInvoiceEmail({
      full_name: order.full_name,
      email: order.email,
      tier_label: order.tier_label,
      amount: order.amount,
      midtrans_order_id: order.midtrans_order_id,
      paid_at: now.toISOString(),
      downloadToken,
      cashbackCode: order.supplement_for ? null : order.cashback_code,
    });
    emailKind = "invoice";
    await supabase.from("orders").update({ email_status: emailSent ? "sent" : "failed" }).eq("id", id);
  } else if (
    REJECTED_STATUSES.includes(normalizedStatus) &&
    order.status !== normalizedStatus &&
    typeof rejection_reason === "string" &&
    rejection_reason.trim() !== "" &&
    !order.rejection_email_sent_at
  ) {
    const isInsufficient = rejection_type === "insufficient";

    const { data: claimed, error: claimErr } = await supabase
      .from("orders")
      .update({ status: normalizedStatus })
      .eq("id", id)
      .eq("status", order.status)
      .select("id");
    if (claimErr) return NextResponse.json({ error: "Gagal menyimpan." }, { status: 500 });
    if (!(claimed && claimed.length > 0)) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    transitionClaimed = true;

    emailSent = await sendOrderRejectedEmail({
      full_name: order.full_name,
      email: order.email,
      midtrans_order_id: order.midtrans_order_id,
      tier_label: order.tier_label,
      amount: order.amount,
      reason: rejection_reason,
      insufficient: isInsufficient,
      statusPageLink: order.download_token
        ? `${(process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "")}/order?token=${encodeURIComponent(order.download_token)}`
        : null,
    });
    emailKind = "rejected";
    if (emailSent) {
      await supabase.from("orders").update({ rejection_email_sent_at: new Date().toISOString() }).eq("id", id);
    }
  }

  let updateError: any = null;
  if (!transitionClaimed) {
    const { error } = await supabase.from("orders").update(update).eq("id", id);
    updateError = error;
  }
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

  if (parentApproved) {
    await writeAudit(supabase, {
      action: "order_supplement_approve_parent",
      target_type: "order",
      target_id: String(order.supplement_for),
      detail: `Order pelengkap Lunas → order induk otomatis Lunas + invoice induk terkirim`,
    });
  }

  await writeAudit(supabase, {
    action: "order_status_change",
    target_type: "order",
    target_id: order.id,
    detail: `${order.status || "-"} -> ${normalizedStatus}${emailDetail}`,
  });

  return NextResponse.json({ ok: true });
}