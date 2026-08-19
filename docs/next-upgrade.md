# ⬆️ Upgrade Next.js 14.2.35 → 15.5.23

## Mengapa di-upgrade

**Pemicu:** `npm audit` melaporkan 3 vulnerability **high** di dependensi.

- **Penyebab:** vulnerabilitas pada bundle `postcss` milik `next` dan library `sharp`,
  plus celah lain hasil sematan Next 14.
- **Kenapa tidak cukup patuh diri sendiri?** Vercel merilis patch keamanan hanya untuk
  versi terbaru (15.5.x / 16.x). Next.js **13/14 tidak lagi mendapat backport** —
  sudah *end-of-line*. Jadi untuk mendapatkan patch, upgrade major **14 → 15** tidak
  bisa dihindari. Di VPS/self-host (tanpa platform yang menyuntikkan patch), celah itu
  tetap nyata selama versi lama terpasang.

## Keputusan versi

- **Pilih 15.5.23** — versi 15.x terbaru *to-date*, mendapat patch penuh dari Vercel
  (tag `backport`), tetap di major 15 sehingga perubahan breaking minimal vs 16.
- **Tidak pilih 16.x** — 16.x membawa breaking change besar (React 19, dll) yang
  membutuhkan penyesuaian lebih luas dan lebih berisiko bagi project berjalan.

## Alasan aman untuk project ini

Sebelum upgrade, dilakukan investigasi kompatibilitas dengan Next 15:

- Semua invoice page memakai `useParams()` (client component) — **tidak kena** async
  params (perubahan breaking utama di Next 15).
- Tidak ada penggunaan `next/headers` yang bergantung perilaku lama.
- `middleware.ts` API tetap stabil di Next 15.
- `next.config.js` hanya berisi `headers()` — tidak berubah.

## Langkah yang dilakukan

```bash
# 1. Pasang Next 15.5.23 secara eksplisit
npm i next@15.5.23

# 2. Naikkan devDependency postcss untuk hilangkan bentrok override
#    (package.json: "postcss": "^8.5.23")

# 3. Pastikan "overrides" di package.json (untuk audit bersih)
#    "overrides": {
#      "postcss": "^8.5.23",
#      "sharp": "^0.35.0"
#    }
```

Catatan teknis override:

- Override *nested* `"next": { "postcss": ... }` **tidak berfungsi** di npm.
- Override *global* bentrok bila postcss juga direct dependency.
- Solusi final: postcss langsung sebagai devDependency `^8.5.23` **plus** override
  global — valid. Hasilnya semua postcss termasuk punya `next` ter-dedupe ke `8.5.26`
  dan sharp ke `0.35.3`.

### React tetap 18.3.1

Project sengaja **tidak** di-upgrade ke React 19. Next 15.5.23 kompatibel dengan
React 18, jadi tidak perlu ikut pindah major.

## Verifikasi yang dijalankan

```bash
npx tsc --noEmit                  # type-check bersih
npx next build                    # sukses, 26 halaman statis + middleware
npm audit                         # 0 vulnerabilities
npm ls postcss sharp              # dedupe ke 8.5.26 / 0.35.3
```

### Smoke-test server produksi lokal

```bash
npx next start -p 3199
```

| URL | Hasil |
|---|---|
| `/` | 200 |
| `/beli` | 200 |
| `/unduh` | 200 |
| `/order` | 200 |
| `/admin/login` | 307 (gate middleware jalan) |
| `/arsip` | 200 |
| `/klaim-cashback` | 200 |
| `/syarat-ketentuan` | 200 |
| `/api/settings` | 200 |

### Suspense

Halaman `app/(site)/beli/page.tsx` dan `app/(site)/unduh/page.tsx` sudah dibungkus
`<Suspense>` — tidak ada perubahan kode yang diperlukan untuk Next 15.

## Ketentuan di server produksi (VPS)

- **Node.js ≥ 18.18** wajib untuk Next 15. Cek dengan `node -v`.

## Rollback (jika perlu)

```bash
git revert <commit-upgrade>            # atau git checkout versi lama dari history
npm i next@14.2.35
npm audit                              # akan kembali menampilkan high vuln (diketahui)
```