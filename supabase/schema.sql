-- Jalankan seluruh file ini di Supabase Dashboard > SQL Editor > New Query > Run
-- (Jika tabel sudah ada (project lama), jalankan migration.sql dulu sebelum ini)

-- ========== TABEL ORDERS (Pembelian) ==========
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  whatsapp text not null,
  email text,
  bank_account text, -- opsional: no rekening tujuan jika refund/keperluan lain
  tier text not null, -- contoh: 'weekly_1080'
  tier_label text not null, -- label harga yang tampil, contoh: '7 Hari (1080p) — Rp 37.000'
  amount integer not null, -- nominal dalam Rupiah
  machine_id text, -- diisi setelah user install aplikasi (boleh kosong saat checkout)
  status text not null default 'pending', -- pending | paid | expired | failed | cancelled
  ref_id text unique not null,
  goqris_trx_id text,
  payment_type text, -- metode pembayaran (qris)
  license_key text, -- diisi manual oleh admin setelah key dibuat & dikirim
  admin_notes text,
  paid_at timestamptz
);

create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at desc);

-- ========== TABEL CASHBACK_CLAIMS ==========
create table if not exists cashback_claims (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  whatsapp text not null,
  machine_id text not null,
  license_key text not null,
  tier text not null,
  addon_1080p text, -- 'no' atau kode addon
  amount_paid integer not null,
  screenshot_follow_url text not null,
  screenshot_like_url text not null,
  screenshot_share_url text not null,
  notes text,
  status text not null default 'pending', -- pending | approved | paid | rejected
  admin_notes text
);

create index if not exists idx_claims_status on cashback_claims(status);
create index if not exists idx_claims_created_at on cashback_claims(created_at desc);

-- ========== ROW LEVEL SECURITY ==========
-- RLS diaktifkan. Semua akses dari app dilakukan lewat API route server
-- (pakai Service Role Key yang otomatis bypass RLS), dari sisi client
-- (anon key) tidak ada akses langsung sama sekali.
alter table orders enable row level security;
alter table cashback_claims enable row level security;
-- Tidak ada policy yang dibuat untuk anon/authenticated -> otomatis semua akses
-- ditolak kecuali lewat service role key di server.

-- ========== STORAGE BUCKET untuk screenshot bukti cashback ==========
insert into storage.buckets (id, name, public)
values ('cashback-proofs', 'cashback-proofs', true)
on conflict (id) do nothing;

-- Bucket dibuat public agar admin/user bisa lihat gambar via URL langsung.
-- Upload tetap hanya lewat API route server (service role), jadi tidak ada
-- resiko orang lain upload sembarangan ke bucket ini.
