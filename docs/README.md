# 📚 Dokumentasi Teknis — ytc-web

Kumpulan panduan setup & operasional untuk project ini. Semua dokumen ditulis
berdasarkan **riwayat nyata** yang sudah dilakukan di project ini.

| Dokumen | Isi |
|---|---|
| [README-MD-induk](../README.md) | Setup awal proyek (Supabase, Midtrans, deploy Vercel). |
| [next-upgrade.md](./next-upgrade.md) | Upgrade Next.js 14.2.35 → 15.5.23, alasan, cara, verifikasi, rollback. |
| [docker-setup.md](./docker-setup.md) | Setup Docker Desktop (Windows, per-user) untuk Strix & tooling. |
| [strix-setup.md](./strix-setup.md) | Setup & penggunaan Strix (AI pentesting) — CLI lokal & cloud. |
| [strix-skill-management.md](./strix-skill-management.md) | Kelola skill opencode Strix: pindah proyek, jadikan global, hapus, re-sync. |

## Ringkasan stack

- **Frontend/Backend:** Next.js (App Router) 15.5.23, React 18.3.1
- **Database & Storage:** Supabase (PostgreSQL + storage) + Cloudflare R2 (installer)
- **Payment:** Midtrans (QRIS / VA / e-wallet)
- **Notifikasi:** Telegram Bot
- **Hosting:** Vercel (optionally self-host VPS dengan Dockerfile yang tersedia)
- **Keamanan tambahan:** Strix AI pentesting (Docker sandbox lokal)

## Catatan versi penting

- `package.json`: `next` di `^15.5.23`, `postcss` devDependency `^8.5.23`,
  plus block `overrides` untuk `postcss` & `sharp` (menghasilkan `npm audit` = 0 vulnerability).
- `docs/next-upgrade.md` berisi detail kenapa major upgrade 14→15 tidak bisa dihindari.
- `docs/docker-setup.md` berisi detail instalasi Docker Desktop per-user untuk Windows.