"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/tiers";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Gift, User, Phone, Hash, Key, Tag, Image, FileText, CheckCircle, AlertTriangle, TrendingUp, ExternalLink, Search } from "lucide-react";

export default function KlaimCashbackPage() {
  const { settings } = useAppSettings();
  const tiers = settings.tiers;

  const [machineId, setMachineId] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkState, setCheckState] = useState<"idle" | "ok" | "notfound">("idle");
  const [unlocked, setUnlocked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [tier, setTier] = useState("");
  const [addon1080, setAddon1080] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [fPayment, setFPayment] = useState<File | null>(null);
  const [fFollow, setFFollow] = useState<File | null>(null);
  const [fLike, setFLike] = useState<File | null>(null);
  const [fShare, setFShare] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);
  const [snkOpen, setSnkOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const requiredFilled =
    machineId && fullName && whatsapp && licenseKey && tier && amountPaid && fPayment && fFollow && fLike && fShare && agree && captcha === "15";

  async function handleCheck() {
    setChecking(true);
    setError("");
    setCheckState("idle");
    try {
      const res = await fetch(`/api/cashback/check?q=${encodeURIComponent(machineId.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memeriksa data.");
      if (!data.found) {
        setCheckState("notfound");
        setUnlocked(false);
        return;
      }
      const d = data.data;
      setFullName(d.full_name || "");
      setWhatsapp(d.whatsapp || "");
      setLicenseKey(d.license_key || "");
      setTier(d.tier || "");
      setAddon1080(Boolean(d.addon1080));
      setAmountPaid(d.amount ? String(d.amount) : "");
      setUnlocked(true);
      setCheckState("ok");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setChecking(false);
    }
  }

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
      fd.append("addon1080", addon1080 ? "yes" : "no");
      fd.append("amountPaid", amountPaid);
      fd.append("notes", notes);
      fd.append("agreeSnk", "yes");
      fd.append("paymentProof", fPayment as File);
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
      <div className="max-w-lg mx-auto px-4 py-16 sm:py-24">
        <div className="card-lg text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-violet-600 animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">Klaim terkirim!</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Admin akan memverifikasi bukti Anda maksimal 1x24 jam. Cashback akan ditransfer ke nomor WhatsApp yang Anda daftarkan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200/50">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Klaim Cashback</h1>
        <p className="text-sm text-gray-500 mt-1">Lampirkan bukti bayar & bukti follow, like & share untuk klaim cashback Anda.</p>
      </div>

      <div className="card-sm mb-6 flex items-start gap-3 animate-fade-in">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-700">Syarat Ringkas:</strong> Follow TikTok @yourstudio &middot; Like & comment video promo terbaru &middot; Share ke 3 teman &middot; Screenshot semua langkah. &middot; Harap diisi data yang sebenar-benarnya seperti yang di submit saat pembelian agar mudah untuk kami melakukan tracking untuk pengembalian dana. Jika data yang ditemukan berbeda bukan tanggung jawab kami karena tidak dapat meneruskan cashback.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-lg space-y-6 animate-slide-up">
        <div className="space-y-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Cek Data Pembelian</h2>

          <div>
            <label className="field-label">
              <Hash className="w-3.5 h-3.5 inline mr-1.5 text-violet-500" />
              Machine ID <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                className="input-field flex-1 font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                maxLength={12}
                placeholder="12 digit dari aplikasi"
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                disabled={checking}
                required
              />
              <button
                type="button"
                onClick={handleCheck}
                disabled={checking || machineId.trim().length < 3}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shrink-0"
              >
                <Search className="w-4 h-4" />
                {checking ? "Mengecek..." : "Check Data"}
              </button>
            </div>
            <p className="field-hint">Isi Machine ID dari aplikasi. Untuk pembelian lama bisa gunakan key lisensi atau nama lengkap.</p>
            {checkState === "ok" && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 flex items-start gap-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Data ditemukan! Field di bawah terbuka & sudah terisi otomatis. Anda bisa mengubahnya jika perlu.</span>
              </div>
            )}
            {checkState === "notfound" && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-700 flex items-start gap-2 animate-fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Data tidak ditemukan. Pastikan Machine ID, key lisensi, atau nama lengkap sesuai saat pembelian.</span>
              </div>
            )}
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="space-y-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Informasi Pengguna</h2>

          <Field icon={User} label="Nama Lengkap" required>
            <input
              className="input-field disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!unlocked}
              required
            />
          </Field>

          <Field icon={Phone} label="Nomor WhatsApp" required hint="Aktif — untuk konfirmasi dan transfer cashback">
            <input
              className="input-field disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              disabled={!unlocked}
              required
            />
          </Field>

          <Field icon={Key} label="Key Lisensi" required hint="Key utama (720p) yang dibeli">
            <input
              className="input-field font-mono disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              disabled={!unlocked}
              required
            />
          </Field>
        </div>

        <hr className="border-gray-100" />

        <div className="space-y-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Informasi Pembelian</h2>

          <Field icon={Tag} label="Tier yang Dibeli" required>
            <select
              className="input-field disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
              value={tier}
              onChange={(e) => { setTier(e.target.value); setAddon1080(false); }}
              disabled={!unlocked}
              required
            >
              <option value="">— Pilih —</option>
              {tiers.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>

          <div>
            <label className="field-label">
              <TrendingUp className="w-3.5 h-3.5 inline mr-1.5 text-violet-500" />
              Upgrade 1080p
            </label>
            <button
              type="button"
              disabled={!unlocked || !tier}
              onClick={() => setAddon1080(!addon1080)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                !unlocked || !tier
                  ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                  : addon1080
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  !unlocked || !tier ? "border-gray-200 bg-gray-50" :
                  addon1080 ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"
                }`}>
                  {addon1080 && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm font-medium ${!unlocked || !tier ? "text-gray-300" : addon1080 ? "text-blue-700" : "text-gray-600"}`}>
                  Saya membeli upgrade 1080p
                </span>
              </div>
              {tier && (settings.addonPrices[tier] || 0) > 0 && (
                <span className={`text-xs font-bold ${addon1080 ? "text-blue-700" : "text-gray-400"}`}>
                  +{formatRupiah(settings.addonPrices[tier] || 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="space-y-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Upload Bukti</h2>

          <FileUpload label="Bukti Bayar" file={fPayment} onChange={setFPayment} required />
          <FileUpload label="Screenshot — Follow TikTok" file={fFollow} onChange={setFFollow} required />
          <FileUpload label="Screenshot — Like & Comment" file={fLike} onChange={setFLike} required />
          <FileUpload label="Screenshot — Share ke Teman" file={fShare} onChange={setFShare} required />
        </div>

        <hr className="border-gray-100" />

        <Field icon={FileText} label="Catatan Tambahan" hint="Opsional">
          <textarea className="input-field" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <div>
          <label className="field-label">
            <CheckCircle className="w-3.5 h-3.5 inline mr-1.5 text-violet-500" />
            Verifikasi <span className="text-red-400">*</span>
          </label>
          <input className="input-field max-w-[160px]" type="number" placeholder="7 + 8 = ?" value={captcha} onChange={(e) => setCaptcha(e.target.value)} required />
          <p className="field-hint">Berapa hasil dari 7 + 8?</p>
        </div>

        <hr className="border-gray-100" />

        <div>
          {snkOpen && (
            <div className="mt-3 p-4 rounded-xl bg-gray-50 text-xs text-gray-500 leading-relaxed space-y-2 animate-fade-in">
              <p>Cashback hanya berlaku 1 kali per key, non-tunai, ditransfer ke WhatsApp terdaftar.</p>
              <p>Video like & comment wajib berbeda setiap klaim — mengulang video yang sama dianggap tidak sah.</p>
              <p>Kecurangan mengakibatkan blacklist permanen & key dapat dicabut tanpa refund.</p>
              <p>Keputusan Admin bersifat mutlak.</p>
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-violet-50/30 border border-violet-100 cursor-pointer">
          <input type="checkbox" className="mt-0.5 accent-violet-600 w-4 h-4 rounded" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <div>
            <div className="text-sm font-semibold text-violet-900">
              Saya setuju dengan{" "}
              <a
                href="/syarat-ketentuan"
                target="_blank"
                className="underline underline-offset-2 hover:text-violet-800"
                onClick={(e) => e.stopPropagation()}
              >
                Syarat & Ketentuan
                <ExternalLink className="w-3 h-3 inline ml-0.5" />
              </a>
            </div>
          </div>
        </label>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 animate-fade-in">
            {error}
          </div>
        )}

        <button type="submit" disabled={!requiredFilled || loading} className="btn-purple w-full flex items-center justify-center gap-2">
          {loading ? "Mengirim..." : <><Gift className="w-4 h-4" /> Kirim Klaim Cashback</>}
        </button>
      </form>
    </div>
  );
}

function Field({ icon: Icon, label, required, hint, children }: {
  icon: any;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="field-label">
        <Icon className="w-3.5 h-3.5 inline mr-1.5 text-violet-500" />
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

function FileUpload({ label, file, onChange, required }: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="field-label">
        <Image className="w-3.5 h-3.5 inline mr-1.5 text-violet-500" />
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 transition-all duration-200">
        {file ? (
          <div className="text-center">
            <Image className="w-8 h-8 text-violet-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">{file.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            <span className="inline-block mt-2 text-xs text-violet-600 font-medium">Tap untuk ganti file</span>
          </div>
        ) : (
          <div className="text-center">
            <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Tap untuk pilih gambar</p>
            <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, atau WebP (maks 5MB)</p>
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} required={required} />
      </label>
    </div>
  );
}
