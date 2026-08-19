# 🐳 Setup Docker Desktop — Windows (per-user)

Docker dibutuhkan oleh **Strix CLI** (sandbox pentest) dan tooling lokal lainnya.

> Riwayat nyata di project ini: instalasi dilakukan **per-user** (bukan admin),
> sehingga path-nya berbeda dari default. Ikuti langkah ini bila Anda
> meng-install tanpa hak admin.

## Instalasi

1. Download installer dari https://www.docker.com/products/docker-desktop/
2. Jalankan installer dengan akun user (bukan administrator).
3. Hasil install ke **per-user location**:
   `%LOCALAPPDATA%\Programs\DockerDesktop` (bukan `C:\Program Files\Docker`).
4. Nyalakan semua opsi integrasi Windows di pengaturan Docker Desktop:
   - Windows Features / Hyper-V & Containers (opsi tersedia selama instalasi)
   - **WSL 2** backend (opsi wajib untuk engine Linux)

> ⚠️ Karena path non-standar, `docker` CLI dari shell biasa **tidak selalu**
> ter-deteksi. Bila `docker` tidak ditemukan, pakai **full path**:
> `& "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin\docker" ...`

### Pastikan WSL tersedia

Docker Desktop menggunakan backend WSL2. Pastikan distro WSL aktif, atau biarkan
Docker Desktop mengelola WSL otomatis.

## Verifikasi instalasi

```powershell
docker version
# Client : Docker on Windows 29.x.x
# Server : Docker Desktop 4.x.x (engine linux/amd64, backend WSL2)
docker info
```

- **Client** = CLI Docker (`docker`).
- **Server** = engine Docker Desktop (backend WSL2), platform `linux/amd64`.

Keduanya harus muncul. Jika hanya Client yang muncul, artinya daemon belum jalan:
buka Docker Desktop dan tunggu sampai status *Engine running*.

## Yang diperoleh di project ini

- Docker Desktop **4.87.0**, Client `29.7.2`, engine `linux/amd64`.
- Sudah diverifikasi berjalan dengan full-path.

## Troubleshooting umum

| Gejala | Solusi |
|---|---|
| `docker: command not found` | Pakai full path ke engine (lihat di atas), atau tambahkan ke `PATH`. |
| Server tidak muncul | Buka Docker Desktop, tunggu *Engine running*. |
| WSL error | `wsl --status`, pastikan WSL2 default. Restart Docker Desktop. |
| Engine lambat / RAM habis | Kurangi alokasi resource di Docker Desktop → Settings. |