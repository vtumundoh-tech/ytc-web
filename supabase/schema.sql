-- Jalankan seluruh file ini di Supabase Dashboard > SQL Editor > New Query > Run

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
  midtrans_order_id text unique not null,
  midtrans_transaction_id text,
  payment_type text, -- qris, bank_transfer, gopay, dll (diisi otomatis dari webhook)
  license_key text, -- diisi manual oleh admin setelah key dibuat & dikirim
  admin_notes text,
  paid_at timestamptz,
  agree_snk boolean not null default false, -- rekam jejak persetujuan S&K
  ip_address text, -- IP pelanggan saat checkout (dari x-forwarded-for)
  user_agent text, -- User-Agent mentah dari browser
  browser text, -- contoh: Chrome, Firefox, Safari
  os text, -- contoh: Windows, Android, iOS
  device_type text -- Desktop | Mobile | Tablet
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
  payment_proof_url text, -- bukti bayar (screenshot transfer / QRIS)
  screenshot_follow_url text not null,
  screenshot_like_url text not null,
  screenshot_share_url text not null,
  notes text,
  status text not null default 'pending', -- pending | approved | paid | rejected
  admin_notes text,
  agree_snk boolean not null default false, -- rekam jejak persetujuan S&K
  ip_address text, -- IP pelanggan saat klaim (dari x-forwarded-for)
  user_agent text, -- User-Agent mentah dari browser
  browser text, -- contoh: Chrome, Firefox, Safari
  os text, -- contoh: Windows, Android, iOS
  device_type text -- Desktop | Mobile | Tablet
);

create index if not exists idx_claims_status on cashback_claims(status);
create index if not exists idx_claims_created_at on cashback_claims(created_at desc);

-- ========== TABEL APP_SETTINGS (konfigurasi global: promo & harga) ==========
create table if not exists app_settings (
  id integer primary key default 1 check (id = 1), -- selalu satu baris
  promo_enabled boolean not null default false,
  tiers jsonb not null default '[]'::jsonb,
  addon_prices jsonb not null default '{}'::jsonb,
  cashback_tiers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Seed awal: nilai sama dengan lib/tiers.ts (promo default OFF)
insert into app_settings (id, promo_enabled, tiers, addon_prices, cashback_tiers)
values (
  1,
  false,
  '[
    {"value": "daily_720", "label": "1 Hari", "amount": 5000, "originalAmount": 10000, "discountPercent": 50},
    {"value": "weekly_720", "label": "7 Hari", "amount": 24850, "originalAmount": 35000, "discountPercent": 29},
    {"value": "semi_monthly_720", "label": "17 Hari", "amount": 39050, "originalAmount": 55000, "discountPercent": 29},
    {"value": "monthly_720", "label": "30 Hari", "amount": 48990, "originalAmount": 69000, "discountPercent": 29}
  ]'::jsonb,
  '{
    "daily_720": 3000,
    "weekly_720": 12000,
    "semi_monthly_720": 12000,
    "monthly_720": 13000
  }'::jsonb,
  '{
    "daily_720": 0,
    "weekly_720": 6000,
    "semi_monthly_720": 3000,
    "monthly_720": 9000
  }'::jsonb
)
on conflict (id) do nothing;

alter table app_settings enable row level security;
-- Tidak ada policy untuk anon/authenticated -> hanya bisa diakses lewat service role key di server.

-- ========== ROW LEVEL SECURITY ==========
-- RLS diaktifkan. Karena semua akses tulis/baca dari app dilakukan lewat API route
-- server (pakai Service Role Key yang otomatis bypass RLS), maka dari sisi client
-- (anon key) tidak ada akses langsung sama sekali. Ini paling aman untuk data
-- pribadi seperti ini.
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

-- ========== MIGRASI DB YANG SUDAH ADA ==========
-- Jalankan statement di bawah ini SEKALI untuk DB yang sudah dibuat sebelumnya
-- (create table if not exists tidak akan menambah kolom baru).
-- alter table cashback_claims add column if not exists payment_proof_url text;
