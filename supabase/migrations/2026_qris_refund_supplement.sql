-- =============================================================
--  Migrasi: Refund & pembayaran pelengkap (pembayaran kurang)
--  Jalankan di Supabase Dashboard > SQL Editor > New Query > Run
-- =============================================================

-- 1. Kolom penolakan pembayaran kurang + sisa nominal
alter table public.orders add column if not exists rejection_type text;
alter table public.orders add column if not exists amount_paid_by_customer integer;
alter table public.orders add column if not exists amount_remaining integer;

-- 2. Order pelengkap (pembayaran kekurangan) terhubung ke order induk
alter table public.orders add column if not exists supplement_for uuid;

-- 3. Tabel permintaan refund dari pelanggan
create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id uuid references public.orders(id) on delete cascade,
  full_name text not null,
  email text,
  whatsapp text,
  tier_label text,
  amount integer,
  status text not null default 'pending', -- pending | processed | cancelled
  refund_proof_key text, -- bukti transfer refund (upload admin)
  admin_notes text,
  processed_at timestamptz
);

create index if not exists idx_refund_requests_status on public.refund_requests(status);
create index if not exists idx_refund_requests_order on public.refund_requests(order_id);

alter table public.refund_requests enable row level security;
