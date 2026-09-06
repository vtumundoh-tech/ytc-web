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
// Di atas jumlah hari ini, grafik otomatis diagregasi per bulan agar tetap terbaca.
const MAX_DAILY_DAYS = 62;

function rangeParams(req: NextRequest): { from: string | null; to: string | null } {
  const from = (req.nextUrl.searchParams.get("from") || "").trim();
  const to = (req.nextUrl.searchParams.get("to") || "").trim();
  return {
    from: /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : null,
    to: /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : null,
  };
}

function applyRange<T extends { gte: (c: string, v: string) => T; lte: (c: string, v: string) => T }>(
  query: T,
  from: string | null,
  to: string | null
): T {
  if (from) query = query.gte("created_at", `${from}T00:00:00`);
  if (to) query = query.lte("created_at", `${to}T23:59:59.999999`);
  return query;
}

async function buildStats(
  supabase: ReturnType<typeof supabaseServer>,
  from: string | null,
  to: string | null
) {
  let q = applyRange(
    supabase.from("audit_logs").select("created_at, action").order("created_at", { ascending: false }).limit(5000),
    from,
    to
  );
  const { data } = await q;
  const rows = (data || []) as Array<{ created_at: string; action: string }>;

  // Tentukan granularitas dari rentang efektif (atau default: per hari).
  let granularity: "daily" | "monthly" = "daily";
  if (from && to) {
    const days = Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1;
    if (days > MAX_DAILY_DAYS) granularity = "monthly";
  }

  const dayMap = new Map<string, { keamanan: number; hapus: number }>();
  const byAction = new Map<string, number>();

  for (const row of rows) {
    byAction.set(row.action, (byAction.get(row.action) || 0) + 1);
    const key = granularity === "daily" ? row.created_at.slice(0, 10) : row.created_at.slice(0, 7);
    const bucket = dayMap.get(key) || { keamanan: 0, hapus: 0 };
    if (SECURITY_ACTIONS.includes(row.action)) bucket.keamanan++;
    else if (row.action.startsWith("delete")) bucket.hapus++;
    dayMap.set(key, bucket);
  }

  const perDay = Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, v]) => ({ key, ...v }));

  return {
    granularity,
    perDay,
    totalSecurity: rows.filter((r) => SECURITY_ACTIONS.includes(r.action)).length,
    totalDelete: rows.filter((r) => r.action.startsWith("delete")).length,
    byAction: Object.fromEntries(byAction),
  };
}

export async function GET(req: NextRequest) {
  try {
    const filter = req.nextUrl.searchParams.get("filter") || "all";
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10) || 1);
    const withStats = req.nextUrl.searchParams.get("stats") === "1";
    const { from, to } = rangeParams(req);

    const supabase = supabaseServer();
    let query = applyRange(
      supabase.from("audit_logs").select("*", { count: "exact" }),
      from,
      to
    )
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (filter === "security") query = query.in("action", SECURITY_ACTIONS);
    else if (filter === "delete") query = query.like("action", "delete%");
    else if (filter !== "all" && filter.length > 0) query = query.eq("action", filter);

    const { data, error, count } = await query;
    if (error) throw error;

    const stats = withStats ? await buildStats(supabase, from, to) : null;

    return NextResponse.json({
      ok: true,
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
      logs: data || [],
      stats,
    });
  } catch (err: any) {
    console.error("admin/logs error:", err);
    return NextResponse.json({ error: err?.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
