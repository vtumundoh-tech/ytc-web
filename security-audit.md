# 🔐 Security Audit Report — ytc-web

> Audit dilakukan pada: **2026-08-13**
> Codebase: Next.js (App Router) + Supabase + Midtrans + Cloudflare R2 + Telegram Bot

---

## ✅ Yang Sudah Aman (GOOD)

| # | Area | Status |
|---|------|--------|
| 1 | **CSP Header** | ✅ Dikonfigurasi ketat di `next.config.js`, menutup `object-src`, `frame-ancestors`, `base-uri` |
| 2 | **Security Headers** | ✅ `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `COEP`, `Permissions-Policy` |
| 3 | **Admin Double-Gate** | ✅ Layer gate (`/arsip`) + login admin terpisah — harus lulus 2 lapisan |
| 4 | **Session Cookie HMAC** | ✅ Cookie sesi ditandatangani dengan HMAC-SHA256 + timestamp expiry, bukan JWT naif |
| 5 | **httpOnly + Secure Cookie** | ✅ Cookie admin: `httpOnly: true, secure: true, sameSite: "lax"` |
| 6 | **RLS Supabase** | ✅ Semua tabel: `enable row level security`, tidak ada public policy |
| 7 | **Service Role Key = Server Only** | ✅ Hanya dipakai di API routes, tidak diexpose ke client |
| 8 | **Rate Limiter (ada)** | ✅ Checkout (10/mnt), Cashback (5/mnt), Admin-login (5/mnt) |
| 9 | **File Signature Check** | ✅ Magic bytes JPEG/PNG/WebP divalidasi di `fileValidation.ts` |
| 10 | **File Size Limit** | ✅ Maks 5MB per file upload |
| 11 | **Midtrans Webhook Signature** | ✅ SHA512 signature diverifikasi sebelum update status order |
| 12 | **Telegram Bot Auth** | ✅ Command hanya diproses jika `chatId === TELEGRAM_CHAT_ID` |
| 13 | **Middleware Guard** | ✅ Semua route `/admin/*` dan `/api/admin/*` diproteksi middleware |
| 14 | **Input Escaping (HTML)** | ✅ `escapeHtml()` dipakai sebelum kirim ke Telegram |
| 15 | **Presigned URL (R2)** | ✅ Installer hanya bisa didownload via signed URL 1 jam, tidak public |

---

## 🚨 CRITICAL — Harus Diperbaiki Segera

### 🔴 C-1: `.env.local` BOCOR di Git History (RISIKO SANGAT TINGGI)

**Masalah:** File `.env.local` berisi **credential asli** yang terekspos:
```
SUPABASE_SERVICE_ROLE_KEY = xxxxx (service role, bypass semua RLS!)
ADMIN_PASSWORD = xxxxx (diredaksi)
ADMIN_GATE_PASSWORD = xxxxx (diredaksi)
ADMIN_SESSION_SECRET = xxxxx (diredaksi)
R2_ACCESS_KEY_ID = xxxxx (diredaksi)
R2_SECRET_ACCESS_KEY = xxxxx (diredaksi)
TELEGRAM_BOT_TOKEN = xxxxx (diredaksi)
SMTP_PASS = xxxxx (Gmail App Password — diredaksi)
```

**.gitignore** sudah benar (`.env.local` masuk), tapi jika file ini pernah di-commit sekali pun, credentials masih ada di git history.

**Fix:**
1. Cek apakah pernah ter-commit: `git log --all -- .env.local`
2. Jika ya → **Rotate semua credentials sekarang** (Supabase, R2, Telegram, SMTP, Admin password)
3. Hapus dari history: `git filter-repo` atau `BFG Repo Cleaner`
4. Vercel env vars: pastikan semuanya diset via dashboard, bukan via file

---

### 🔴 C-2: `ADMIN_SESSION_SECRET` Lemah (Dev Value di Prod?)

**Masalah:** Nilai di `.env.local`:
```
ADMIN_SESSION_SECRET=xxxxx (diredaksi — nilai lama "local-dev-secret" tidak dicantumkan)
```
String ini terlalu pendek, deterministik, dan bernama "local-dev". Jika nilai ini juga dipakai di production Vercel, attacker yang tahu secret ini bisa **memalsukan cookie sesi admin** tanpa login.

**Fix:**
```bash
# Generate secret kuat: min 64 karakter acak
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Set di Vercel Dashboard → Environment Variables.

---

### 🔴 C-3: `GET /api/settings` — Bocorkan Info Infrastruktur

**Masalah** di [`app/api/settings/route.ts`](file:///c:/ytc-web/app/api/settings/route.ts):
```ts
return NextResponse.json({
  ...settings,
  meta: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,  // ⚠️ publik
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,     // ⚠️ info infrastruktur
  },
});
```
Endpoint ini **PUBLIC** (tidak ada auth). Siapapun bisa hit `GET /api/settings` dari browser/curl dan melihat Supabase URL + konfirmasi apakah service key ada.

**Fix:** Hapus field `meta` dari response publik. Jika diperlukan debugging, pindahkan ke `/api/admin/settings` yang sudah terproteksi.

---

### 🔴 C-4: `GET /api/admin/settings` — Juga Bocorkan Info Sama

**Masalah** di [`app/api/admin/settings/route.ts`](file:///c:/ytc-web/app/api/admin/settings/route.ts) (L14-15):
```ts
meta: {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
},
```
Bahkan di route admin yang terproteksi, tidak perlu expose info ini ke response JSON — ini bisa dibaca di Network tab browser Chrome DevTools oleh admin yang device-nya terkompromikan.

**Fix:** Hapus field `meta` dari kedua response.

---

## 🟠 HIGH — Penting Diperbaiki

### 🟠 H-1: Rate Limiter In-Memory — Tidak Efektif di Serverless/Multi-Instance

**Masalah** di [`lib/rateLimit.ts`](file:///c:/ytc-web/lib/rateLimit.ts):
```ts
const counters = new Map<string, { count: number; resetAt: number }>();
```
Map ini disimpan **di memori process Node.js**. Di Vercel/serverless:
- Setiap function invocation bisa spawn instance baru → counter reset ke 0
- Attacker bisa bypass rate limit dengan request paralel ke cold instances
- Di-deploy ulang → semua counter hilang

**Fix:** Ganti dengan Redis/Upstash KV. Upstash gratis tier cukup untuk scale kecil:
```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});
```

---

### 🟠 H-2: Telegram Webhook — Tidak Ada Verifikasi Token Telegram

**Masalah** di [`app/api/telegram/webhook/route.ts`](file:///c:/ytc-web/app/api/telegram/webhook/route.ts):
```ts
export async function POST(req: NextRequest) {
  const update = await req.json();
  // ⚠️ Tidak ada verifikasi bahwa request ini benar dari Telegram!
  const reply = await handleTelegramCommand(text, chatId);
```
Siapapun bisa POST ke `/api/telegram/webhook` dengan payload `{ message: { text: "/listcb", chat: { id: CHAT_ID } } }` dan mendapatkan list data semua cashback/order — **jika mereka tahu TELEGRAM_CHAT_ID**.

**Fix:** Verifikasi `X-Telegram-Bot-Api-Secret-Token` header (Telegram webhook secret):
```ts
const secret = req.headers.get("x-telegram-bot-api-secret-token");
if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
  return NextResponse.json({ ok: false }, { status: 401 });
}
```
Set webhook secret saat register webhook ke Telegram API.

---

### 🟠 H-3: `GET /api/cron/telegram-digest` — Tidak Ada Autentikasi Cron

**Masalah** di [`app/api/cron/telegram-digest/route.ts`](file:///c:/ytc-web/app/api/cron/telegram-digest/route.ts):
Komentar di dalam file sendiri sudah mengingatkan:
```ts
// const CRON_SECRET = process.env.CRON_SECRET;
// if (CRON_SECRET) {
//   const auth = ...
```
Tapi logika auth ini di-comment! Jika cron diaktifkan suatu hari, endpoint ini akan **terbuka tanpa proteksi**.

**Fix:** Aktifkan CRON_SECRET check sejak sekarang (uncomment + tambahkan env), bahkan sebelum logika cron diaktifkan.

---

### 🟠 H-4: `PATCH /api/admin/orders` — Tidak Ada Validasi Input Status

**Masalah** di [`app/api/admin/orders/route.ts`](file:///c:/ytc-web/app/api/admin/orders/route.ts):
```ts
const { id, status, admin_notes } = body;
// ⚠️ status tidak divalidasi — bisa diisi string apa saja
await supabase.from("orders").update({ status, admin_notes }).eq("id", id);
```
Admin yang sessionnya terkompromikan (atau bug frontend) bisa set `status` ke nilai arbitrer seperti `"god_mode"` atau `"debug_bypass"`.

**Fix:**
```ts
const VALID_STATUSES = ["pending", "paid", "expired", "failed", "cancelled"] as const;
if (status && !VALID_STATUSES.includes(status)) {
  return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
}
```
Sama berlaku untuk `PATCH /api/admin/claims`.

---

### 🟠 H-5: Perbandingan Password dengan `===` (Timing Attack)

**Masalah** di [`app/api/admin-login/route.ts`](file:///c:/ytc-web/app/api/admin-login/route.ts) L19 dan [`app/api/admin-gate/route.ts`](file:///c:/ytc-web/app/api/admin-gate/route.ts) L42:
```ts
if (password !== process.env.ADMIN_PASSWORD) { ... }
```
Perbandingan string biasa (`===`) rentan terhadap **timing attack** — attacker bisa mengukur waktu respons untuk menebak karakter password satu per satu.

**Fix:** Gunakan `crypto.timingSafeEqual`:
```ts
import { timingSafeEqual } from "crypto";
const inputBuf = Buffer.from(password);
const expectedBuf = Buffer.from(process.env.ADMIN_PASSWORD!);
const isMatch = inputBuf.length === expectedBuf.length &&
  timingSafeEqual(inputBuf, expectedBuf);
```

---

### 🟠 H-6: `x-forwarded-for` Bisa Dipalsukan sebagai IP

**Masalah** di [`lib/requestMeta.ts`](file:///c:/ytc-web/lib/requestMeta.ts) L13:
```ts
const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
```
Header `x-forwarded-for` bisa dimanipulasi oleh client. Jika Vercel tidak menjaminnya, attacker bisa kirim `X-Forwarded-For: 127.0.0.1` untuk bypass rate limiter berbasis IP.

**Fix:** Di Vercel, gunakan `req.ip` atau header yang tidak bisa dipalsukan:
```ts
// Di Vercel, gunakan:
const ip = req.headers.get("x-real-ip") || 
           req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
           "unknown";
```
Lebih baik: kombinasikan dengan Redis rate limit (H-1) yang kebal terhadap IP spoofing.

---

## 🟡 MEDIUM — Disarankan Diperbaiki

### 🟡 M-1: `GET /api/cashback/check` — Kemungkinan Enumerable

Pastikan endpoint check cashback code tidak memberikan response yang membedakan "kode tidak ada" vs "kode sudah dipakai" — ini bisa dipakai untuk enumerasi kode cashback.

---

### 🟡 M-2: Storage Bucket `cashback-proofs` — PUBLIC

**Masalah** di `schema.sql` L104:
```sql
insert into storage.buckets (id, name, public)
values ('cashback-proofs', 'cashback-proofs', true)
```
Bucket **public** berarti semua URL screenshot (bukti bayar, follow, like, share) bisa diakses **siapapun** yang tahu URL-nya. URL tidak di-enumerate secara mudah, tapi jika bocor, data pelanggan (screenshot transfer bank) bisa dilihat orang lain.

**Fix:** Buat bucket **private**, akses gambar lewat signed URL server-side, atau setidaknya gunakan nama file yang unpredictable (sudah ada: `${prefix}-${Date.now()}-${random}`).

---

### 🟡 M-3: `admin_notes` Tidak Disanitasi (Potential XSS di Admin Panel)

**Masalah:** Field `admin_notes` ditulis admin dan bisa ditampilkan di UI admin panel. Jika tidak di-escape dengan benar di React (misalnya pakai `dangerouslySetInnerHTML`), ini rentan XSS.

**Rekomendasi:** Pastikan tidak ada penggunaan `dangerouslySetInnerHTML` untuk data yang berasal dari database. Review komponen admin.

---

### 🟡 M-4: `generateCashbackCode()` Menggunakan `Math.random()` (Non-Cryptographic)

**Masalah** di [`lib/cashCode.ts`](file:///c:/ytc-web/lib/cashCode.ts) L4:
```ts
code += chars[Math.floor(Math.random() * chars.length)];
```
`Math.random()` bukan CSPRNG. Kode cashback 8 karakter dari 31 karakter = ~40 bit entropy — cukup untuk pakai biasa, tapi bisa brute-force (~31^8 = 852 miliar kombinasi).

**Fix:** Gunakan `crypto.getRandomValues` (seperti yang sudah dipakai di `generateDownloadToken()`):
```ts
export function generateCashbackCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return "YTC-" + Array.from(bytes, b => chars[b % chars.length]).join("");
}
```

---

### 🟡 M-5: Tidak Ada `HSTS` Header

**Masalah:** Header `Strict-Transport-Security` tidak dikonfigurasi di `next.config.js`. Tanpa HSTS, browser tidak dipaksa untuk selalu menggunakan HTTPS, membuka celah downgrade attack.

**Fix:** Tambahkan di `next.config.js`:
```ts
{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
```

---

### 🟡 M-6: `Content-Security-Policy` Masih Ada `'unsafe-inline'` untuk Script & Style

**Masalah:**
```
script-src 'self' 'unsafe-inline' ...
style-src 'self' 'unsafe-inline' ...
```
`'unsafe-inline'` untuk script memungkinkan XSS jika attacker bisa inject konten.

**Fix (jangka panjang):** Gunakan CSP `nonce` yang di-generate per-request. Next.js App Router mendukung ini melalui middleware.

---

### 🟡 M-7: Checkout Tidak Validasi Format Email & WhatsApp

**Masalah** di `app/api/checkout/route.ts` L21-23:
```ts
const { fullName, whatsapp, email, tier, agreeSnk } = body || {};
if (!fullName || !email || !tier) { ... }
```
Tidak ada validasi format email (bisa diisi `"a"` atau `"<script>"`), tidak ada validasi format nomor WhatsApp.

**Fix:**
```ts
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
}
const waRegex = /^(\+62|62|0)[0-9]{8,13}$/;
if (whatsapp && !waRegex.test(whatsapp.replace(/\s/g, ""))) {
  return NextResponse.json({ error: "Format WhatsApp tidak valid." }, { status: 400 });
}
```

---

### 🟡 M-8: Download Token — Tidak Ada Rate Limit

**Masalah** di `app/api/download/route.ts`: Endpoint `GET /api/download?token=...` tidak memiliki rate limit. Attacker bisa brute-force token download (walau 48-char hex sangat sulit).

**Fix:** Tambahkan rate limit berbasis IP (5-10 request/menit).

---

## 🔵 LOW — Nice to Have

### 🔵 L-1: Tidak Ada Log Audit Trail untuk Aksi Admin

Saat admin update status order (`PATCH /api/admin/orders`) tidak ada log siapa yang mengubah apa dan kapan. Jika terjadi insiden, tidak bisa dilacak.

**Fix:** Tambahkan tabel `audit_logs` di Supabase yang merekam setiap perubahan admin.

---

### 🔵 L-2: Midtrans Webhook Tidak Ada Rate Limit / IP Whitelist

Webhook Midtrans bisa di-flood oleh pihak lain. Idealnya, whitelist IP Midtrans atau tambahkan rate limit.

---

### 🔵 L-3: Tidak Ada `robots.txt` untuk Blokir Crawling API Routes

Pastikan `robots.txt` memblokir crawler dari mengindeks `/api/*`, `/admin/*`, `/arsip`.

---

### 🔵 L-4: Error Message Terlalu Informatif di Beberapa Tempat

Contoh di `admin/orders/route.ts`:
```ts
return NextResponse.json({ error: error.message }, { status: 500 });
```
Pesan error database Supabase bisa bocorkan nama tabel, kolom, atau struktur query ke client.

**Fix:** Ganti dengan pesan generik: `"Terjadi kesalahan server."` dan log detail ke server log saja.

---

## 📋 Ringkasan Prioritas

| Prioritas | Item | File |
|-----------|------|------|
| 🔴 CRITICAL | Rotate semua credentials di `.env.local` (jika pernah di-commit) | `.env.local` |
| 🔴 CRITICAL | Generate `ADMIN_SESSION_SECRET` baru yang kuat di prod | `.env.local` → Vercel |
| 🔴 CRITICAL | Hapus field `meta` dari `GET /api/settings` (public endpoint) | `app/api/settings/route.ts` |
| 🔴 CRITICAL | Hapus field `meta` dari `GET /api/admin/settings` | `app/api/admin/settings/route.ts` |
| 🟠 HIGH | Ganti rate limiter ke Redis/Upstash | `lib/rateLimit.ts` |
| 🟠 HIGH | Tambah Telegram webhook secret verification | `app/api/telegram/webhook/route.ts` |
| 🟠 HIGH | Aktifkan CRON_SECRET untuk endpoint cron | `app/api/cron/telegram-digest/route.ts` |
| 🟠 HIGH | Validasi whitelist `status` di PATCH orders/claims | `app/api/admin/orders/route.ts`, `claims/route.ts` |
| 🟠 HIGH | Ganti `===` dengan `timingSafeEqual` untuk password | `app/api/admin-login/route.ts`, `admin-gate/route.ts` |
| 🟠 HIGH | Fix IP extraction (`x-forwarded-for` spoofing) | `lib/requestMeta.ts`, `admin-login/route.ts` |
| 🟡 MEDIUM | Jadikan bucket `cashback-proofs` private + signed URL | `supabase/schema.sql` |
| 🟡 MEDIUM | Tambahkan HSTS header | `next.config.js` |
| 🟡 MEDIUM | Validasi format email & WhatsApp di checkout | `app/api/checkout/route.ts` |
| 🟡 MEDIUM | Ganti `Math.random()` → `crypto.getRandomValues` di cashCode | `lib/cashCode.ts` |
| 🟡 MEDIUM | Rate limit endpoint download | `app/api/download/route.ts` |
| 🔵 LOW | Tambahkan audit log tabel untuk aksi admin | Supabase schema |
| 🔵 LOW | Tambahkan `robots.txt` | `/public/robots.txt` |
| 🔵 LOW | Generalize error message dari Supabase | Semua admin API routes |

---

> **Total: 4 Critical, 6 High, 5 Medium, 3 Low = 18 security issues**
