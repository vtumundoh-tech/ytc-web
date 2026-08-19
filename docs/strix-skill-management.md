# 🧩 Kelola Skill opencode Strix

4 skill opencode untuk Strix tersedia dan bisa dikelola: dipindah antar proyek,
dijadikan global, dihapus, atau di-resync dari repo sumber.

## 4 skill yang tersedia

| Skill | Fungsi |
|---|---|
| `penetration-testing-with-strix` | Menjalankan pentest (CLI lokal atau cloud). |
| `managed-pentesting-with-strix` | Workflow lengkap mode cloud (asset, polling, laporan, PR review, schedule). |
| `fix-security-vulnerabilities-with-strix` | Remediasi & verifikasi temuan. |
| `ci-security-scanning-with-strix` | Integrasi scanning ke CI/CD. |

## Lokasi saat ini

Skill Strix disalin **per-proyek** di repo ini:

```
.opencode/skills/<nama-skill>/SKILL.md
```

(Format opencode: file harus bernama `SKILL.md`, dalam folder senama, dengan
frontmatter `name` + `description`.)

## Sumber & re-sync

Repo sumber: `https://github.com/usestrix/strix`, folder `skills/`.

```bash
# 1. Dapatkan skill dari repo sumber (cara resmi Strix)
npx skills add usestrix/strix

# 2. Atau salin manual dari clone lokal
Copy-Item "C:\tools_strix\skills\*" -Destination ".opencode\skills\" -Recurse -Force
```

**Re-sync saat pindah proyek / update:** ulangi langkah di atas di proyek baru —
skill bersifat per-proyek, tidak otomatis terbawa.

## Jadikan global (agar tersedia di semua proyek)

Salin skill ke direktori global opencode:

```
~/.config/opencode/skills/<nama-skill>/SKILL.md
```

Di Windows, `~` = `C:\Users\<user>\`. Contoh:

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.config\opencode\skills"
Copy-Item "C:\tools_strix\skills\*" -Destination "$HOME\.config\opencode\skills\" -Recurse -Force
```

Skill global otomatis terbaca di semua proyek. Bila ingin menonaktifkan satu skill
global, hapus foldernya (lihat di bawah).

## Menghapus skill

```powershell
# Hapus per-proyek
Remove-Item -Recurse -Force ".opencode\skills\<nama-skill>"

# Hapus global
Remove-Item -Recurse -Force "$HOME\.config\opencode\skills\<nama-skill>"
```

Ganti `<nama-skill>` dengan salah satu dari 4 nama di tabel atas.

## Cara memuat skill

- Skill yang sudah berada di `.opencode/skills/` atau lokasi global otomatis
  terdaftar saat opencode start. **Restart opencode** setelah menambah/mengubah
  skill agar terdeteksi (config dimuat sekali saat start).
- Saat memuat skill, beri deskripsi singkat apa yang skill tersebut bisa lakukan.
- Skill hanya boleh dipakai untuk target yang Anda berhak uji (lihat Safety di
  [strix-setup.md](./strix-setup.md)).

## Catatan clone lokal

Repo Strix di-clone shallow ke `C:\tools_strix` (di luar repo project) sebagai
sumber salinan manual & referensi docs. Untuk update: `git -C C:\tools_strix pull`.