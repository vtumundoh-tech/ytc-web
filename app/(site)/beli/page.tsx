"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { formatRupiah } from "@/lib/tiers";
import { useAppSettings } from "@/hooks/useAppSettings";
import { CreditCard, User, Phone, Mail, CheckCircle, ArrowRight, ExternalLink, Gift, TrendingUp } from "lucide-react";

function BeliForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("tier") || "";
  const preselectedAddon = searchParams.get("addon1080") === "1";
  const { settings } = useAppSettings();
  const tiers = settings.tiers;
  const promoEnabled = settings.promoEnabled;

  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState(preselected);
  const [addon1080, setAddon1080] = useState(preselectedAddon);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (preselected && tiers.some((t) => t.value === preselected)) {
      setTier(preselected);
      setAddon1080(preselectedAddon);
    }
  }, [preselected, preselectedAddon]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName || !whatsapp || !tier || !agree) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, whatsapp, email, tier, addon1080, agreeSnk: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat transaksi");

      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
      const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
      const snapUrl = isProd
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

      if (typeof window !== "undefined" && data.token && clientKey) {
        await loadSnapScript(snapUrl, clientKey);
        (window as any).snap.pay(data.token, {
          onSuccess: () => { router.push("/success"); },
          onPending: () => { router.push("/success"); },
          onError: (result: any) => {
            setError(result?.status_message || "Pembayaran gagal, coba lagi.");
            setLoading(false);
          },
          onClose: () => { setLoading(false); },
        });
      } else {
        window.location.href = data.redirectUrl;
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan, coba lagi.");
      setLoading(false);
    }
  }

  const selected = tiers.find((t) => t.value === tier);
  const cashback = tier ? settings.cashbackTiers[tier] || 0 : 0;
  const addonPrice = tier ? settings.addonPrices[tier] || 0 : 0;
  const basePrice = selected ? (promoEnabled ? selected.amount : selected.originalAmount) : 0;
  const totalPrice = tier ? basePrice + (addon1080 ? addonPrice : 0) : 0;
  const canSubmit = fullName && whatsapp && tier && agree && !loading;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200/50">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Beli Lisensi</h1>
        <p className="text-sm text-gray-500 mt-1">Isi data, pilih paket, lalu bayar — key dikirim setelah dikonfirmasi.</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="card-lg space-y-6"
      >
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
            {tiers.map((t, i) => {
              const aPrice = settings.addonPrices[t.value] || 0;
              const isSelected = tier === t.value;
              const cardPrice = isSelected ? basePrice : (promoEnabled ? t.amount : t.originalAmount);
              return (
                <motion.div
                  key={t.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <button
                    type="button"
                    onClick={() => { setTier(t.value); if (addon1080 && !aPrice) setAddon1080(false); }}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 w-full ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-50/50 shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-emerald-500" />
                    )}
                    <div className="font-semibold text-sm text-gray-900">{t.label}</div>
                    <div className="text-base font-bold text-emerald-600 mt-1">
                      {formatRupiah(addon1080 && isSelected ? totalPrice : cardPrice)}
                    </div>

                    {/* Toggle 1080p di dalam kartu aktif */}
                    {isSelected && aPrice > 0 && (
                      <div className="mt-3 pt-3 border-t border-emerald-100">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setAddon1080(!addon1080); }}
                          className={`flex items-center justify-between w-full p-2 rounded-lg border transition-all duration-200 ${
                            addon1080
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                              addon1080
                                ? "bg-blue-600 border-blue-600"
                                : "border-gray-300"
                            }`}>
                              {addon1080 && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-xs font-medium ${addon1080 ? "text-blue-700" : "text-gray-500"}`}>
                              +1080p Upgrade
                            </span>
                          </div>
                          <span className={`text-xs font-bold ${addon1080 ? "text-blue-700" : "text-gray-400"}`}>
                            +{formatRupiah(aPrice)}
                          </span>
                        </button>

                        {addon1080 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1"
                          >
                            <TrendingUp className="w-3 h-3" /> Total: {formatRupiah(totalPrice)}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <label className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-50/30 border border-emerald-100 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 accent-emerald-600 w-4 h-4 rounded"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <div>
              <div className="text-sm font-semibold text-emerald-900">
                Saya setuju dengan{" "}
                <a
                  href="/syarat-ketentuan"
                  target="_blank"
                  className="underline underline-offset-2 hover:text-emerald-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  Syarat & Ketentuan
                  <ExternalLink className="w-3 h-3 inline ml-0.5" />
                </a>
              </div>
              <div className="text-xs text-emerald-700/70 mt-0.5">Termasuk No Refund Policy</div>
            </div>
          </label>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700"
          >
            {error}
          </motion.div>
        )}

        {selected && cashback > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3 text-sm">
            <Gift className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <div className="font-semibold text-amber-800">Paket ini eligible cashback!</div>
              <div className="text-xs text-amber-700">Dapatkan {formatRupiah(cashback)} setelah klaim cashback.</div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md ${
            addon1080
              ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-200/50"
              : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-200/50"
          }`}
        >
          {loading ? "Memproses..." : (
            <>Lanjut ke Pembayaran — {formatRupiah(totalPrice)} <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Pembayaran Anda aman & terenkripsi.
        </p>
      </motion.form>
    </div>
  );
}

function loadSnapScript(snapUrl: string, clientKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).snap) { resolve(); return; }
    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat pembayaran."));
    document.body.appendChild(script);
  });
}

export default function BeliPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="card-lg space-y-6 animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-1/3 mx-auto mb-8" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    }>
      <BeliForm />
    </Suspense>
  );
}
