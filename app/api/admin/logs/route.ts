import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const SECURITY_ACTIONS = [
  "gate_failed",
  "login_failed",
  "login_ok",
  "unauthorized_access",
  "delete_password_failed",
];

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  try {
    const filter = req.nextUrl.searchParams.get("filter") || "all";
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10) || 1);

    const supabase = supabaseServer();
    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (filter === "security") query = query.in("action", SECURITY_ACTIONS);
    else if (filter === "delete") query = query.like("action", "delete%");
    else if (filter !== "all" && filter.length > 0) query = query.eq("action", filter);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      ok: true,
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
      logs: data || [],
    });
  } catch (err: any) {
    console.error("admin/logs error:", err);
    return NextResponse.json({ error: err?.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
