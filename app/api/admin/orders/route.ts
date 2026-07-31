import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = supabaseServer() as any;
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, license_key, admin_notes } = body;
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  const supabase = supabaseServer() as any;
  const { error } = await supabase.from("orders").update({ status, license_key, admin_notes }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
