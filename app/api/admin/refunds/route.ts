import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { sendRefundSentEmail } from "@/lib/mail";
import {
  validateFileSignature,
  validateFileSize,
  isAllowedMimeType,
} from "@/lib/fileValidation";

const BUCKET = "cashback-proofs";
const SIGN_EXPIRY_SECONDS = 60 * 60;

function randomHex(len: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function signedUrl(supabase: any, path: string | null): Promise<string> {
  if (!path) return "";
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGN_EXPIRY_SECONDS);
  if (error || !data) return "";
  return data.signedUrl;
}

export async function GET() {
  const supabase = supabaseServer() as any;
  const { data, error } = await supabase
    .from("refund_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Gagal memuat data." }, { status: 500 });

  const rows = await Promise.all(
    (data || []).map(async (r: any) => ({
      ...r,
      refund_proof_url: await signedUrl(supabase, r.refund_proof_key),
      customer_proof_url: r.order_id
        ? await (async () => {
            const { data: o } = await supabase
              .from("orders")
              .select("payment_proof_key")
              .eq("id", r.order_id)
              .maybeSingle();
            return o?.payment_proof_key ? signedUrl(supabase, o.payment_proof_key) : "";
          })()
        : "",
    }))
  );
  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const id = String(form.get("id") || "");
    const adminNotes = String(form.get("admin_notes") || "").trim() || null;
    const file = form.get("proofFile") as File | null;

    if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
    if (!file) return NextResponse.json({ error: "Bukti transfer refund wajib diunggah." }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    if (!validateFileSize(arrayBuffer.byteLength)) {
      return NextResponse.json({ error: "File terlalu besar (maks 5MB)." }, { status: 400 });
    }
    const mime = file.type || "image/jpeg";
    if (!isAllowedMimeType(mime) || !validateFileSignature(arrayBuffer, mime)) {
      return NextResponse.json({ error: "File tidak valid. Hanya JPEG/PNG/WebP yang diperbolehkan." }, { status: 400 });
    }

    const supabase = supabaseServer() as any;
    const { data: existing, error: fetchError } = await supabase
      .from("refund_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (fetchError || !existing) {
      return NextResponse.json({ error: "Permintaan refund tidak ditemukan." }, { status: 404 });
    }
    if (existing.status !== "pending") {
      return NextResponse.json({ error: "Permintaan ini sudah diproses." }, { status: 409 });
    }

    const ext = mime.split("/")[1] || "jpg";
    const path = `refund-${Date.now()}-${randomHex(6)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(arrayBuffer), {
      contentType: mime,
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("refund_requests")
      .update({ status: "processed", refund_proof_key: path, admin_notes: adminNotes, processed_at: now })
      .eq("id", id);
    if (updateError) throw updateError;

    const emailSent = await sendRefundSentEmail({
      full_name: existing.full_name,
      email: existing.email,
      tier_label: existing.tier_label || "—",
      amount: existing.amount,
      adminNotes: adminNotes || "",
      attachment: {
        filename: `bukti-refund-${existing.order_id?.slice(0, 8) || id}.${ext}`,
        content: Buffer.from(arrayBuffer),
        contentType: mime,
      },
    });

    return NextResponse.json({ ok: true, emailSent });
  } catch (err: any) {
    console.error("admin refunds error:", err);
    return NextResponse.json({ error: "Gagal memproses refund. Coba lagi." }, { status: 500 });
  }
}