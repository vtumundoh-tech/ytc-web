-- Gate verifikasi unduhan ("pos satpam")
-- orders.download_code       : kode verifikasi 8 karakter, sekali pakai (null setelah berhasil dipakai)
-- orders.gate_failed_attempts: jumlah percobaan kode salah (reset bila benar / saat resend)
-- orders.gate_locked_until   : kunci sementara bila 5x salah kode

alter table public.orders
  add column if not exists download_code text,
  add column if not exists gate_failed_attempts integer not null default 0,
  add column if not exists gate_locked_until timestamptz;