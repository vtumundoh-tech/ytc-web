import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const BUCKET = "cashback-proofs";
const SIGN_EXPIRY_SECONDS = 60 * 60;

const CLAIM_STATUSES = ["pending", "approved", "paid", "rejected"];

type Claim = {
  id: string;
  payment_proof_url: string | null;
  screenshot_follow_url: string | null;
  screenshot_like_url: string | null;
  screenshot_share_url: string | null;
  [key: string]: any;
};

async function signedUrl(supabase: any, path: string | null): Promise<string> {
  if (!path) return "";
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGN_EXPIRY_SECONDS);
  if (error || !data) return "";
  return data.signedUrl;
}

async function signClaimFields(supabase: any, claim: Claim): Promise<Claim> {
  const [payment, follow, share] = await Promise.all([
    signedUrl(supabase, claim.payment_proof_url),
    signedUrl(supabase, claim.screenshot_follow_url),
    signedUrl(supabase, claim.screenshot_share_url),
  ]);

  let like: string[] = [];
  try {
    const parsed = JSON.parse(claim.screenshot_like_url || "[]");
    if (Array.isArray(parsed)) like = parsed;
  } catch {
    if (claim.screenshot_like_url) like = [claim.screenshot_like_url];
  }
  const signedLikes = await Promise.all(like.map((p) => signedUrl(supabase, p)));

  return {
    ...claim,
    payment_proof_url: payment,
    screenshot_follow_url: follow,
    screenshot_like_url: signedLikes.length ? JSON.stringify(signedLikes) : "",
    screenshot_share_url: share,
  };
}

export async function GET() {
  const supabase = supabaseServer() as any;
  const { data, error } = await supabase.from("cashback_claims").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Gagal memuat data." }, { status: 500 });
  const signed = await Promise.all((data || []).map((c: Claim) => signClaimFields(supabase, c)));
  return NextResponse.json({ data: signed });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, admin_notes } = body || {};
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  const normalizedStatus = String(status || "").toLowerCase();
  if (normalizedStatus && !CLAIM_STATUSES.includes(normalizedStatus)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  const supabase = supabaseServer() as any;
  const update: Record<string, unknown> = { status: normalizedStatus, admin_notes };
  if (normalizedStatus === "paid") update.paid_at = new Date().toISOString();

  const { error } = await supabase.from("cashback_claims").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: "Gagal menyimpan." }, { status: 500 });
  return NextResponse.json({ ok: true });
}