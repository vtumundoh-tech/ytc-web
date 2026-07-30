import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import {
  validateFileSignature,
  validateFileSize,
  isAllowedMimeType,
} from "@/lib/fileValidation";

const BUCKET = "cashback-proofs";
const MAX_FILE_BYTES = 5 * 1024 * 1024;

async function uploadProof(supabase: ReturnType<typeof supabaseServer>, file: File, prefix: string) {
  const arrayBuffer = await file.arrayBuffer();

  if (!validateFileSize(arrayBuffer.byteLength)) {
    throw new Error(`File ${file.name} terlalu besar (maks 5MB).`);
  }

  const mime = file.type || "image/jpeg";
  if (!isAllowedMimeType(mime) || !validateFileSignature(arrayBuffer, mime)) {
    throw new Error(`File ${file.name} tidak valid. Hanya JPEG/PNG/WebP yang diperbolehkan.`);
  }

  const ext = mime.split("/")[1] || "jpg";
  const path = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(arrayBuffer), {
    contentType: mime,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = checkRateLimit(rateLimitKey("cashback", ip), 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const form = await req.formData();
    const fullName = form.get("fullName") as string;
    const whatsapp = form.get("whatsapp") as string;
    const machineId = form.get("machineId") as string;
    const licenseKey = form.get("licenseKey") as string;
    const tier = form.get("tier") as string;
    const addon = (form.get("addon1080") || form.get("addon")) as string;
    const amountPaid = Number(form.get("amountPaid"));
    const notes = (form.get("notes") as string) || null;
    const agreeSnk = form.get("agreeSnk") as string;
    const screenshotFollow = form.get("screenshotFollow") as File | null;
    const screenshotLike = form.get("screenshotLike") as File | null;
    const screenshotShare = form.get("screenshotShare") as File | null;

    if (!fullName || !whatsapp || !machineId || !licenseKey || !tier || !amountPaid) {
      return NextResponse.json({ error: "Data belum lengkap." }, { status: 400 });
    }
    if (!screenshotFollow || !screenshotLike || !screenshotShare) {
      return NextResponse.json({ error: "Semua screenshot bukti wajib dilampirkan." }, { status: 400 });
    }
    if (agreeSnk !== "yes") {
      return NextResponse.json({ error: "Anda harus setuju dengan Syarat & Ketentuan." }, { status: 400 });
    }

    const supabase = supabaseServer();

    const [followUrl, likeUrl, shareUrl] = await Promise.all([
      uploadProof(supabase, screenshotFollow, "follow"),
      uploadProof(supabase, screenshotLike, "like"),
      uploadProof(supabase, screenshotShare, "share"),
    ]);

    const { error: insertError } = await supabase.from("cashback_claims").insert({
      full_name: fullName,
      whatsapp,
      machine_id: machineId,
      license_key: licenseKey,
      tier,
      addon_1080p: addon,
      amount_paid: amountPaid,
      screenshot_follow_url: followUrl,
      screenshot_like_url: likeUrl,
      screenshot_share_url: shareUrl,
      notes,
      agree_snk: true,
      status: "pending",
    });
    if (insertError) throw insertError;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("cashback error:", err);
    return NextResponse.json({ error: err.message || "Gagal mengirim klaim." }, { status: 500 });
  }
}
