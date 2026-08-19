"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { formatPrice, formatRupiah } from "@/lib/tiers";
import { useAppSettings } from "@/hooks/useAppSettings";
import { validateFileSignature, validateFileSize, isAllowedMimeType } from "@/lib/fileValidation";
import { parseJsonSafe, isHeicFile, HEIC_ERROR } from "@/lib/fetchJson";
import { CreditCard, User, Phone, Mail, CheckCircle, ArrowRight, ExternalLink, Gift, TrendingUp, Download, Loader2, QrCode, Home, BellRing, Upload, FileImage, X, AlertTriangle } from "lucide-react";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function BeliForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("tier") || "";
  const preselectedAddon = searchParams.get("addon1080") === "1";
  const supplementToken = searchParams.get("supplement") || "";
  const { settings } = useAppSettings();
  const tiers = settings.tiers;
  const promoEnabled = settings.promoEnabled;

  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifyScreen, setVerifyScreen] = useState<"idle" | "otp">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
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
  const [qrisStep, setQrisStep] = useState<"pay" | "confirm" | "proof" | "thanks" | "rejected">("pay");
  const [qrisAmount, setQrisAmount] = useState(0);
  const [qrisOrderId, setQrisOrderId] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionType, setRejectionType] = useState("");
  const [amountPaidByCustomer, setAmountPaidByCustomer] = useState<number | null>(null);
  const [amountRemaining, setAmountRemaining] = useState<number | null>(null);
  const [supplementLoading, setSupplementLoading] = useState(!!supplementToken);
  const [refundOk, setRefundOk] = useState(false);
  const [busy, setBusy] = useState<"" | "refund" | "supplement">("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState("");

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
        if (!cancelled && data && data.found) {
          if (data.paid) {
            setQrisModal(false);
            openPaidModal();
          } else if (data.rejected) {
            setRejectionReason(data.rejectionReason || "");
            setRejectionType(data.rejectionType || "");
            setAmountPaidByCustomer(data.amountPaidByCustomer || null);
            setAmountRemaining(data.amountRemaining || null);
            setQrisStep("rejected");
          }
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

  useEffect(() => {
    if (!supplementToken) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/order-status?token=${encodeURIComponent(supplementToken)}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data && data.found && data.amount) {
          setDownloadToken(supplementToken);
          setQrisAmount(data.amount);
          setQrisOrderId("");
          setQrisStep("pay");
          setQrisModal(true);
          setPaymentConfirmed(false);
        } else {
          setError("Tautan pembayaran pelengkap tidak valid. Gunakan tautan dari email atau halaman status pesanan.");
        }
      } catch {
        if (!cancelled) setError("Terjadi kesalahan saat memuat pembayaran pelengkap.");
      } finally {
        if (!cancelled) setSupplementLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supplementToken]);

  function handleBatal() {
    setQrisModal(false);
    setProofFile(null);
    setProofError("");
    setPaymentConfirmed(false);
    setLoading(false);
    if (supplementToken) router.push("/");
  }

  function handleProofFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setProofError("");
    setProofFile(e.target.files?.[0] || null);
  }

  async function handleProofSubmit() {
    setProofError("");
    if (!proofFile) {
      setProofError("Pilih dulu screenshot bukti bayar Anda.");
      return;
    }
    if (isHeicFile(proofFile)) {
      setProofError(HEIC_ERROR);
      return;
    }
    if (!isAllowedMimeType(proofFile.type)) {
      setProofError("Format file harus JPEG/PNG/WebP.");
      return;
    }
    if (!validateFileSize(proofFile.size)) {
      setProofError("Ukuran file maksimal 5MB.");
      return;
    }
    const buffer = await proofFile.arrayBuffer();
    if (!validateFileSignature(buffer, proofFile.type)) {
      setProofError("File tidak valid. Pastikan itu gambar screenshot yang asli.");
      return;
    }
    setProofLoading(true);
    try {
      const fd = new FormData();
      fd.append("token", downloadToken);
      fd.append("paymentProof", proofFile);
      const res = await fetch("/api/order-proof", {
        method: "POST",
        body: fd,
      });
      const data = await parseJsonSafe<{ error?: string }>(res);
      if (!data.ok) throw new Error(data.error || "Gagal mengirim bukti bayar.");
      setQrisStep("thanks");
    } catch (err: any) {
      setProofError(err.message || "Gagal mengirim bukti bayar. Coba lagi.");
    } finally {
      setProofLoading(false);
    }
  }

  async function handleRefundRequest() {
    if (busy) return;
    setBusy("refund");
    setError("");
    try {
      const res = await fetch("/api/refund-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: downloadToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengajukan refund.");
      setRefundOk(true);
    } catch (err: any) {
      setError(err.message || "Gagal mengajukan refund. Coba lagi.");
    } finally {
      setBusy("");
    }
  }

  async function handleBayarKekurangan() {
    if (busy) return;
    setBusy("supplement");
    setError("");
    try {
      const res = await fetch("/api/order-supplement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: downloadToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat pembayaran pelengkap.");
      router.push(`/beli?supplement=${encodeURIComponent(data.downloadToken)}`);
    } catch (err: any) {
      setError(err.message || "Gagal membuat pembayaran pelengkap. Coba lagi.");
      setBusy("");
    }
  }

  async function handleSendVerifyCode() {
    setVerifyError("");
    if (!emailValid) {
      setVerifyError("Alamat email tidak valid, cek kembali.");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email: email.trim() }),
      });
      const data = await parseJsonSafe<{ error?: string; lockedMinutes?: number }>(res);
      if (!data.ok) throw new Error(data.error || "Gagal mengirim kode.");
      setVerifyScreen("otp");
      setOtpCode("");
    } catch (err: any) {
      setVerifyError(err.message || "Gagal mengirim kode verifikasi.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleVerifyCode() {
    setVerifyError("");
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setVerifyError("Masukkan 6 digit kode yang dikirim ke email.");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email: email.trim(), otp: otpCode.trim() }),
      });
      const data = await parseJsonSafe<{ error?: string; remaining?: number; lockedMinutes?: number }>(res);
      if (!data.ok) throw new Error(data.error || "Verifikasi gagal.");
      setEmailVerified(true);
      setOtpCode("");
    } catch (err: any) {
      setVerifyError(err.message || "Verifikasi gagal, coba lagi.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName || !whatsapp || !email || !tier || !agree) return;
    if (!/^\d{8,15}$/.test(whatsapp.trim())) {
      setError("Nomor WhatsApp belum lengkap — isi minimal 8 digit angka (tanpa +62/0 di depan).");
      setLoading(false);
      return;
    }
    if (!emailVerified) {
      setError("Verifikasi email dulu: masukkan email, klik \"Kirim Kode Verifikasi\", lalu masukkan kode 6 digit yang dikirim.");
      setLoading(false);
      return;
    }
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
        setProofFile(null);
        setProofError("");
        setPaymentConfirmed(false);
        setQrisStep("pay");
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
  const waValue = whatsapp.trim();
  const waValid = /^\d{8,15}$/.test(waValue);
  const waInvalid = waValue !== "" && !waValid;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = fullName && waValid && email && emailVerified && tier && agree && !loading;
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
              Nomor WhatsApp <span className="text-red-400">*</span>
            </label>
            <input
              className={cn(
                "input-field",
                waInvalid ? "border-red-400 focus:ring-red-300 focus:border-red-400" : ""
              )}
              type="tel"
              placeholder="Contoh: 08123456789"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
            />
            {waInvalid && (
              <p className="text-xs font-medium text-red-600 mt-1.5 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Nomor WhatsApp belum lengkap — isi minimal 8 digit angka (tanpa tanda +62/0 di depan, contoh: 8123456789).
              </p>
            )}
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
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailVerified(false);
                setVerifyScreen((s) => (emailVerified || s === "otp" ? "idle" : s));
                setOtpCode("");
                setVerifyError("");
              }}
              required
            />
            <p className="field-hint">Untuk pengiriman invoice & konfirmasi — wajib diverifikasi via kode yang dikirim ke email.</p>

            {emailVerified ? (
              <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>Email <strong>{email}</strong> terverifikasi. Verifikasi email berlaku selama halaman ini terbuka; jika email diganti, verifikasi ulang.</span>
              </div>
            ) : verifyScreen === "otp" ? (
              <div className="mt-2 p-3 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-800 mb-2">
                  Kode verifikasi 6 digit dikirim ke <strong>{email}</strong>. 📬 Kalau tidak muncul, cek juga folder <strong>Promosi / Spam / Junk</strong>.
                </p>
                <div className="flex gap-2">
                  <input
                    className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm tracking-widest font-mono text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    placeholder="••••••"
                    maxLength={6}
                    inputMode="numeric"
                    value={otpCode}
                    onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "")); setVerifyError(""); }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={verifying}
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50"
                  >
                    {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Verifikasi
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSendVerifyCode}
                  disabled={verifying}
                  className="mt-2 text-[11px] font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
                >
                  Kirim ulang kode
                </button>
                {verifyError && (
                  <p className="text-xs font-medium text-red-700 mt-2 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {verifyError}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleSendVerifyCode}
                  disabled={verifying || !emailValid}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  {verifying ? "Mengirim kode…" : "Kirim Kode Verifikasi"}
                </button>
                <p className="text-[11px] text-gray-400 mt-1">Kode berlaku 10 menit. Maks 3x kirim &amp; 3x percobaan; jika lewat, tunggu 15 menit.</p>
                {verifyError && (
                  <p className="text-xs font-medium text-red-600 mt-1.5 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {verifyError}
                  </p>
                )}
              </div>
            )}
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
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 mb-3">
            <p className="text-sm font-semibold text-amber-900 mb-2">
              ⚠️ Baca sebelum melanjutkan — penting:
            </p>
            <ul className="text-xs text-amber-800 list-disc list-inside space-y-1">
              <li>Pastikan jumlah QRIS yang Anda bayar <strong>sesuai nominal</strong>. Jika kurang, pesanan ditolak dan Anda harus memilih <strong>refund</strong> (dana kembali ≤1×24 jam, potongan transfer bank ditanggung pelanggan) atau <strong>bayar kekurangan</strong> (klausul 4.4).</li>
              <li>Yang sudah <strong>disetujui / Lunas tidak dapat di-refund</strong> (klausul 5.5).</li>
              <li>Key &amp; unduhan dikirim ke <strong>email</strong> — cek juga folder Promosi / Spam / Junk.</li>
              <li>Nomor WhatsApp wajib lengkap (minimal 8 digit angka) untuk konfirmasi &amp; cashback.</li>
            </ul>
            <a
              href="/syarat-ketentuan"
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900"
            >
              Baca Syarat &amp; Ketentuan lengkap →
            </a>
          </div>
          <label className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-50/30 border border-emerald-100 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 accent-emerald-600 w-4 h-4 rounded"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <div>
              <div className="text-sm font-semibold text-emerald-900">
                Saya telah <u>membaca</u> dan menyetujui{" "}
                <a
                  href="/syarat-ketentuan"
                  target="_blank"
                  className="underline underline-offset-2 hover:text-emerald-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  Syarat & Ketentuan
                  <ExternalLink className="w-3 h-3 inline ml-0.5" />
                </a>{" "}
                terlebih dahulu.
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

        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 no-print">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center animate-scale-in my-auto">
            {qrisStep === "pay" && (
              <>
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

                {settings.qrisPaymentNotice && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-800 mb-4">
                    <BellRing className="w-4 h-4 inline mr-1.5 text-amber-600" />
                    {settings.qrisPaymentNotice}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-left mb-4">
                  <h3 className="text-xs font-semibold text-blue-800 mb-2">Cara Pembayaran</h3>
                  <ol className="text-xs text-blue-900 space-y-1 list-decimal list-inside">
                    {(settings.qrisInstructions || "").split("\n").filter(Boolean).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ol>
                </div>

                <button
                  onClick={() => { setPaymentConfirmed(false); setQrisStep("confirm"); }}
                  className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  Saya sudah bayar
                </button>

                <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                  <button onClick={handleBatal} className="inline-flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2">
                    <X className="w-3.5 h-3.5" /> Batal
                  </button>
                  <span className="text-gray-300">·</span>
                  <button onClick={() => router.push("/")} className="inline-flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2">
                    <Home className="w-3.5 h-3.5" /> Kembali ke Beranda
                  </button>
                </div>
              </>
            )}

            {qrisStep === "confirm" && (
              <>
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-gray-900 mb-1">Konfirmasi Jumlah Pembayaran</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Sebelum melanjutkan, pastikan Anda telah membaca dan mengikuti aturan pembayaran berikut.
                </p>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-800 mb-4">
                  <BellRing className="w-4 h-4 inline mr-1.5 text-amber-600" />
                  {settings.qrisPaymentNotice || "Harap isi jumlah pembayaran yang sesuai."}
                </div>

                <label className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer text-left mb-4">
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-emerald-600 w-4 h-4 rounded"
                    checked={paymentConfirmed}
                    onChange={(e) => setPaymentConfirmed(e.target.checked)}
                  />
                  <div className="text-sm text-gray-700">
                    Saya memastikan jumlah pembayaran <strong>sudah sesuai</strong> dengan nominal yang diminta.
                    Bila belum sesuai, saya siap mengikuti aturan yang berlaku (dana dikembalikan ke rekening pengirim
                    sesuai jumlah yang ditransfer, potongan transfer bank ditanggung pelanggan).
                  </div>
                </label>

                <button
                  onClick={() => setQrisStep("proof")}
                  disabled={!paymentConfirmed}
                  className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <ArrowRight className="w-4 h-4" />
                  Lanjut ke Upload Bukti
                </button>

                <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                  <button onClick={() => setQrisStep("pay")} className="inline-flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2">
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Kembali
                  </button>
                  <span className="text-gray-300">·</span>
                  <button onClick={handleBatal} className="inline-flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2">
                    <X className="w-3.5 h-3.5" /> Batal
                  </button>
                </div>
              </>
            )}

            {qrisStep === "proof" && (
              <>
                <FileImage className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-gray-900 mb-1">Lampirkan Bukti Bayar</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Upload screenshot bukti pembayaran QRIS Anda (JPEG/PNG/WebP, maks 5MB) agar admin bisa memverifikasi dengan cepat.
                </p>

                <label className="flex flex-col items-center justify-center gap-2 w-full p-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/70 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors duration-200 mb-3">
                  <Upload className="w-6 h-6 text-gray-400" />
                  {proofFile ? (
                    <span className="text-sm font-medium text-emerald-700 break-all">{proofFile.name}</span>
                  ) : (
                    <>
                      <span className="text-sm font-semibold text-gray-600">Pilih screenshot bukti bayar</span>
                      <span className="text-xs text-gray-400">Klik untuk memilih file</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleProofFileChange}
                  />
                </label>

                {proofError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700 mb-3">
                    {proofError}
                  </div>
                )}

                <button
                  onClick={handleProofSubmit}
                  disabled={proofLoading || !proofFile}
                  className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {proofLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Mengirim…
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Submit Bukti Bayar
                    </>
                  )}
                </button>

                <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                  <button onClick={() => setQrisStep("pay")} className="inline-flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2">
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Kembali
                  </button>
                  <span className="text-gray-300">·</span>
                  <button onClick={handleBatal} className="inline-flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2">
                    <X className="w-3.5 h-3.5" /> Batal
                  </button>
                </div>
              </>
            )}

            {qrisStep === "thanks" && (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <BellRing className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Terima kasih!</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Bukti bayar Anda sudah kami terima. Silakan menunggu sampai admin memverifikasi data Anda.
                </p>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-left text-xs text-emerald-800 space-y-2 mb-4">
                  <p>
                    Download aplikasi dan kode cashback{isCashbackEligible ? " (jika Anda eligible)" : ""} akan dikirim
                    otomatis ke email <strong>{email}</strong> saat status pembayaran Anda menjadi{" "}
                    <strong>Lunas</strong>.
                  </p>
                  <p className="text-emerald-700">
                    Jika ada kendala, kami akan menghubungi Anda melalui email/WhatsApp yang terdaftar.
                  </p>
                  <p className="text-emerald-700">
                    📬 Email terkadang masuk ke folder <strong>Promosi / Spam / Junk</strong> — cek juga folder-folder tersebut di penyedia email Anda.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 mb-4 flex items-start gap-2">
                  <Loader2 className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />
                  <span>Status Anda diperiksa otomatis tiap 5 detik — halaman ini akan berubah otomatis begitu admin menyetujui.</span>
                </div>

                <button
                  onClick={() => router.push("/")}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md"
                >
                  <Home className="w-4 h-4" /> Kembali ke Beranda
                </button>
              </>
            )}

            {qrisStep === "rejected" && (
              <>
                {rejectionType === "insufficient" && refundOk ? (
                  <>
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Permintaan Refund Dikirim</h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Permintaan refund Anda sudah terkirim ke admin. Kami akan memprosesnya paling lambat{" "}
                      <strong>1x24 jam</strong> — bukti transfer refund akan dikirim ke email <strong>{email}</strong>.
                    </p>
                    <button
                      onClick={() => router.push("/")}
                      className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md"
                    >
                      <Home className="w-4 h-4" /> Kembali ke Beranda
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                      <X className="w-7 h-7 text-red-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">
                      {rejectionType === "insufficient" ? "Jumlah Pembayaran Tidak Sesuai" : "Pesanan Tidak Sesuai Ketentuan"}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      {rejectionType === "insufficient"
                        ? "Pembayaran yang kami terima kurang dari nominal yang diminta."
                        : "Kami mohon maaf, pesanan Anda tidak dapat kami proses."}
                    </p>

                    {rejectionType === "insufficient" && (
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-left text-xs text-gray-600 space-y-1.5 mb-4">
                        <div className="flex justify-between">
                          <span>Harga Produk</span>
                          <span className="font-bold text-gray-900">{formatRupiah((amountPaidByCustomer || 0) + (amountRemaining || 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Yang Telah Dibayar</span>
                          <span className="font-semibold">{formatRupiah(amountPaidByCustomer || 0)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-1.5">
                          <span>Sisa yang Harus Dibayar</span>
                          <span className="font-bold text-red-600">{formatRupiah(amountRemaining || 0)}</span>
                        </div>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-left text-xs text-red-800 mb-4">
                      <strong>Alasan:</strong> {rejectionReason || "Pesanan Anda tidak sesuai dengan ketentuan yang berlaku."}
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-800 mb-4">
                      <BellRing className="w-4 h-4 inline mr-1.5 text-amber-600" />
                      {rejectionType === "insufficient" ? (
                        <>Pilih salah satu opsi: <strong>1)</strong> Ajukan refund — dana dikembalikan ≤1x24 jam ke rekening pengirim (potongan transfer bank ditanggung pelanggan); <strong>2)</strong> Bayar kekurangan — lengkapi nominal kurang via QRIS lalu pesanan langsung diproses.</>
                      ) : (
                        <>Dana yang telah Anda bayarkan akan dikembalikan ke rekening pengirim paling lambat{" "}
                        <strong>1x24 jam</strong>, sesuai jumlah yang ditransfer (potongan transfer bank menjadi tanggungan
                        pelanggan). Mohon menunggu — detail dikirim juga ke email <strong>{email}</strong>.</>
                      )}
                    </div>

                    {error && !busy && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700 mb-3">{error}</div>
                    )}

                    {rejectionType === "insufficient" ? (
                      <>
                        <button
                          onClick={handleRefundRequest}
                          disabled={!!busy}
                          className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:opacity-50 shadow-md"
                        >
                          {busy === "refund" ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                          Ajukan Refund
                        </button>
                        <button
                          onClick={handleBayarKekurangan}
                          disabled={!!busy}
                          className="mt-3 w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 shadow-md"
                        >
                          {busy === "supplement" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          Bayar Kekurangan ({formatRupiah(amountRemaining || 0)})
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => router.push("/")}
                        className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-md"
                      >
                        <Home className="w-4 h-4" /> Kembali ke Beranda
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
          </div>
        </div>
      )}

      {paidModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 no-print">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center animate-scale-in my-auto">
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
                  <p className="text-[11px] text-emerald-700 mt-1">
                    📬 Email terkadang masuk folder <strong>Promosi / Spam / Junk</strong> — periksa juga folder-folder tersebut jika email belum masuk.
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
