import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { writeAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "-");
}

export async function GET() {
  const supabase = supabaseServer() as any;
  const { data, error } = await supabase
    .from("referral_codes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Gagal memuat kode referral." }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, discount_amount, max_uses, description } = body || {};

    const cleaned = normalizeCode(String(code || ""));
    if (!cleaned || cleaned.length < 3) {
      return NextResponse.json({ error: "Kode harus minimal 3 karakter." }, { status: 400 });
    }
    const discount = Number(discount_amount);
    if (!Number.isFinite(discount) || discount <= 0) {
      return NextResponse.json({ error: "Nominal diskon harus lebih dari 0." }, { status: 400 });
    }
    const max = max_uses === undefined || max_uses === null || max_uses === "" ? null : Number(max_uses);
    if (max !== null && (!Number.isFinite(max) || max < 1)) {
      return NextResponse.json({ error: "Batas pemakaian tidak valid." }, { status: 400 });
    }

    const supabase = supabaseServer() as any;
    const { data, error } = await supabase
      .from("referral_codes")
      .insert({
        code: cleaned,
        discount_amount: discount,
        max_uses: max,
        active: true,
        description: typeof description === "string" && description.trim() !== "" ? description.trim() : null,
      })
      .select("*")
      .single();
    if (error) {
      if (String(error.code || "").startsWith("23505")) {
        return NextResponse.json({ error: "Kode sudah dipakai. Gunakan kode lain." }, { status: 409 });
      }
      return NextResponse.json({ error: "Gagal menyimpan kode referral." }, { status: 500 });
    }

    await writeAudit(supabase, {
      action: "referral_code_create",
      target_type: "referral_code",
      target_id: data.id,
      detail: `Kode ${cleaned} · diskon ${discount} rupiah · ${max === null ? "unlimited" : `maks ${max}x`}`,
    });

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("referral codes create error:", err);
    return NextResponse.json({ error: "Gagal menyimpan kode referral." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, active, max_uses } = body || {};
    if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

    const supabase = supabaseServer() as any;
    const { data: existing, error: fetchError } = await supabase
      .from("referral_codes")
      .select("id, code, discount_amount, max_uses, active")
      .eq("id", id)
      .maybeSingle();
    if (fetchError || !existing) {
      return NextResponse.json({ error: "Kode referral tidak ditemukan." }, { status: 404 });
    }

    const update: Record<string, unknown> = {};
    if (typeof active === "boolean") update.active = active;
    if (max_uses !== undefined) {
      const max = max_uses === null || max_uses === "" ? null : Number(max_uses);
      if (max !== null && (!Number.isFinite(max) || max < 1)) {
        return NextResponse.json({ error: "Batas pemakaian tidak valid." }, { status: 400 });
      }
      update.max_uses = max;
    }

    const { data, error } = await supabase
      .from("referral_codes")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: "Gagal memperbarui kode referral." }, { status: 500 });

    const detail =
      typeof active === "boolean"
        ? active
          ? `Kode ${existing.code} diaktifkan kembali`
          : `Kode ${existing.code} dinonaktifkan`
        : `Kode ${existing.code} batas pemakaian diubah menjadi ${max_uses === null ? "unlimited" : `${max_uses}x`}`;
    await writeAudit(supabase, {
      action: "referral_code_update",
      target_type: "referral_code",
      target_id: id,
      detail,
    });

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("referral codes update error:", err);
    return NextResponse.json({ error: "Gagal memperbarui kode referral." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

    const supabase = supabaseServer() as any;
    const { data: existing, error: fetchError } = await supabase
      .from("referral_codes")
      .select("id, code")
      .eq("id", id)
      .maybeSingle();
    if (fetchError || !existing) {
      return NextResponse.json({ error: "Kode referral tidak ditemukan." }, { status: 404 });
    }

    const { error } = await supabase.from("referral_codes").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Gagal menghapus kode referral." }, { status: 500 });

    await writeAudit(supabase, {
      action: "referral_code_delete",
      target_type: "referral_code",
      target_id: id,
      detail: `Kode ${existing.code} dihapus`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("referral codes delete error:", err);
    return NextResponse.json({ error: "Gagal menghapus kode referral." }, { status: 500 });
  }
}