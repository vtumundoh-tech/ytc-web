-- Migrasi: Perbaiki skema cashback_claims (kolom URL bukti + relaksasi NOT NULL)
-- Jalankan di Supabase Dashboard > SQL Editor (lampirkan salin-tempel).

-- 1) Tambah kolom URL bukti jika belum ada (perbaiki error 'payment_proof_url ... schema cache')
alter table public.cashback_claims add column if not exists payment_proof_url text;
alter table public.cashback_claims add column if not exists screenshot_follow_url text;
alter table public.cashback_claims add column if not exists screenshot_like_url text;
alter table public.cashback_claims add column if not exists screenshot_share_url text;

-- 2) Email untuk konfirmasi klaim
alter table public.cashback_claims add column if not exists email text;

-- 3) Relaksasi NOT NULL: machine_id / license_key tidak lagi diinput, dan beberapa bukti opsional
alter table public.cashback_claims alter column whatsapp drop not null;
alter table public.cashback_claims alter column machine_id drop not null;
alter table public.cashback_claims alter column license_key drop not null;
alter table public.cashback_claims alter column screenshot_follow_url drop not null;
alter table public.cashback_claims alter column screenshot_like_url drop not null;
alter table public.cashback_claims alter column screenshot_share_url drop not null;

-- 4) Segarkan cache skema PostgREST agar kolom baru langsung dikenali
notify pgrst, 'reload schema';