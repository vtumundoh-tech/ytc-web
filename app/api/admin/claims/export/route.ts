import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { buildXlsxBuffer, type XlsxColumn } from "@/lib/xlsxExport";

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

const COLUMNS: XlsxColumn[] = [
  { header: "No", key: "no", width: 5 },
  { header: "Tanggal", key: "tanggal", width: 18 },
  { header: "Nama", key: "nama", width: 24 },
  { header: "WhatsApp", key: "wa", width: 16 },
  { header: "Email", key: "email", width: 28 },
  { header: "Paket", key: "paket", width: 16 },
  { header: "Nominal Bayar (Rp)", key: "amountPaid", width: 18, numFmt: '"Rp" #,##0' },
  { header: "Status", key: "status", width: 14 },
  { header: "Bukti Bayar", key: "proofPayment", width: 30 },
  { header: "Bukti Follow/Subscribe", key: "proofFollow", width: 30 },
  { header: "Bukti Like & Comment", key: "proofLike", width: 34 },
  { header: "Bukti Share", key: "proofShare", width: 30 },
  { header: "Catatan", key: "catatan", width: 26 },
  { header: "IP", key: "ip", width: 16 },
  { header: "Browser", key: "browser", width: 18 },
  { header: "OS", key: "os", width: 16 },
  { header: "Device", key: "device", width: 14 },
];

export async function GET() {
  const supabase = supabaseServer() as any;
  const { data, error } = await supabase.from("cashback_claims").select("*").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Gagal memuat data." }, { status: 500 });

  const rows = (data || []).map((c: any, i: number) => ({
    no: i + 1,
    tanggal: fmtDateTime(c.created_at),
    nama: c.full_name ?? "",
    wa: c.whatsapp ?? "",
    email: c.email ?? "",
    paket: c.tier ? c.tier.replace("_", " ") : "",
    amountPaid: c.amount_paid ?? 0,
    status: STATUS_LABEL[c.status] || c.status || "",
    proofPayment: c.payment_proof_url ?? "",
    proofFollow: c.screenshot_follow_url ?? "",
    proofLike: joinUrls(c.screenshot_like_url),
    proofShare: c.screenshot_share_url ?? "",
    catatan: c.notes ?? "",
    ip: c.ip_address ?? "",
    browser: c.browser ?? "",
    os: c.os ?? "",
    device: c.device_type ?? "",
  }));

  const buf = await buildXlsxBuffer("Klaim Cashback", COLUMNS, rows);

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="klaim-cashback-${Date.now()}.xlsx"`,
    },
  });
}