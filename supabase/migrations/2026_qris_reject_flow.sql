-- =============================================================
--  Migrasi: Penolakan order (email ke pelanggan) + info nominal QRIS
--  Jalankan di Supabase Dashboard > SQL Editor > New Query > Run
-- =============================================================

-- 1. Alasan penolakan (dikirim ke email pelanggan saat status cancelled/failed)
alter table public.orders add column if not exists rejection_reason text;

-- 2. Cegah email penolakan terkirim dua kali
alter table public.orders add column if not exists rejection_email_sent_at timestamptz;

-- 3. Info nominal yang tampil di modal QRIS (bisa diedit admin di Pengaturan)
alter table public.app_settings add column if not exists qris_payment_notice text;