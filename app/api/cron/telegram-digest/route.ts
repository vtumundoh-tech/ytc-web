// =============================================================
//  CRON: RINGKASAN & PENGINGAT PENCARIAN CASHBACK KE TELEGRAM
// =============================================================
//  STATUS: NONAKTIF (seluruh isi di-comment).
//
//  Fungsi ini disiapkan untuk jaga-jaga jika nanti di-host di VPS
//  dan ingin pengingat otomatis harian. Saat ini pengingat tidak
//  dipakai — perintah bot manual `/listcb` / `/listo` sudah cukup.
//
//  CARA MENGAKTIFKAN DI VPS:
//   1. Hapus komentar pada seluruh file di bawah.
//   2. Set jadwal di cron VPS, misal tiap hari 09:00 WIB:
//       0 2 * * * curl -s -X GET https://domain.com/api/cron/telegram-digest
//   3. Pastikan env TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID terisi.
//
//  Catatan: route ini sengaja TIDAK di bawah /api/admin agar tidak
//  terkunci middleware session admin (dipanggil oleh cron/curl).
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { safeEqual } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const CRON_SECRET = process.env.CRON_SECRET;
  if (CRON_SECRET) {
    const auth = (req.headers.get("authorization") || "")
      .replace(/^Bearer\s+/i, "")
      .trim();
    if (!auth || !(await safeEqual(auth, CRON_SECRET))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ----- CUKUP KEMBALIKAN OK; LOGIKA DIGEST DI-COMMENT DI BAWAH -----
  return NextResponse.json({ ok: true, enabled: false });

  // ================== MULAI BAGIAN YANG DI-COMMENT ==================
  // import { supabaseServer } from "@/lib/supabaseServer";
  // import { sendTelegramMessage } from "@/lib/telegram";
  //
  // const CRON_SECRET = process.env.CRON_SECRET;
  // if (CRON_SECRET) {
  //   const auth = (req.headers.get("authorization") || "").replace(/^Bearer /i, "");
  //   if (auth !== CRON_SECRET) {
  //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  //   }
  // }
  //
  // const supabase = supabaseServer();
  // const now = Date.now();
  //
  // // --- Ringkasan klaim cashback ---
  // const { data: claims, error: claimsError } = await supabase
  //   .from("cashback_claims")
  //   .select("*")
  //   .order("created_at", { ascending: false });
  // if (claimsError) return NextResponse.json({ error: claimsError.message }, { status: 500 });
  //
  // const all = claims || [];
  // const paid = all.filter((c) => c.status === "paid").length;
  // const approved = all.filter((c) => c.status === "approved").length;
  // const pending = all.filter((c) => c.status === "pending").length;
  // const rejected = all.filter((c) => c.status === "rejected").length;
  //
  // const DAY = 24 * 60 * 60 * 1000;
  // const due = all.filter((c) => {
  //   if (c.status === "paid" || c.status === "rejected") return false;
  //   const days = Math.floor((now - new Date(c.created_at).getTime()) / DAY);
  //   return days >= 5; // jendela pencairan 5–7 hari setelah submit
  // });
  //
  // const lines = [
  //   "📊 RINGKASAN CASHBACK · #Ringkasan",
  //   `Total: ${all.length} · Dibayar: ${paid} · Disetujui: ${approved} · Menunggu: ${pending} · Ditolak: ${rejected}`,
  // ];
  //
  // if (due.length > 0) {
  //   lines.push("", "⏰ PERLU SEGERA DICAIRKAN (≥5 hari, belum dibayar):");
  //   for (const c of due.slice(0, 30)) {
  //     const days = Math.floor((now - new Date(c.created_at).getTime()) / DAY);
  //     lines.push(`• ${c.full_name} · ${c.tier} · status ${c.status} · submit ${c.created_at} (hari ke-${days + 1})`);
  //   }
  //   if (due.length > 30) lines.push(`…dan ${due.length - 30} lagi`);
  // } else {
  //   lines.push("", "Tidak ada klaim yang perlu segera dicairkan. 🎉");
  // }
  //
  // await sendTelegramMessage(lines.join("\n"));
  //
  // return NextResponse.json({ ok: true, sent: true });
  // ================== SELESAI BAGIAN YANG DI-COMMENT ==================
}
