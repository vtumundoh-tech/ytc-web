import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  paid: "Lunas",
  expired: "Kedaluwarsa",
  failed: "Gagal",
  cancelled: "Dibatalkan",
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

export async function GET() {
  const supabase = supabaseServer() as any;
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Gagal memuat data." }, { status: 500 });

  const rows = data || [];
  const headers = [
    "No", "Tanggal", "Nama", "WhatsApp", "Email",
    "Paket", "Total (Rp)", "Status", "Metode Bayar",
    "Order ID", "Machine ID", "Key Lisensi", "Email Invoice",
    "Catatan", "IP", "Browser", "OS", "Device",
  ];

  const csvRows = rows.map((o: any, i: number) => [
    i + 1,
    fmtDateTime(o.created_at),
    escapeCsv(o.full_name),
    escapeCsv(o.whatsapp || ""),
    escapeCsv(o.email || ""),
    escapeCsv(o.tier_label || ""),
    o.amount ?? "",
    STATUS_LABEL[o.status] || o.status,
    escapeCsv(o.payment_type || ""),
    escapeCsv(o.midtrans_order_id || ""),
    escapeCsv(o.machine_id || ""),
    escapeCsv(o.license_key || ""),
    o.email_status === "sent" ? "Terkirim" : o.email_status === "failed" ? "Gagal" : "",
    escapeCsv(o.admin_notes || ""),
    escapeCsv(o.ip_address || ""),
    escapeCsv(o.browser || ""),
    escapeCsv(o.os || ""),
    escapeCsv(o.device_type || ""),
  ]);

  const csv = [
    headers.join(","),
    ...csvRows.map((r: (string | number)[]) => r.map(escapeCsv).join(",")),
  ].join("\n");

  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pembelian-${Date.now()}.csv"`,
    },
  });
}
