# Laporan QA — MineClip Studios (ytc-web)

Tanggal: 2026-08-20 (sesi QA pasca-upgrade Next.js, versi saat ini)
Dokumen ini **lokal, tidak di-push** ke repository.

## Ringkasan

QA menyeluruh pasca-upgrade Next.js (Next 15.5.23 / React 18.3.1 / TS 5.9.3) dan perbaikan
sejumlah bug yang dilaporkan setelah pengujian. Status akhir: sebagian besar jalur utama
lolos; **Tes 3 (refund/pelengkap) belum diuji** dan dijadwalkan menyusul.

## Lingkungan pengujian

| Item | Nilai |
|---|---|
| Node.js | v26.4.0 |
| npm | 11.17.0 |
| Next.js | 15.5.23 |
| React | 18.3.1 |
| Runtime lokal | `next start -p 3199` |
| Produksi (smoke) | https://ytc-web-ten.vercel.app |
| Stack | Supabase (REST), R2 (Cloudflare), SMTP (nodemailer), QRIS statis (GOQRIS), Telegram bot |

## B1 — Pemeriksaan statis

- `npm audit` → **0 vulnerability** (sebelum perbaikan export sempat 2 moderate dari `uuid`,
  ditutup via override `uuid ^11.1.1`).
- `npx tsc --noEmit` → bersih, tanpa error.
- `next build` → sukses (26 halaman + middleware). Tidak ada konflik versi
  (postcss dedupe `8.5.23`, sharp `0.35.3`, React 18.3.1 dedupe).

## B2 — Smoke-test runtime (19/19 PASS)

Skrip `qa-smoke-tests.ps1` (temp, sudah dihapus). Rute diuji: halaman/layout situs,
ketentuan, arsip, admin (gate/login/sesi), dan mayoritas API publik/admin.

Catatan ekspektasi: `/admin/login` mengembalikan **307** (butuh cookie gate dulu —
double-gate `/arsip` → `/admin/login` memang desain di `middleware.ts`). `/api/*` yang
non-POST mengembalikan 405; `/api/admin/*` tanpa sesi mengembalikan 401.

## B3 — Pengujian fungsional (browser)

### Tes 1a — Checkout + OTP email
- Form checkout tampil & validasi berjalan. ✅
- Kode verifikasi terkirim via email; countdown 5 menit; kirim ulang berfungsi. ✅
- Kode OTP salah menampilkan pesan error (3x salah → kunci 15 menit). ✅

### Tes 1b — QRIS statis
- Modal QRIS tampil dengan countdown 3 menit; "Lihat Lagi" mereset 3:00. ✅
- Upload bukti bayar (screenshot) sukses. ✅

### Tes 2 — Admin (order)
- Filter status pending berfungsi. ✅
- Ubah order → Lunas (paid) → **email invoice terkirim otomatis** (`email_status=sent`). ✅
- Kotak pengingat WhatsApp (Machine ID, "Buka WhatsApp", "Salin pesan"). ✅
- Export CSV (sekarang ganti jadi Excel .xlsx). ✅
- Dashboard (chart recharts) render. ✅

Verifikasi DB (Supabase): order `ga` / `s2200511@student.unklab.ac.id` /
`permanent_1080` / Rp450.000 / qris → awalnya `pending`, setelah disimpan admin →
`status=paid`, `email_status=sent`, `paid_at=2026-08-20T08:16:22Z`. Catatan: `email_status`
kosong di jalur QRIS sampai admin menyetujui (normal, sesuai desain).

### Tes 3 — Refund / pembayaran pelengkap (insufficient)
**BELUM DI TES.** Meliputi: order ditolak tipe `insufficient` → halaman status menampilkan
opsi Ajukan Refund / Bayar Kekurangan → alur refund (dengan bukti transfer & email) dan
pembayaran pelengkap (`/beli?supplement=...`). Dijadwalkan sesi berikutnya.

## B4 — Smoke-test produksi

9/9 respons normal di https://ytc-web-ten.vercel.app (status 200/307 konsisten dengan lokal).

## Perbaikan yang dilakukan sesi ini (setelah laporan bug)

1. **Halaman beli klik 1080 tapi terbeli 720** — root cause: `api/checkout` tidak membaca
   `addon1080`, dan resolusi ditentukan dari teks label ("Basic"/"Special Offer") yang tidak
   mengandung "1080p". Fix: `addon1080` dibaca dari body; `hasAddon` ditentukan dari nilai
   tier / toggle user; total = basePrice + addonPrice; label menjadi `(1080p)/(720p)` yang
   sesuai. Verifikasi API: `permanent_1080` → "Special Offer (1080p)" Rp450.000;
   `permanent_720`+addon → "Basic (1080p)". ✅
2. **Klik irisan pie chart tidak menampilkan detail** — handler recharts pie hanya mengecek
   `activePayload`. Fix: fallback ke `payload`/datanya langsung. ✅
3. **Garis horizontal pada chart naik-turun** — grid horizontal dipertegas (dashed) dan
   ditambah garis referensi rata-rata pendapatan. ✅
4. **KPI/delta membingungkan (↑100% vs 0 order)** — sebelumnya KPI cards dihitung dari
   SEMUA data sedangkan `prevTotals` hanya window 30 hari/12 bulan, sehingga perbandingan
   tidak konsisten. Fix: KPI dihitung per window periode berjalan dan dibandingkan dengan
   periode sebelumnya; saat prev=0 tampil badge "Baru"/"—", bukan persen. ✅
5. **Email "delay / tidak terkirim"** — dicek & dikonfirmasi terkirim dari sisi server
   (`email_status=sent`). Keterlambatan berada di sisi penerima (SPAM/Promosi / slow relay
   SMTP), bukan bug kode. Alur pengiriman tetap inline (keputusan user).
6. **Admin belum/telah diproses** — sub-tab "Menunggu / Terproses / Semua" pada tab
   Pembelian dan Klaim Cashback. ✅
7. **Eksposur network (F12) saat R2 dipanggil** — audit selesai:
   - Normal (bukan sensitif): `?_rsc=`, `icon.svg`, `/api/settings` (harga & config publik),
     gambar QRIS (publik, memang untuk pembeli), beli/arsip `?_rsc`.
   - Sensitif namun terkendali: `/api/download?token=` — token di email; **sekarang
     single-use**: setelah unduh sukses token langsung dirotasi sehingga link lama mati;
     admin punya tombol "Kirim Ulang Link". Bukti pay (order-proof) hanya via signed URL
     & cookie admin; `cashback_code` hanya untuk pemegang token.
   Verifikasi single-use: panggil ke-1 → URL installer; panggil ke-2 dengan token sama → 404. ✅
8. **Export Excel berantakan** — ganti `text/csv` menjadi file `.xlsx` asli (dependency
   `exceljs`): header diwarnai/bold, kolom selebar isi, rupiah dengan format angka, freeze
   baris pertama, auto-filter. Berlaku untuk orders & klaim cashback. Verifikasi:
   `GET /api/admin/orders/export` mengembalikan file zip xlsx valid. ✅

## Daftar rute API penting yang diverifikasi

| Rute | Perilaku |
|---|---|
| `POST /api/checkout` | POST-only, rate-limit 10/mnt, validasi (WA ≥8 digit), insert order, label/amount fix |
| `GET /api/download` | token ≥16 char, order paid & belum kedaluwarsa, signed URL 1 jam, **rotasi token single-use** |
| `GET /api/order-status` | token-gated, status/amount/rejection/cashback |
| `GET /api/settings` | konfigurasi publik (harga, QRIS) — tanpa rahasia |
| `/api/admin/*` | wajib sesi admin (401 tanpa cookie) |
| `POST /api/admin-gate`, `POST /api/admin-login` | gate → login, HMAC session |
| `GET/POST /api/admin/orders` | daftar (dengan signed proof URL) & transisi status (invoice otomatis, email penolakan 1x, `resend_link`) |
| `GET /api/admin/orders/export` | file `.xlsx` |
| `GET /api/admin/claims/export` | file `.xlsx` |

## Catatan keamanan singkat

- Bukti bayar disimpan di bucket `cashback-proofs` (privat, hanya diakses via signed URL
  1 jam + sesi admin). Gambar QRIS di bucket `qris-assets` publik (memang untuk pembeli).
- Link unduh sekarang single-use (anti-penyebaran/jual-beli link) + expire 24 jam.
- Token pengunduhan/order status setara kredensial — dikirim via email; jangan sebarkan.
- Tidak ada kredensial Midtrans di kode; pembayaran via QRIS statis (GOQRIS).

## Hal yang belum selesai / lanjutan

- Tes 3 (refund & pembayaran pelengkap).
- Uji browser final untuk tombol "Kirim Ulang Link" (login admin di browser) dan sub-tab
  Menunggu/Terproses.