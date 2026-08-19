-- Bersihkan nilai default QRIS yang sudah memuat nomor & notif lama.
-- (Render pop-up sudah tidak memakai qris_payment_notice; instruksi dirender manual tanpa dobel nomor.)
update public.app_settings
set
  qris_instructions = 'Buka aplikasi bank / e-wallet (GoPay, OVO, DANA, ShopeePay, dst).
Pilih menu Scan / Bayar QRIS.
Scan kode QR di atas.
Pastikan nominal sesuai, lalu masukkan PIN untuk menyelesaikan pembayaran.
Setelah transfer berhasil, klik tombol "Saya sudah bayar".',
  qris_payment_notice = ''
where id = 1;