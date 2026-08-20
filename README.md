# YouTube Clipper — Web Pembayaran & Klaim Cashback

Web ini menggantikan Google Form manual dengan:
- **Halaman Beli** (`/beli`) → user isi data, bayar langsung via Midtrans (QRIS/VA/e-wallet), status otomatis update.
- **Halaman Klaim Cashback** (`/klaim-cashback`) → user isi data + upload bukti, disimpan ke database, Anda proses transfer manual.
- **Halaman Admin** (`/admin`) → lihat semua data, update status, isi key lisensi.

Stack: **Next.js + Supabase (database & storage) + Midtrans (payment) + Vercel (hosting)**.

---

## 0. Yang perlu Anda siapkan

1. Akun **GitHub** (untuk simpan kode & connect ke Vercel)
2. Akun **Vercel** — https://vercel.com (bisa daftar pakai akun GitHub)
3. Akun **Supabase** — https://supabase.com
4. Akun **Midtrans** — https://midtrans.com
   - KTP Anda + foto halaman pertama buku tabungan (untuk aktivasi akun Individual)

---

## 1. Setup Supabase (Database)

1. Buka https://supabase.com → **New Project**. Catat *database password* yang dibuat (simpan baik-baik).
2. Setelah project jadi, buka menu **SQL Editor** → **New query**.
3. Salin **seluruh isi file `supabase/schema.sql`** di project ini, tempel, lalu klik **Run**.
   - Ini akan membuat tabel `orders`, `cashback_claims`, dan storage bucket `cashback-proofs` untuk simpan screenshot bukti.
4. Buka menu **Project Settings → API**. Catat 3 nilai ini (akan dipakai di langkah 4):
   - `Project URL` → jadi `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → jadi `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (klik "Reveal") → jadi `SUPABASE_SERVICE_ROLE_KEY`

   ⚠️ **`service_role` key ini sangat rahasia** — bisa baca/tulis semua data tanpa batasan. Jangan pernah taruh di kode yang di-commit ke GitHub sebagai teks biasa; kita hanya taruh sebagai Environment Variable di Vercel (langkah 5).

---

## 2. Setup Midtrans (Payment Gateway)

Kenapa Midtrans (bukan Xendit): untuk akun **perorangan/individu** (belum ada PT/CV), syarat Midtrans lebih ringan (cukup KTP + buku tabungan) dan approval-nya biasanya lebih cepat. Kode di project ini sudah dipisah rapi di `lib/midtrans.ts`, jadi kalau nanti Anda sudah punya badan usaha dan mau pindah ke Xendit, tinggal ganti file itu saja.

1. Daftar di https://midtrans.com → pilih **Individual/Perorangan**.
2. Login ke dashboard, tetap di mode **Sandbox** dulu untuk uji coba:
   - Buka **Settings → Access Keys**. Catat `Server Key` dan `Client Key` (yang diawali `SB-`).
3. Sambil uji coba, ajukan **aktivasi akun Production**: `Settings → Account → Aktivasi Akun` → upload KTP & buku tabungan. Prosesnya 1-3 hari kerja.
4. Setelah production aktif, di **Settings → Access Keys** akan ada Server Key & Client Key baru (tanpa awalan `SB-`) — pakai ini untuk live.
5. Setelah web sudah live di Vercel (langkah 5), buka **Settings → Configuration** di dashboard Midtrans, isi:
   - **Payment Notification URL**: `https://domain-anda.vercel.app/api/midtrans-webhook`
   - **Finish Redirect URL**: `https://domain-anda.vercel.app/success`

   Ini penting — tanpa ini, status pembayaran tidak akan otomatis ter-update.

---

## 3. Jalankan & coba di komputer sendiri (opsional tapi disarankan)

```bash
npm install
cp .env.example .env.local
# lalu isi semua nilai di .env.local sesuai langkah 1 & 2 di atas
npm run dev
```

Buka http://localhost:3000

---

## 4. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```

Buat repository baru di GitHub, lalu:

```bash
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git branch -M main
git push -u origin main
```

---

## 5. Deploy ke Vercel

1. Buka https://vercel.com/new, pilih **Import** repo GitHub yang baru dibuat.
2. Sebelum klik Deploy, buka bagian **Environment Variables**, isi semua variabel berikut (nilainya dari langkah 1 & 2):

   | Key | Nilai |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | dari Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dari Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | dari Supabase (rahasia!) |
   | `MIDTRANS_SERVER_KEY` | dari Midtrans |
   | `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | dari Midtrans |
   | `MIDTRANS_IS_PRODUCTION` | `false` saat sandbox, `true` saat live |
   | `ADMIN_PASSWORD` | password bebas, buat yang kuat |
   | `ADMIN_SESSION_SECRET` | string acak panjang bebas (contoh: hasil dari `openssl rand -hex 32`) |
   | `NEXT_PUBLIC_APP_URL` | isi setelah tahu domain Vercel-nya, contoh `https://ytc-anda.vercel.app` |

3. Klik **Deploy**. Setelah selesai, Anda akan dapat domain seperti `https://ytc-anda.vercel.app`.
4. Kembali ke **Project Settings → Environment Variables** di Vercel, update `NEXT_PUBLIC_APP_URL` dengan domain asli tadi, lalu **Redeploy**.
5. Selesaikan langkah 2.5 di atas (isi Notification URL & Finish Redirect URL di Midtrans).

---

## 6. Cara pakai sehari-hari

- **Link untuk disebar ke user:** `https://domain-anda.vercel.app` (mereka pilih sendiri Beli / Klaim Cashback).
- **Link khusus Anda (jangan disebar):** `https://domain-anda.vercel.app/admin` — login pakai `ADMIN_PASSWORD` yang Anda set tadi.
- Alur beli: user bayar → webhook otomatis ubah status jadi `paid` → Anda buka `/admin`, buat key lisensi, isi kolom **Key Lisensi**, lalu kirim manual ke WhatsApp user, klik **Simpan**.
- Alur cashback: user isi form → muncul di tab **Klaim Cashback** pada `/admin` dengan status `pending` → Anda cek 3 link bukti (follow/like/share) → kalau valid, transfer manual → ubah status jadi `paid`. Kalau tidak valid → `rejected`.

---

## Catatan keamanan & desain

- Nomor rekening pribadi Anda **tidak pernah ditampilkan** ke user — pembayaran sepenuhnya lewat Midtrans.
- Tabel database diproteksi **Row Level Security**; hanya API server (pakai `service_role` key) yang bisa akses, browser user tidak bisa baca/tulis data langsung.
- Halaman `/admin` diproteksi middleware + cookie sesi yang ditandatangani — tanpa password yang benar, tidak bisa masuk.
- Soal captcha di form cashback ("7 + 8") masih sangat sederhana, sekadar mencegah bot paling dasar — bukan pengaman utama. Kalau nanti ada masalah spam, saya bisa bantu upgrade ke Google reCAPTCHA/Turnstile.
- Kolom `bank_account` di tabel `orders` sudah disiapkan (opsional) kalau suatu saat Anda butuh nomor rekening user untuk keperluan refund manual di luar sistem.
