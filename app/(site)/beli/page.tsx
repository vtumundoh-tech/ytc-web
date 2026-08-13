"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { formatPrice, formatRupiah } from "@/lib/tiers";
import { useAppSettings } from "@/hooks/useAppSettings";
import { CreditCard, User, Phone, Mail, CheckCircle, ArrowRight, ExternalLink, Gift, TrendingUp, Download, Loader2, QrCode, Home, BellRing } from "lucide-react";

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
  const [cashbackCode, setCashbackCode] = useState("");
  const [paidModal, setPaidModal] = useState(false);
  const [downloadToken, setDownloadToken] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [dlState, setDlState] = useState<"prep" | "countdown" | "error">("prep");
  const [countdown, setCountdown] = useState(5);
  const autoFired = useRef(false);
  const [qrisModal, setQrisModal] = useState(false);
  const [qrisState, setQrisState] = useState<"waiting" | "claimed">("waiting");
  const [qrisAmount, setQrisAmount] = useState(0);
  const [qrisOrderId, setQrisOrderId] = useState("");

  function openPaidModal() {
    setDlState("prep");
    setCountdown(5);
    setPaidModal(true);
  }

  useEffect(() => {
    if (!paidModal || !downloadToken) return;
    autoFired.current = false;
    let counter = 5;
    setDlState("prep");
    setCountdown(counter);
    (async () => {
      try {
        const res = await fetch(`/api/download?token=${encodeURIComponent(downloadToken)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal membuat tautan unduh.");
        setDownloadUrl(data.url);
        setDlState("countdown");
        const timer = setInterval(() => {
          counter -= 1;
          setCountdown(counter);
          if (counter <= 0) {
            clearInterval(timer);
            if (!autoFired.current) {
              autoFired.current = true;
              const a = document.createElement("a");
              a.href = data.url;
              a.rel = "noopener";
              a.download = "";
              document.body.appendChild(a);
              a.click();
              a.remove();
            }
          }
        }, 1000);
      } catch (err: any) {
        setDlState("error");
        setError(err.message || "Gagal menyiapkan unduhan.");
      }
    })();
  }, [paidModal, downloadToken]);

  useEffect(() => {
    if (preselected && tiers.some((t) => t.value === preselected)) {
      setTier(preselected);
      setAddon1080(preselectedAddon);
    }
  }, [preselected, preselectedAddon]);

  useEffect(() => {
    if (!qrisModal || !downloadToken) return;
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`/api/order-status?token=${encodeURIComponent(downloadToken)}`, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data && data.found && data.paid) {
          setQrisModal(false);
          openPaidModal();
        }
      } catch {
        /* abaikan, coba lagi di interval berikutnya */
      }
    };
    check();
    const timer = setInterval(check, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [qrisModal, downloadToken]);

  async function handleClaimed() {
    if (qrisState === "claimed") return;
    setQrisState("claimed");
    try {
      await fetch("/api/order-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: downloadToken }),
      });
    } catch {
      /* notif admin tetap dikirim di polling berikutnya */
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName || !email || !tier || !agree) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, whatsapp, email, tier, addon1080, agreeSnk: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat transaksi");

      setCashbackCode(data.cashbackCode || "");
      if (data.paid) {
        setDownloadToken(data.downloadToken || "");
        openPaidModal();
      } else if (data.qrisEnabled) {
        setDownloadToken(data.downloadToken || "");
        setQrisAmount(data.amount || 0);
        setQrisOrderId(data.orderId || "");
        setQrisState("waiting");
        setQrisModal(true);
      } else {
        setError("Mode pembayaran belum aktif. Silakan hubungi admin.");
        setLoading(false);
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
  const canSubmit = fullName && email && tier && agree && !loading;
  const isCashbackEligible = cashback > 0;

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
              Nomor WhatsApp
            </label>
            <input
              className="input-field"
              type="tel"
              placeholder="Contoh: 08123456789"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
            <p className="field-hint">Kami akan menghubungi Anda melalui nomor ini untuk konfirmasi dan informasi lebih lanjut  .</p>
            <p className="field-hint">Harap gunakan nomor yang sama jika anda ingin mengklaim cashback</p>
          </div>

          <div>
            <label className="field-label">
              <Mail className="w-3.5 h-3.5 inline mr-1.5 text-emerald-500" />
              Alamat Email <span className="text-red-400">*</span>
            </label>
            <input
              className="input-field"
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="field-hint">Untuk pengiriman invoice & konfirmasi</p>
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
                      {formatPrice(addon1080 && isSelected ? totalPrice : cardPrice)}
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
            <>Submit Pembelian — {formatRupiah(totalPrice)} <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Pembayaran Anda diproses dengan aman.
        </p>
      </motion.form>

      {qrisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 no-print">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center animate-scale-in">
            <QrCode className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Bayar via QRIS</h2>
            <p className="text-sm text-gray-500 mb-4">
              Scan kode QR di bawah menggunakan GoPay atau aplikasi e-wallet / m-banking Anda.
            </p>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 mb-4">
              {settings.qrisImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.qrisImageUrl} alt="QRIS" className="mx-auto w-52 h-52 object-contain" />
              ) : (
                <p className="text-sm text-gray-400 py-10">QRIS belum dikonfigurasi admin.</p>
              )}
            </div>

            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-gray-500">Total yang dibayar</span>
              <span className="font-bold text-gray-900">{formatRupiah(qrisAmount)}</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-left mb-4">
              <h3 className="text-xs font-semibold text-blue-800 mb-2">Cara Pembayaran</h3>
              <ol className="text-xs text-blue-900 space-y-1 list-decimal list-inside">
                {(settings.qrisInstructions || "").split("\n").filter(Boolean).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ol>
            </div>

            {qrisState === "claimed" && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 mb-4 flex items-start gap-2">
                <BellRing className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Terima kasih! Admin akan memverifikasi pembayaran Anda. Email invoice & link unduhan otomatis
                  terkirim setelah status menjadi <strong>Lunas</strong>.
                </span>
              </div>
            )}

            <button
              onClick={handleClaimed}
              disabled={qrisState === "claimed"}
              className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {qrisState === "claimed" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {qrisState === "claimed" ? "Menunggu verifikasi admin…" : "Saya sudah bayar"}
            </button>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs">
              <button onClick={() => router.push("/")} className="inline-flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2">
                <Home className="w-3.5 h-3.5" /> Kembali ke Beranda
              </button>
              <span className="text-gray-300">·</span>
              <span className="text-gray-400">Status dicek otomatis tiap 5 detik</span>
            </div>
          </div>
        </div>
      )}

      {paidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 no-print">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Pembayaran Berhasil!</h2>
            <p className="text-sm text-gray-500 mb-4">
              Terima kasih, {fullName}. Pembayaran Anda telah berhasil diproses.
            </p>

            {/* Download aplikasi */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-left mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-emerald-800">Download Aplikasi</h3>
              </div>
              {dlState === "prep" && (
                <p className="text-xs text-emerald-700 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyiapkan unduhan…
                </p>
              )}
              {dlState === "countdown" && (
                <p className="text-xs text-emerald-700">
                  Mengunduh otomatis dalam <strong className="text-emerald-800">{countdown} detik</strong>…
                </p>
              )}
              {dlState === "error" && (
                <p className="text-xs text-red-600">{error || "Gagal menyiapkan unduhan."}</p>
              )}
              {downloadUrl && (
                <>
                  <a
                    href={downloadUrl}
                    className="mt-3 inline-flex items-center justify-center gap-2 w-full px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md"
                  >
                    <Download className="w-4 h-4" /> Unduh Aplikasi
                  </a>
                  <p className="text-[11px] text-emerald-700 mt-2">
                    Harap unduh di <strong>Komputer</strong>, bukan di HP. Tautan juga dikirim ke email{" "}
                    <strong>{email}</strong> bila perlu mengunduh kembali dalam 24 jam.
                  </p>
                </>
              )}
            </div>

            {/* Kode unik cashback (hanya paket eligible) */}
            {isCashbackEligible && (
              <div className="text-left mb-4">
                <p className="text-xs text-amber-800 font-semibold mb-2 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" /> Paket ini dapat cashback
                </p>
                <div className="p-4 rounded-xl bg-gray-900 text-white font-mono text-xl tracking-widest mb-2 select-all text-center">
                  {cashbackCode}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Demi alasan keamanan, kode ini <strong>hanya dibuat sekali</strong> dan{" "}
                  <strong>tidak akan ditampilkan lagi</strong>. Harap simpan baik-baik — akan dibutuhkan saat{" "}
                  <strong>klaim cashback</strong>.
                </p>
              </div>
            )}

            <button
              onClick={() => router.push("/")}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md"
            >
              OK <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-gray-400 mt-3">Klik OK untuk kembali ke beranda.</p>
          </div>
        </div>
      )}
    </div>
  );
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
