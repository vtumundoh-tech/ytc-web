-- =============================================================
--  Migrasi: Hardening konkurensi (anti double-click / race condition)
--  Jalankan di Supabase Dashboard > SQL Editor > New Query > Run
-- =============================================================

-- 1. Cegah duplicate permintaan refund per order (pending/processed)
create unique index if not exists idx_refund_requests_unique_open
  on public.refund_requests (order_id)
  where status in ('pending', 'processed');

-- 2. Cegah dua pembayaran pelengkap aktif untuk order yang sama
create unique index if not exists idx_orders_supplement_unique_open
  on public.orders (supplement_for)
  where supplement_for is not null and status in ('pending', 'paid');

-- 3. Cegah license key / download token ganda (opsional, bila mau)
-- create unique index if not exists idx_orders_license_key_unique
--   on public.orders (license_key)
--   where license_key is not null;
