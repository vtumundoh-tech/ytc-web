-- =============================================================
--  Migrasi: Referral code + batas klaim cashback
--  Jalankan di Supabase Dashboard > SQL Editor > New Query > Run
-- =============================================================

-- 1) Tabel referral codes
create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_amount integer not null default 0,
  max_uses integer, -- null = unlimited
  current_uses integer not null default 0,
  active boolean not null default true,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_referral_codes_code on public.referral_codes(code);

-- 2) Referral pada orders
alter table public.orders add column if not exists referral_code text;
alter table public.orders add column if not exists referral_discount integer;

-- 3) Cashback code pada cashback_claims (untuk hitung batas klaim rejected)
alter table public.cashback_claims add column if not exists cashback_code text;

-- 4) Kurs tetap untuk tampilan harga dolar (display only, tanpa API live)
alter table public.app_settings add column if not exists usd_rate numeric not null default 16000;
alter table public.app_settings add column if not exists usd_rate_label text;

-- 5) RLS aktif untuk tabel baru
alter table public.referral_codes enable row level security;
-- Tidak ada policy untuk anon/authenticated -> hanya bisa diakses lewat
-- service role key di server (API route). Status kode dicek server-side.

-- Segarkan cache skema PostgREST agar kolom baru langsung dikenali
notify pgrst, 'reload schema';