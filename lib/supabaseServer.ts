import { createClient } from "@supabase/supabase-js";

// PENTING: file ini hanya boleh dipakai di server (API routes / server components).
// Service role key bisa baca-tulis semua data tanpa dibatasi RLS, jangan pernah
// diimport dari komponen client ('use client').
export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars belum diset (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
