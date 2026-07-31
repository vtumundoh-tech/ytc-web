import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = supabaseServer() as any;
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data || [];
  const headers = [
    "Order ID", "Tanggal", "Nama", "WhatsApp", "Email",
    "Tier", "Jumlah", "Status", "Metode Bayar",
    "Key Lisensi", "Catatan Admin",
  ];

  const csvRows = rows.map((o: any) => [
    o.midtrans_order_id,
    o.created_at ? new Date(o.created_at).toISOString().split("T")[0] : "",
    escapeCsv(o.full_name),
    o.whatsapp,
    o.email || "",
    o.tier_label,
    o.amount,
    o.status,
    o.payment_type || "",
    o.license_key || "",
    escapeCsv(o.admin_notes || ""),
  ]);

  const csv = [
    headers.join(","),
    ...csvRows.map((r: string[]) => r.join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-export-${Date.now()}.csv"`,
    },
  });
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
