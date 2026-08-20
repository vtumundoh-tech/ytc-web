# Audit Keamanan & Legal — MineClip Studios (ytc-web)

Dokumen ini adalah hasil audit keamanan & legal aplikasi **MineClip Studios** berserta
checklist manual yang wajib dijalankan developer. Dokumen lokal, **tidak di-push** ke repository.

> Berlaku untuk commit `HEAD` terbaru. Tanggal audit: 20 Agustus 2026.

---

## 1. Ringkasan

Audit dilakukan terhadap seluruh checklist keamanan pengguna + audit legal dari dua ronde
referensi. Verdict: **tidak ditemukan celah kritis pada kode** — item yang butuh tindakan
manual (2FA di platform, isi env `TELEGRAM_WEBHOOK_SECRET` / `CRON_SECRET` / `UPSTASH_*`)
diatur di [Bagian 6](#6-checklist-manual-wajib-developer).

---

## 2. Rebrand & Identitas

- Semua nama user-facing diganti ke **MineClip Studios** (sebelumnya "YouTube Clipper" /
  "MineClip Studio") — termasuk dokumen, panduan, email, dashboard Telegram, invoice, dan installer.
- Identitas teknis **dibiarkan** (bukan user-facing, menghindari regresi):
  - Nama package/repo `ytc-web`, nama layanan systemd `ytc-web` / `ytc-telegram`,
    prefix order `YTC-`, cookie `ytc_*`, env `NEXT_PUBLIC_*`, `TIKTOK_URL` dsb.
- Referensi `clipper-guide.html` di `PENJELASAN-BISNIS.md` menunjuk ke nama file panduan di
  dalam aplikasi desktop installer — dibiarkan karena mengikuti nama file sebenarnya.

---

## 3. Status Audit Keamanan (verdict per item)

| # | Item | Status | Bukti |
|---|------|--------|-------|
| 1 | API keys di frontend | ✅ Aman | Yang `NEXT_PUBLIC_` hanya URL, anon key Supabase, client key Midtrans. Service role hanya di `lib/supabaseServer.ts` (server). |
| 2 | RLS (Row Level Security) | ✅ Ter-cover | Akses data via service role server-side saja; user draft tidak pernah akses Supabase langsung. |
| 3 | FE permissions | ✅ Ter-cover | Semua operasi data lewat API route server; otorisasi ada di `middleware.ts` + `lib/adminSession.ts` + `lib/gate.ts`. |
| 4 | Rate limit | ✅ (tinggal env opsional) | Semua endpoint POST ter-rate-limit; GET `/api/settings` kini juga (120/mnt/IP). Detail kontinental di [Bagian 4](#4-peta-rate-limit). |
| 5 | Spam DB | ✅ | Rate limit per IP + batas kode unik cashback/download token (24 byte crypto). |
| 6 | Endpoint mahal | ✅ | Endpoint publik berbiaya kecil; admin/cron dilindungi cookie HttpOnly + `CRON_SECRET` + `ADMIN_PASSWORD` + gate. |
| 7 | Scraping | ✅ | CORS origin ketat + CSP + Referrer-Policy + rate limit. |
| 8 | Raw SQL / string concat | ✅ | Semua query via Supabase JS (parameterized). `npm audit` 0 vuln. |
| 9 | No input validation | ✅ | Validasi di semua route (email regex, WA digit, tipe, enum paket). |
| 10 | User content as HTML | ✅ | Tanpa `dangerouslySetInnerHTML` (0 match); teks di-render sebagai string/teks biasa. |
| 11 | Plain text password | ✅ | Password admin hanya dibandingkan saat login; tidak disimpan plaintext di DB aplikasi. |
| 12 | Auth in local storage | ✅ | Tidak ada localStorage/sessionStorage untuk sesi admin; cookie HttpOnly + Secure + SameSite=Lax. |
| 13 | Cookie stealing | ✅ | `secure` + `httpOnly` + `sameSite:"lax"` + secret signing via `ADMIN_SESSION_SECRET`; `safeEqual` utk perbandingan. |
| 14 | Admin auth | ✅ | Gate (halaman 404 palsu) + password admin + sesi cookie bertanda tangan. |
| 15 | CORS `*` | ✅ | Origin ketat di `next.config.js` (bukan `*`). |
| 16 | Email verification | ✅ | OTP 6 digit (crypto random), TTL 5 menit, max 3 kirim/15 menit, max 3 percobaan → kunci 15 menit; kini **dienforce server-side** di `/api/checkout` (403 jika belum terverifikasi ≤5 menit). |
| 17 | Predictable IDs | ✅ | Order ID acak (`Math.random().toString(36)`), order status & download pakai token 24-byte crypto random. |
| 18 | Saving whole request | ✅ | Hanya field yang diperlukan disimpan (ip, user-agent, browser, os, device) — bukan raw request. |
| 19 | Signature check webhooks | ✅ | Webhook Midtrans verifikasi signature (SHA-512 via `lib/midtrans.ts`); Telegram webhook cek `x-telegram-bot-api-secret-token` via `safeEqual` jika `TELEGRAM_WEBHOOK_SECRET` diisi (`lib/telegram.ts`). |
| 20 | Prod stack traces | ✅ | Semua catch di API route mengembalikan pesan generik + `console.error` hanya di server; tidak ada `err.message` di respons publik. |
| 21 | Update dependencies | ✅ | `npm audit` 0 vuln; override `uuid` ditutup via `^11.1.1`. |
| 22 | Password strength | ⚠️ Manual | Password admin/gate diset lewat env (`ADMIN_PASSWORD` / `ADMIN_GATE_PASSWORD`). **Wajib** panjang & unik — lihat [Bagian 6](#6-checklist-manual-wajib-developer). |
| 23 | File upload validation | ✅ | Semua upload (order-proof, cashback, admin/qris-image, admin/refunds) validasi via `lib/fileValidation.ts`: whitelist jpeg/png/webp + magic bytes + maks 5MB. |
| 24 | 2FA | ⚠️ Manual | Tidak ada 2FA in-app; diaktifkan manual di platform — lihat [Bagian 6](#6-checklist-manual-wajib-developer). |

---

## 4. Peta Rate Limit

Semua limiter memakai `lib/rateLimit.ts`. Jika `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
diisi, maka limiter memakai Redis upstash (terdistribusi). Jika kosong, jatuh ke **in-memory**
Map per instance — catatan: di Vercel (serverless) ini tidak akurat lintas instance.

| Route | Metode | Batas | Jendela |
|---|---|---|---|
| `/api/settings` | GET | 120 / IP | 60 detik |
| `/api/checkout` | POST | 10 / IP | 60 detik |
| `/api/verify-email` | POST | 10 / IP | 60 detik |
| `/api/cashback` | POST | 5 / IP | 60 detik |
| `/api/cashback/check` | POST | 10 / IP | 60 detik |
| `/api/refund-request` | POST | 5 / IP | 60 detik |
| `/api/order-confirm` | POST | 5 / IP | 60 detik |
| `/api/order-proof` | POST | 5 / IP | 60 detik |
| `/api/order-supplement` | POST | 5 / IP | 60 detik |
| `/api/download` | GET | 30 / IP | 10 menit |
| `/api/order-status` | GET | 60 / IP | 60 detik |
| `/api/admin-login` | POST | 5 / IP | 60 detik |
| `/api/admin-gate` | POST | `GATE_MAX_FAILURES` | 1 hari (block cookie) |
| `/api/midtrans-webhook` | POST | 120 / jam / order | — |
| `/api/telegram/webhook` | POST | verifikasi secret token | — |

---

## 5. Status Legal

### 5.1 Dokumen yang ada

| Dokumen | Lokasi | Status |
|---|---|---|
| Terms & Conditions | `/syarat-ketentuan` (Part 1) | ✅ Dipebarui versi 2.1, 18 Agustus 2026 |
| Privacy Policy (UU PDP) | `/syarat-ketentuan` (Part 2) | ✅ Mengacu UU No. 27/2022 |
| Copyright & IP Notice | `/syarat-ketentuan` (Part 1, klausa 13) | ✅ Baru ditambahkan |
| No Refund Policy | `/syarat-ketentuan` (Part 1, klausa 5) | ✅ |

### 5.2 Klausa IP yang baru ditambahkan (klausa 13)

- YouTube adalah merek milik Google LLC; aplikasi tidak berafiliasi/di-endorse Google/YouTube.
- Tanggung jawab penggunaan konten ada di pelanggan (patuhi hukum hak cipta & ToS YouTube).
- Prosedur takedown notice: email `mineclipstudios@gmail.com` atau WA admin.
- Merek lain tetap milik pemiliknya masing-masing.

### 5.3 Catatan kelengkapan

- Pernyataan Storage & Security (klausa 4 Privacy) menyebut data **tidak terenkripsi** di level
  aplikasi — ini disengaja dan transparan (tidak boleh mengeklaim enkripsi berlebih).
- Disarankan meminta peninjauan ulang oleh pihak berwenang/penasihat hukum sebelum rilis besar.

---

## 6. Checklist Manual Wajib Developer

Item berikut **tidak bisa ditutup dari kode** dan harus dilakukan manual:

### 6.1 2FA (aktifkan di platform)

| Platform | Tindakan | Referensi |
|---|---|---|
| GitHub | Settings → Password and authentication → Two-factor authentication | github.com/settings/security |
| Vercel | Settings → Team → Member → Two-Factor Authentication | vercel.com/docs/security/2fa |
| Supabase | Project → Account → Security → MFA | supabase.com |
| Cloudflare (R2) | Turn on Two-Factor Authentication | dash.cloudflare.com |
| Registrar domain (jika perlu) | Aktifkan 2FA + lock transfer domain | sesuai registrar |

### 6.2 Env wajib diisi (selain .env.example)

| Env | Kenapa |
|---|---|
| `ADMIN_PASSWORD` / `ADMIN_GATE_PASSWORD` | Password minimal 14 karakter, panjang, unik, beda satu sama lain. |
| `ADMIN_SESSION_SECRET` | String acak panjang; jangan dipublikasikan. |
| `CRON_SECRET` | Mengamankan endpoint cron digest Telegram. |
| `TELEGRAM_WEBHOOK_SECRET` | Opsional tapi **disarankan** jika pakai setWebhook — tanpa ini webhook Telegram tidak terautentikasi. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | **Disarankan** untuk rate limiter terdistribusi (akurat di serverless/multi-instance). Kosongkan jika hanya pakai in-memory. |
| `SUPABASE_SERVICE_ROLE_KEY` | Hanya di server; jangan pernah expose. |

### 6.3 Prosedur berkala

- Perbarui `npm audit` sebelum deploy; jalankan `npx tsc --noEmit` dan `next build`.
- Rotasi `R2_SECRET_ACCESS_KEY`, `ADMIN_SESSION_SECRET`, `TELEGRAM_WEBHOOK_SECRET`, dan
  `CRON_SECRET` secara berkala atau saat ada dugaan bocor.
- Ganti kunci R2 installer jika installer bocor.
- Monitor log untuk pola rate-limit / percobaan login gagal (`console.error` + notifikasi Telegram admin).

---

## 7. Verifikasi yang dilakukan

- `npm audit` → 0 vulnerabilities.
- `npx tsc --noEmit` → bersih.
- `next build` → sukses.
- Smoke test endpoint `/api/settings` → 200 normal / 429 saat overload; checkout terverifikasi vs
  tidak terverifikasi → order hanya dibuat jika email terverifikasi.