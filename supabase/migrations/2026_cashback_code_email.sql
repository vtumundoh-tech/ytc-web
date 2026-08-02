-- Migrasi: Kode unik cashback + email claim
-- Jalankan di Supabase Dashboard > SQL Editor (lampirkan salin-tempel).

-- 1) Tambah kolom cashback_code di orders (kode unik untuk klaim cashback)
alter table public.orders add column if not exists cashback_code text;

-- 2) Pastikan kode unik (boleh null, tapi tidak boleh duplikat untuk yang terisi)
create unique index if not exists orders_cashback_code_key
  on public.orders (cashback_code)
  where cashback_code is not null;

-- 3) Tambah kolom email di cashback_claims
alter table public.cashback_claims add column if not exists email text;

-- 4) Machine ID & key tidak lagi diinput pada klaim cashback -> izinkan null
alter table public.cashback_claims alter column machine_id drop not null;
alter table public.cashback_claims alter column license_key drop not null;