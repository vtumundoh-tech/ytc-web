"use client";

import { useState } from "react";
import { TIERS, formatRupiah } from "@/lib/tiers";
import { CreditCard, User, Phone, Mail, CheckCircle, ArrowRight } from "lucide-react";

export default function BeliPage() {
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("");
  const [agree, setAgree] = useState(false);
  const [snkOpen, setSnkOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName || !whatsapp || !tier || !agree) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, whatsapp, email, tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat transaksi");
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan, coba lagi.");
      setLoading(false);
    }
  }

  const selected = TIERS.find((t) => t.value === tier);
  const canSubmit = fullName && whatsapp && tier && agree && !loading;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200/50">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Beli Lisensi</h1>
        <p className="text-sm text-gray-500 mt-1">Isi data, pilih paket, lalu bayar — key dikirim setelah dikonfirmasi.</p>
      </div>

      <form onSubmit={handleSubmit} className="card-lg space-y-6 animate-slide-up">
        <div className="space-y-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Data Diri</h2>

          <div>
            <label className="field-label">
              <User className="w-3.5 h-3.5 inline mr-1.5 text-emerald-500" />
              Nama Lengkap <span className="text-red-400">*</span>
            </label>
            <input
              className="input-field"
              placeholder="Contoh: Budi Santoso"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">
              <Phone className="w-3.5 h-3.5 inline mr-1.5 text-emerald-500" />
              Nomor WhatsApp <span className="text-red-400">*</span>
            </label>
            <input
              className="input-field"
              type="tel"
              placeholder="Contoh: 08123456789"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
            />
            <p className="field-hint">Aktif — untuk konfirmasi dan pengiriman key lisensi</p>
          </div>

          <div>
            <label className="field-label">
              <Mail className="w-3.5 h-3.5 inline mr-1.5 text-emerald-500" />
              Alamat Email
            </label>
            <input
              className="input-field"
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="field-hint">Opsional — alternatif jika WA tidak bisa dihubungi</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Pilih Paket</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {TIERS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTier(t.value)}
                className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  tier === t.value
                    ? "border-emerald-400 bg-emerald-50/50 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                {tier === t.value && (
                  <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-emerald-500" />
                )}
                <div className="font-semibold text-sm text-gray-900">{t.label}</div>
                <div className="text-base font-bold text-emerald-600 mt-1">{formatRupiah(t.amount)}</div>
              </button>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <button
            type="button"
            onClick={() => setSnkOpen((v) => !v)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Syarat & Ketentuan <span className="text-red-400">*</span>
            </span>
            <span className={`text-gray-300 transition-transform duration-200 ${snkOpen ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
          {snkOpen && (
            <div className="mt-3 p-4 rounded-xl bg-gray-50 text-xs text-gray-500 leading-relaxed space-y-2 animate-fade-in">
              <p>1. Key lisensi dikirim via WhatsApp setelah pembayaran dikonfirmasi otomatis oleh sistem.</p>
              <p>2. Semua pembelian bersifat final. Tidak ada refund setelah key dikirim.</p>
              <p>3. Manipulasi waktu sistem untuk memperpanjang lisensi akan diblokir otomatis.</p>
              <p>4. Data Anda hanya untuk keperluan aktivasi, tidak dibagikan ke pihak ketiga.</p>
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-50/30 border border-emerald-100 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 accent-emerald-600 w-4 h-4 rounded"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <div>
            <div className="text-sm font-semibold text-emerald-900">Saya setuju dengan Syarat & Ketentuan</div>
            <div className="text-xs text-emerald-700/70 mt-0.5">Termasuk No Refund Policy</div>
          </div>
        </label>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 animate-fade-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-emerald w-full flex items-center justify-center gap-2"
        >
          {loading ? "Memproses..." : (
            <>Lanjut ke Pembayaran <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>
    </div>
  );
}
