import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  paid: "Dibayar",
  rejected: "Ditolak",
};

function fmtDateTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function escapeCsv(val: unknown): string {
  const s = val === null || val === undefined ? "" : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function joinUrls(value: unknown): string {
  if (!value) return "";
  let urls: unknown[] = [];
  try {
    const parsed = JSON.parse(String(value));
    urls = Array.isArray(parsed) ? parsed : [String(value)];
  } catch {
    urls = [String(value)];
  }
  return urls.join(" | ");
}

export async function GET() {
  const supabase = supabaseServer() as any;
  const { data, error } = await supabase.from("cashback_claims").select("*").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Gagal memuat data." }, { status: 500 });

  const rows = data || [];
  const headers = [
    "No", "Tanggal", "Nama", "WhatsApp", "Email",
    "Paket", "Nominal Bayar (Rp)", "Status",
    "Bukti Bayar", "Bukti Follow/Subscribe", "Bukti Like & Comment", "Bukti Share",
    "Catatan", "IP", "Browser", "OS", "Device",
  ];

  const csvRows = rows.map((c: any, i: number) => [
    i + 1,
    fmtDateTime(c.created_at),
    escapeCsv(c.full_name),
    escapeCsv(c.whatsapp || ""),
    escapeCsv(c.email || ""),
    escapeCsv(c.tier || ""),
    c.amount_paid ?? "",
    STATUS_LABEL[c.status] || c.status,
    escapeCsv(c.payment_proof_url || ""),
    escapeCsv(c.screenshot_follow_url || ""),
    escapeCsv(joinUrls(c.screenshot_like_url)),
    escapeCsv(c.screenshot_share_url || ""),
    escapeCsv(c.notes || ""),
    escapeCsv(c.ip_address || ""),
    escapeCsv(c.browser || ""),
    escapeCsv(c.os || ""),
    escapeCsv(c.device_type || ""),
  ]);

  const csv = [
    headers.join(","),
    ...csvRows.map((r: (string | number)[]) => r.map(escapeCsv).join(",")),
  ].join("\n");

  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="klaim-cashback-${Date.now()}.csv"`,
    },
  });
}
