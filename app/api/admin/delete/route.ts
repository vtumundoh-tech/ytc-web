import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getClientIp, safeEqual } from "@/lib/security";
import { logSecurityEvent } from "@/lib/securityAlert";
import { writeAudit } from "@/lib/audit";
import { sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

const BUCKET = "cashback-proofs";
const MAX_IDS = 1000;

type TargetTable = "orders" | "claims" | "refunds";

const TABLES: Record<
  TargetTable,
  { label: string; emoji: string; fileCols: string[] }
> = {
  orders: { label: "Pesanan", emoji: "📦", fileCols: ["payment_proof_key"] },
  claims: {
    label: "Klaim Cashback",
    emoji: "🎁",
    fileCols: [
      "payment_proof_url",
      "screenshot_follow_url",
      "screenshot_like_url",
      "screenshot_share_url",
    ],
  },
  refunds: { label: "Refund", emoji: "💸", fileCols: ["refund_proof_key"] },
};

// Kolom file bisa berupa string path, JSON array of path, atau null.
function collectPaths(row: Record<string, any>, cols: string[]): string[] {
  const out: string[] = [];
  for (const col of cols) {
    const val = row[col];
    if (!val || typeof val !== "string") continue;
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        out.push(...parsed.filter((p: any) => typeof p === "string" && p.length > 0));
        continue;
      }
    } catch {
      // bukan JSON — perlakukan sebagai path tunggal
    }
    out.push(val);
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // Pembatasan kasar anti-hammer (verifikasi password gagal punya batas sendiri di bawah).
    const rlHammer = await checkRateLimit(rateLimitKey("admin-delete", ip), 10, 60_000);
    if (!rlHammer.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const password = String(body?.password ?? "");
    const scope = String(body?.scope ?? "");
    const table = String(body?.table ?? "") as TargetTable;
    const ids: string[] = Array.isArray(body?.ids) ? body.ids.map(String).slice(0, MAX_IDS) : [];
    const includeFiles = body?.includeFiles === true;

    const envPass = process.env.ADMIN_DELETE_PASSWORD;
    if (!envPass) {
      return NextResponse.json({ error: "ADMIN_DELETE_PASSWORD belum diset di server." }, { status: 500 });
    }

    if (!(await safeEqual(password, envPass))) {
      // Hitung HANYA percobaan gagal: maks 3x per 15 menit per IP.
      const rlFail = await checkRateLimit(rateLimitKey("admin-delete-fail", ip), 3, 15 * 60_000);
      const attemptNo = 3 - Math.max(0, rlFail.remaining);
      await logSecurityEvent({
        type: "delete_password_failed",
        ip,
        detail: rlFail.allowed
          ? `Percobaan ${attemptNo}/3 — terkunci sementara setelah 3x salah`
          : "Sudah terkunci sementara (3x salah dalam 15 menit)",
        userAgent: req.headers.get("user-agent"),
      });
      if (!rlFail.allowed) {
        return NextResponse.json(
          { error: "Percobaan salah 3x. Aksi hapus dikunci sementara 15 menit." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Password hapus salah. Sisa kesempatan: ${rlFail.remaining}x lagi.` },
        { status: 401 }
      );
    }

    if (scope !== "selected" && scope !== "all") {
      return NextResponse.json({ error: "Mode hapus tidak valid." }, { status: 400 });
    }
    if (scope === "selected" && (!TABLES[table] || ids.length === 0)) {
      return NextResponse.json({ error: "Tabel dan ID yang dipilih wajib diisi." }, { status: 400 });
    }

    const supabase = supabaseServer();
    const targets: TargetTable[] = scope === "all" ? ["orders", "claims", "refunds"] : [table];

    const summary: Array<{ key: TargetTable; rows: number; files: number }> = [];
    let totalRows = 0;
    let totalFiles = 0;

    for (const t of targets) {
      const cols = ["id", ...TABLES[t].fileCols].join(", ");
      let query = supabase.from(t).select(cols);
      if (scope === "selected") query = query.in("id", ids);

      const { data: rows, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      const list = (rows || []) as Record<string, any>[];
      if (list.length === 0) {
        summary.push({ key: t, rows: 0, files: 0 });
        continue;
      }

      const paths = new Set<string>();
      if (includeFiles) {
        for (const row of list) {
          for (const p of collectPaths(row, TABLES[t].fileCols)) paths.add(p);
        }
      }

      let filesDeleted = 0;
      if (paths.size > 0) {
        const { error: rmError } = await supabase.storage.from(BUCKET).remove(Array.from(paths));
        if (rmError) console.error(`[delete] storage.remove ${t}:`, rmError.message);
        filesDeleted = paths.size;
      }

      const { error: delError } = await supabase
        .from(t)
        .delete()
        .in("id", list.map((r) => r.id));
      if (delError) throw delError;

      summary.push({ key: t, rows: list.length, files: filesDeleted });
      totalRows += list.length;
      totalFiles += filesDeleted;

      await writeAudit(supabase, {
        action: scope === "all" ? `delete_all_${t}` : `delete_selected_${t}`,
        target_type: t,
        target_id: scope === "all" ? "*" : ids.join(","),
        detail: `${list.length} baris, ${filesDeleted} foto dihapus`,
      });
    }

    // Pembersihan file yatim (sisa dari penghapusan "data saja" sebelumnya).
    let orphans = 0;
    if (scope === "all" && includeFiles) {
      const allObjects: string[] = [];
      let offset = 0;
      for (;;) {
        const { data: objs, error: listError } = await supabase.storage
          .from(BUCKET)
          .list("", { limit: 1000, offset, sortBy: { column: "created_at", order: "asc" } });
        if (listError) break;
        const names = (objs || []).map((o) => o.name);
        allObjects.push(...names);
        if (names.length < 1000) break;
        offset += 1000;
      }
      if (allObjects.length > 0) {
        const chunk = 500;
        for (let i = 0; i < allObjects.length; i += chunk) {
          await supabase.storage.from(BUCKET).remove(allObjects.slice(i, i + chunk)).catch(() => null);
        }
        orphans = allObjects.length;
      }
    }

    const modeLabel =
      scope === "all"
        ? includeFiles
          ? "SEMUA DATA + SEMUA FOTO"
          : "SEMUA DATA (tanpa foto)"
        : `${TABLES[table].label} terpilih (${includeFiles ? "dengan foto" : "data saja"})`;

    const lines = [
      `🗑️ <b>DATA DIHAPUS</b> · #DataDihapus`,
      "",
      `⚙️ Mode   : ${modeLabel}`,
      ...summary.map(
        (s) => `${TABLES[s.key].emoji} ${TABLES[s.key].label.padEnd(14)}: ${s.rows} baris · ${s.files} foto`
      ),
      ...(orphans > 0 ? [`🧹 File yatim dibersihkan: ${orphans}`] : []),
      `📊 Total  : ${totalRows} baris · ${totalFiles + orphans} foto`,
      `🌐 IP     : <code>${ip}</code>`,
      `🕐 Waktu  : ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`,
    ];
    await sendTelegramMessage(lines.join("\n"));

    return NextResponse.json({ ok: true, totalRows, totalFiles, orphans, summary });
  } catch (err: any) {
    console.error("admin/delete error:", err);
    return NextResponse.json({ error: err?.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
