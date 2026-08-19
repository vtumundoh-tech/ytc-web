-- =============================================================
--  Migrasi: Verifikasi email saat pembelian (kode OTP)
--  Jalankan di Supabase Dashboard > SQL Editor > New Query > Run
-- =============================================================

create table if not exists public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  locked_until timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_verifications_email on public.email_verifications(email);
create index if not exists idx_email_verifications_created on public.email_verifications(created_at desc);

alter table public.email_verifications enable row level security;