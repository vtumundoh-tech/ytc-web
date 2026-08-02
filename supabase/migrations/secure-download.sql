-- Migrasi: Unduhan aman (download token) + status email
-- Jalankan di Supabase Dashboard > SQL Editor (copy-paste lalu Run).

alter table public.orders add column if not exists download_token text;
alter table public.orders add column if not exists download_expires_at timestamptz;
alter table public.orders add column if not exists email_status text;