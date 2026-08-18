import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import {
  validateFileSignature,
  validateFileSize,
  isAllowedMimeType,
} from "@/lib/fileValidation";

const BUCKET = "qris-assets";

function randomHex(len: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "File gambar QRIS wajib dipilih." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (!validateFileSize(arrayBuffer.byteLength)) {
      return NextResponse.json({ error: "File terlalu besar (maks 5MB)." }, { status: 400 });
    }
    const mime = file.type || "image/png";
    if (!isAllowedMimeType(mime) || !validateFileSignature(arrayBuffer, mime)) {
      return NextResponse.json({ error: "File tidak valid. Hanya JPEG/PNG/WebP yang diperbolehkan." }, { status: 400 });
    }

    const ext = mime.split("/")[1] || "png";
    const path = `qris-${Date.now()}-${randomHex(6)}.${ext}`;

    const supabase = supabaseServer();
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(arrayBuffer), {
      contentType: mime,
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ ok: true, publicUrl: publicData.publicUrl });
  } catch (err: any) {
    console.error("qris-image error:", err);
    return NextResponse.json({ error: "Gagal mengunggah gambar QRIS. Coba lagi." }, { status: 500 });
  }
}