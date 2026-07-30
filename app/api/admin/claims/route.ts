import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from("cashback_claims").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, admin_notes } = body;
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  const update: Record<string, any> = {};
  if (status !== undefined) update.status = status;
  if (admin_notes !== undefined) update.admin_notes = admin_notes;

  const supabase = supabaseServer();
  const { error } = await supabase.from("cashback_claims").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
