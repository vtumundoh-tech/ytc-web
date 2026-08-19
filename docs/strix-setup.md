# 🛡️ Strix — AI Pentesting

Strix menjalankan agent pentesting AI otonom yang **mengeksploitasi** target dan
hanya melaporkan temuan yang tervalidasi dengan proof-of-concept (OWASP Top 10:
injection, XSS, SSRF, auth/access-control, IDOR, business logic).

Ada **dua mode** dengan engine sama & hasil sama:

| | **CLI (OSS, lokal)** | **Cloud (app.strix.ai)** |
|---|---|---|
| Prasyarat | Docker + key LLM | Token API (tanpa Docker) |
| Data | Tidak keluar dari mesin (air-gap) | Di infra Strix |
| Biaya | Pakai key LLM sendiri | Paket/kuota platform |
| Cocok untuk | Dev-loop lokal, privacy, free | Tim, jadwal, dashboard, PR review |

**Sumber:** repo `https://github.com/usestrix/strix`, docs `https://docs.strix.ai`.

---

## 1. Setup CLI lokal

### Prasyarat

1. **Docker berjalan** — `docker info`. Scan pertama akan menarik image sandbox
   otomatis. (Setup Docker ada di [docker-setup.md](./docker-setup.md).)
2. **Strix terpasang** — `strix --version`. Bila belum:
   ```bash
   curl -sSL https://strix.ai/install | bash    # atau: pipx install strix-agent
   ```
3. **LLM dikonfigurasi** — dua environment variable (tanyakan ke user, jangan
   pernah hardcode/commit key):
   ```bash
   export STRIX_LLM="openai/gpt-5.4"       # model id LiteLLM (openai/..., anthropic/..., openrouter/...)
   export LLM_API_KEY="<provider api key>"
   ```

### Menjalankan scan

Selalu pakai `-n` (non-interactive) — mode TUI default memblokir agent. Selalu
set `--max-budget` kecuali user berkata lain.

```bash
# Kode lokal (white-box)
strix -n -t ./ --scan-mode standard --max-budget 10

# App / API deployed (black-box)
strix -n -t https://staging.example.com --max-budget 20

# Repo + app bersama (cakupan terbaik)
strix -n -t https://github.com/org/app -t https://staging.example.com

# Fokus dengan kredensial / scope
strix -n -t https://app.example.com --instruction "Gunakan user@example.com:pass. Fokus IDOR & auth bypass."

# Monorepo besar: bind-mount, bukan salin
strix -n --mount ./huge-monorepo
```

### Flag penting

| Flag | Arti |
|---|---|
| `-t, --target` | URL, repo URL, path lokal, domain, atau IP (bisa diulang). |
| `-n, --non-interactive` | Headless, keluar setelah selesai. Wajib untuk agent. |
| `-m, --scan-mode` | `quick` (menit) / `standard` (~30 mnt) / `deep` (jam, default). |
| `--instruction` / `--instruction-file` | Kredensial, area fokus, aturan scope. |
| `--max-budget USD` | Batas keras biaya LLM; scan wrap-up bersih di batas. |
| `--max-turns N` | Batas turn per agent (default 500). |
| `--resume RUN_NAME` | Lanjutkan run sebelumnya dari `strix_runs/`. |

Scan memakan menit (`quick`) sampai jam (`deep`). Jalankan **di background** dan
poll hasilnya, jangan block terminal.

### Exit codes (headless)

- `0` — selesai, tidak ada vuln tervalidasi **dari yang dianalisa**
- `1` — fatal error (env kosong, Docker mati, config salah)
- `2` — ditemukan vulnerability

> `0` **bukan** bukti cakupan penuh: jika `--max-budget`/`--max-turns` tercapai
> sebelum scan selesai, scan wrap-up awal dan tetap exit `0`. Untuk memastikan scan
> benar-benar selesai: cek `strix_runs/<run>/run.json` (status `stopped` = budget
> habis; `completed` = wrap-up normal), lalu cek cost vs `--max-budget` dan cakupan
> pada laporan.

### Membaca hasil

Artifak di `strix_runs/<run-name>/`:

| File | Isi |
|---|---|
| `penetration_test_report.md` | Laporan eksekutif — **baca dulu**. |
| `vulnerabilities/*.md` | Satu file per temuan tervalidasi + PoC + remediasi. |
| `vulnerabilities.json` / `.csv` | Semua temuan terstruktur. |
| `findings.sarif` | SARIF 2.1.0 (untuk GitHub code scanning / ASPM). |
| `run.json` | Metadata run, status, target, usage/cost. |

---

## 2. Mode Cloud (tanpa Docker)

Dokumen lengkap ada di skill **managed-pentesting-with-strix** (lihat
[strix-skill-management.md](./strix-skill-management.md)). Ringkasnya:

```bash
export STRIX_API_TOKEN="<token>"   # Settings → API Access di app.strix.ai
BASE=https://app.strix.ai/api/v1

# 1. Launch scan terhadap asset domain/repo yang sudah didaftarkan
scan_id=$(curl -sS "$BASE/scans" \
  -H "Authorization: Bearer $STRIX_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"engagement_type":"live_test","domain_ids":["<domain-uuid>"]}' | jq -r .scan_id)

# 2. Poll sampai terminal
curl -sS "$BASE/scans/$scan_id" -H "Authorization: Bearer $STRIX_API_TOKEN" | jq '.status'

# 3. Export SARIF
curl -sS "$BASE/scans/$scan_id/sarif" -H "Authorization: Bearer $STRIX_API_TOKEN" -o findings.sarif
```

---

## 3. Pelaporan & next steps

- Ringkas temuan per severity (critical/high/medium/low/info) sertakan PoC.
- Remediasi + verifikasi: skill **fix-security-vulnerabilities-with-strix**.
- Integrasi CI/CD: skill **ci-security-scanning-with-strix**.

## Keamanan

Hanya scan target yang Anda miliki / berhak diuji. Cloud menegakkan verifikasi
domain; untuk CLI, konfirmasi otorisasi sendiri bila target tampak infrastruktur
pihak ketiga.

## Project ini

- Repo Strix di-clone (shallow) ke `C:\tools_strix` — di luar repo project.
- 4 skill Strix sudah disalin ke `.opencode/skills/` (lihat
  [strix-skill-management.md](./strix-skill-management.md)).
- Pertama kali disarankan scan **localhost / staging** sebelum produksi.