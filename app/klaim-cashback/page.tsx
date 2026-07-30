"use client";

import { useState } from "react";
import { CASHBACK_TIERS, ADDON_1080 } from "@/lib/tiers";

export default function KlaimCashbackPage() {
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [machineId, setMachineId] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [tier, setTier] = useState("");
  const [addon, setAddon] = useState("no");
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [fFollow, setFFollow] = useState<File | null>(null);
  const [fLike, setFLike] = useState<File | null>(null);
  const [fShare, setFShare] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);
  const [snkOpen, setSnkOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const requiredFilled =
    fullName && whatsapp && machineId && licenseKey && tier && amountPaid && fFollow && fLike && fShare && agree && captcha === "15";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!requiredFilled) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("fullName", fullName);
      fd.append("whatsapp", whatsapp);
      fd.append("machineId", machineId.toUpperCase());
      fd.append("licenseKey", licenseKey);
      fd.append("tier", tier);
      fd.append("addon", addon);
      fd.append("amountPaid", amountPaid);
      fd.append("notes", notes);
      fd.append("screenshotFollow", fFollow as File);
      fd.append("screenshotLike", fLike as File);
      fd.append("screenshotShare", fShare as File);

      const res = await fetch("/api/cashback", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim klaim");
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Klaim terkirim!</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Admin akan memverifikasi bukti Anda maksimal 1x24 jam. Cashback akan ditransfer ke nomor
          WhatsApp yang Anda daftarkan.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <div className="rounded-t-xl bg-violet-600 text-white px-6 py-6">
        <h1 className="text-lg font-bold">Klaim Cashback YouTube Clipper</h1>
        <p className="text-sm opacity-90 mt-1">Isi data & lampirkan bukti follow/like/share untuk klaim cashback.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-b-xl shadow-sm p-6 space-y-5">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
          <strong>Syarat Ringkas:</strong> Follow TikTok @yourstudio &middot; Like & comment video promo
          terbaru (wajib video berbeda tiap klaim) &middot; Share ke minimal 3 teman &middot; Screenshot
          semua langkah &middot; Diproses maksimal 1x24 jam.
        </div>

        <Field label="Nama Lengkap" required hint="Sesuai nama saat pembelian key">
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </Field>

        <Field label="Nomor WhatsApp" required hint="Aktif — untuk konfirmasi dan transfer cashback">
          <input className="input" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
        </Field>

        <Field label="Machine ID (12 digit)" required hint="Buka aplikasi YouTube Clipper, lihat di halaman aktivasi">
          <input
            className="input font-mono uppercase"
            maxLength={12}
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            required
          />
        </Field>

        <Field label="Key Lisensi" required hint="Key utama (720p) yang dibeli">
          <input className="input font-mono" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} required />
        </Field>

        <Field label="Tier yang Dibeli" required>
          <select className="input" value={tier} onChange={(e) => setTier(e.target.value)} required>
            <option value="">— Pilih —</option>
            {CASHBACK_TIERS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Add-on 1080p" hint="Apakah Anda membeli upgrade 1080p?">
          <select className="input" value={addon} onChange={(e) => setAddon(e.target.value)}>
            {ADDON_1080.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Nominal yang Dibayarkan" required hint="Jumlah uang yang Anda transfer">
          <input className="input" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} required />
        </Field>

        <Field label="Screenshot — Follow TikTok" required>
          <input className="input" type="file" accept="image/*" onChange={(e) => setFFollow(e.target.files?.[0] || null)} required />
        </Field>
        <Field label="Screenshot — Like & Comment" required>
          <input className="input" type="file" accept="image/*" onChange={(e) => setFLike(e.target.files?.[0] || null)} required />
        </Field>
        <Field label="Screenshot — Share ke Teman" required>
          <input className="input" type="file" accept="image/*" onChange={(e) => setFShare(e.target.files?.[0] || null)} required />
        </Field>

        <Field label="Catatan Tambahan" hint="Opsional">
          <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <Field label="Verifikasi" required hint="Berapa hasil dari 7 + 8?">
          <input className="input max-w-[150px]" type="number" value={captcha} onChange={(e) => setCaptcha(e.target.value)} required />
        </Field>

        <hr />

        <div>
          <label className="font-semibold text-sm text-gray-900 block mb-1">
            Syarat & Ketentuan Cashback <span className="text-red-600">*</span>
          </label>
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setSnkOpen((v) => !v)}
              className="w-full flex justify-between items-center px-4 py-3 text-sm font-medium bg-gray-50 hover:bg-gray-100"
            >
              <span>Klik untuk membaca Syarat & Ketentuan lengkap</span>
              <span className={`transition-transform ${snkOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {snkOpen && (
              <div className="px-4 py-3 text-sm text-gray-600 leading-relaxed space-y-2">
                <p>Cashback hanya berlaku 1 kali per key, non-tunai, ditransfer ke WhatsApp terdaftar, dan tidak bisa digabung promo lain.</p>
                <p>Video like & comment wajib berbeda setiap klaim — mengulang video yang sama dianggap tidak sah.</p>
                <p>Kecurangan (akun palsu, bot, klaim ganda, video sama berulang) mengakibatkan klaim ditolak permanen, blacklist, dan key aktif dapat dicabut tanpa refund.</p>
                <p>Keputusan Admin bersifat mutlak. Syarat & ketentuan dapat berubah sewaktu-waktu.</p>
              </div>
            )}
          </div>
        </div>

        <label className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4 cursor-pointer">
          <input type="checkbox" className="mt-1 accent-emerald-600 w-4 h-4" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <div>
            <div className="font-semibold text-sm text-emerald-900">Saya setuju dengan Syarat & Ketentuan yang berlaku</div>
            <div className="text-xs text-emerald-800/80 mt-1">Jika tidak setuju, Anda tidak dapat mengklaim cashback.</div>
          </div>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={!requiredFilled || loading}
            className="bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-700 text-white font-semibold px-8 py-3 rounded-lg"
          >
            {loading ? "Mengirim..." : "Kirim Klaim Cashback"}
          </button>
        </div>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 0.7rem;
          border: 1px solid #dadce0;
          border-radius: 0.5rem;
          font-size: 0.9rem;
        }
        .input:focus {
          outline: none;
          border-color: #673ab7;
          box-shadow: 0 0 0 2px rgba(103, 58, 183, 0.15);
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-semibold text-sm text-gray-900 block mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {hint && <div className="text-xs text-gray-500 mb-1.5">{hint}</div>}
      {children}
    </div>
  );
}
