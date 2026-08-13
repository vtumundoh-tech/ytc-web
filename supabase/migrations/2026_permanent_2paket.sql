-- Migrasi: Model beli-utuh (permanen) — 2 paket (Basic & Special Offer)
-- Jalankan di Supabase Dashboard > SQL Editor (lampirkan salin-tempel).

-- 1) Update baris app_settings existing ke 2 paket permanen (bisa diubah lagi lewat Admin > Pengaturan)
update public.app_settings
set
  promo_enabled = false,
  tiers = '[
    {"value": "permanent_720", "label": "Basic", "amount": 409200, "originalAmount": 1320000, "discountPercent": 69},
    {"value": "permanent_1080", "label": "Special Offer", "amount": 450000, "originalAmount": 1500000, "discountPercent": 70}
  ]'::jsonb,
  addon_prices = '{}'::jsonb,
  cashback_tiers = '{
    "permanent_720": 45000,
    "permanent_1080": 50000
  }'::jsonb,
  updated_at = now()
where id = 1;

-- 2) Pastikan baris seed ada jika belum
insert into public.app_settings (id, promo_enabled, tiers, addon_prices, cashback_tiers)
values (
  1,
  false,
  '[
    {"value": "permanent_720", "label": "Basic", "amount": 409200, "originalAmount": 1320000, "discountPercent": 69},
    {"value": "permanent_1080", "label": "Special Offer", "amount": 450000, "originalAmount": 1500000, "discountPercent": 70}
  ]'::jsonb,
  '{}'::jsonb,
  '{
    "permanent_720": 45000,
    "permanent_1080": 50000
  }'::jsonb
)
on conflict (id) do nothing;
