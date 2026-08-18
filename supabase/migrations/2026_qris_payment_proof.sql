-- =============================================================
--  Migrasi: Bukti bayar QRIS + bucket publik untuk gambar QRIS
--  Jalankan di Supabase Dashboard > SQL Editor > New Query > Run
-- =============================================================

-- 1. Simpan path bukti bayar (screenshot) yang diupload pelanggan di bucket privat
alter table public.orders add column if not exists payment_proof_key text;

-- 2. Bucket PUBLIC untuk gambar QRIS statis (admin upload dari dashboard).
--    Berbeda dari bucket privat 'cashback-proofs' yang untuk bukti klaim.
insert into storage.buckets (id, name, public)
values ('qris-assets', 'qris-assets', true)
on conflict (id) do nothing;