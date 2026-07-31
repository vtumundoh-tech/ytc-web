import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = supabaseServer() as any;
  const { data, error } = await supabase.from("cashback_claims").select("*").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data || [];
  const headers = [
    "Claim ID", "Tanggal", "Nama", "WhatsApp", "Machine ID",
    "Key Lisensi", "Tier", "Addon 1080p", "Jumlah Bayar", "Bukti Bayar",
    "Status", "Catatan Admin", "IP", "Browser", "OS", "Device",
  ];

  const csvRows = rows.map((c: any) => [
    c.id.slice(0, 8),
    c.created_at ? new Date(c.created_at).toISOString().split("T")[0] : "",
    escapeCsv(c.full_name),
    c.whatsapp,
    c.machine_id,
    c.license_key,
    c.tier,
    c.addon_1080p === "yes" ? "Ya" : "Tidak",
    c.amount_paid,
    c.payment_proof_url || "",
    c.status,
    escapeCsv(c.admin_notes || ""),
    c.ip_address || "",
    c.browser || "",
    c.os || "",
    c.device_type || "",
  ]);

  const csv = [
    headers.join(","),
    ...csvRows.map((r: string[]) => r.join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="claims-export-${Date.now()}.csv"`,
    },
  });
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
