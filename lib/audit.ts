export async function writeAudit(
  supabase: any,
  entry: { action: string; target_type: string; target_id: string; detail?: string | null }
): Promise<void> {
  try {
    const { error } = await supabase.from("audit_logs").insert({
      action: entry.action,
      target_type: entry.target_type,
      target_id: entry.target_id,
      detail: entry.detail || null,
      created_at: new Date().toISOString(),
    });
    if (error) console.error("[audit] insert error:", error.message);
  } catch (err: any) {
    console.error("[audit] error:", err?.message || err);
  }
}