"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { formatPrice, formatRupiah } from "@/lib/tiers";
import { useAppSettings } from "@/hooks/useAppSettings";
import { validateFileSignature, validateFileSize, isAllowedMimeType } from "@/lib/fileValidation";
import { parseJsonSafe, isHeicFile } from "@/lib/fetchJson";
import { COUNTRY_CODES, OTHER_COUNTRY_VALUE, normalizeWhatsapp } from "@/lib/whatsapp";
import { dict, tf } from "@/lib/i18n";
import { useLang } from "@/components/LanguageProvider";
import { CreditCard, User, Phone, Mail, CheckCircle, ArrowRight, ExternalLink, Gift, TrendingUp, Download, Loader2, QrCode, Home, BellRing, Upload, FileImage, X, AlertTriangle, Timer, RefreshCw } from "lucide-react";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function BeliForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLang();
  const preselected = searchParams.get("tier") || "";
  const preselectedAddon = searchParams.get("addon1080") === "1";
  const supplementToken = searchParams.get("supplement") || "";
  const { settings } = useAppSettings();
  const tiers = settings.tiers;
  const promoEnabled = settings.promoEnabled;

  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [countryDial, setCountryDial] = useState("62");
  const [customDial, setCustomDial] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [referralApplied, setReferralApplied] = useState(false);
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [referralError, setReferralError] = useState("");
  const [verifyScreen, setVerifyScreen] = useState<"idle" | "otp">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [otpSeconds, setOtpSeconds] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const [otpTick, setOtpTick] = useState(0);
  const [qrisSeconds, setQrisSeconds] = useState(0);
  const [qrisExpired, setQrisExpired] = useState(false);
  const [qrisTick, setQrisTick] = useState(0);
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
  const [qrisStep, setQrisStep] = useState<"pay" | "proof" | "thanks" | "rejected">("pay");
  const [qrisAmount, setQrisAmount] = useState(0);
  const [qrisOrderId, setQrisOrderId] = useState("");
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
        if (!res.ok) throw new Error(data.error || t(dict.buy.qris.errDlLink));
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
        setError(err.message || t(dict.buy.qris.dlFail));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidModal, downloadToken]);

  useEffect(() => {
    if (preselected && tiers.some((x) => x.value === preselected)) {
      setTier(preselected);
      setAddon1080(preselectedAddon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        } else {
          setError(t(dict.buy.qris.errSupplementLink));
        }
      } catch {
        if (!cancelled) setError(t(dict.buy.qris.errSupplementLoad));
      } finally {
        if (!cancelled) setSupplementLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplementToken]);

  useEffect(() => {
    if (verifyScreen !== "otp" || emailVerified) return;
    setOtpExpired(false);
    setOtpSeconds(5 * 60);
    const iv = setInterval(() => {
      setOtpSeconds((s) => {
        if (s <= 1) {
          clearInterval(iv);
          setOtpExpired(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [verifyScreen, emailVerified, otpTick]);

  useEffect(() => {
    if (!qrisModal || qrisStep !== "pay") return;
    setQrisSeconds(3 * 60);
    setQrisExpired(false);
    const iv = setInterval(() => {
      setQrisSeconds((s) => {
        if (s <= 1) {
          clearInterval(iv);
          setQrisExpired(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [qrisModal, qrisStep, qrisTick]);

  function handleBatal() {
    setQrisModal(false);
    setProofFile(null);
    setProofError("");
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
      setProofError(t(dict.buy.qris.errProofFile));
      return;
    }
    if (isHeicFile(proofFile)) {
      setProofError(t(dict.common.heic));
      return;
    }
    if (!isAllowedMimeType(proofFile.type)) {
      setProofError(t(dict.buy.qris.errProofFormat));
      return;
    }
    if (!validateFileSize(proofFile.size)) {
      setProofError(t(dict.buy.qris.errProofSize));
      return;
    }
    const buffer = await proofFile.arrayBuffer();
    if (!validateFileSignature(buffer, proofFile.type)) {
      setProofError(t(dict.buy.qris.errProofInvalid));
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
      if (!data.ok) throw new Error(data.error || t(dict.buy.qris.errProofSubmit));
      setQrisStep("thanks");
    } catch (err: any) {
      setProofError(err.message || t(dict.buy.qris.errProofSubmitRetry));
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
      if (!res.ok) throw new Error(data.error || t(dict.buy.qris.errRefund));
      setRefundOk(true);
    } catch (err: any) {
      setError(err.message || t(dict.buy.qris.errRefundRetry));
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
      if (!res.ok) throw new Error(data.error || t(dict.buy.qris.errSupplement));
      router.push(`/beli?supplement=${encodeURIComponent(data.downloadToken)}`);
    } catch (err: any) {
      setError(err.message || t(dict.buy.qris.errSupplementRetry));
      setBusy("");
    }
  }

  async function handleSendVerifyCode() {
    setVerifyError("");
    if (!emailValid) {
      setVerifyError(t(dict.buy.errEmailInvalid));
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
      if (!data.ok) throw new Error(data.error || t(dict.buy.errSendCode));
      setVerifyScreen("otp");
      setOtpCode("");
      setVerifyError("");
      setOtpSeconds(5 * 60);
      setOtpExpired(false);
      setOtpTick((x) => x + 1);
    } catch (err: any) {
      setVerifyError(err.message || t(dict.buy.errSendCode));
    } finally {
      setVerifying(false);
    }
  }

  async function handleVerifyCode() {
    setVerifyError("");
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setVerifyError(t(dict.buy.errOtpFormat));
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
      if (!data.ok) throw new Error(data.error || t(dict.buy.errVerifyFail));
      setEmailVerified(true);
      setOtpCode("");
    } catch (err: any) {
      setVerifyError(err.message || t(dict.buy.errVerifyRetry));
    } finally {
      setVerifying(false);
    }
  }

  async function handleApplyReferral() {
    const code = referralInput.trim().toUpperCase().replace(/\s+/g, "-");
    if (code.length < 3) {
      setReferralError(t(dict.buy.referralInvalid));
      return;
    }
    setReferralError("");
    try {
      const res = await fetch(`/api/referral/check?q=${encodeURIComponent(code)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t(dict.buy.referralInvalid));
      if (!data.ok) {
        setReferralError(data.active === false ? t(dict.buy.referralInvalid) : t(dict.buy.referralLimitReached));
        setReferralApplied(false);
        setReferralDiscount(0);
        return;
      }
      setReferralApplied(true);
      setReferralDiscount(Number(data.discount_amount) || 0);
    } catch (err: any) {
      setReferralError(err.message || t(dict.buy.referralInvalid));
    }
  }

  function handleRemoveReferral() {
    setReferralApplied(false);
    setReferralDiscount(0);
    setReferralInput("");
    setReferralError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName || !whatsapp || !email || !tier || !agree) return;
    if (!waValid) {
      setError(t(dict.buy.errWaIncomplete));
      setLoading(false);
      return;
    }
    if (!emailVerified) {
      setError(t(dict.buy.errNeedVerify));
      setLoading(false);
      return;
    }
    const waNumber = normalizeWhatsapp(countryDial === OTHER_COUNTRY_VALUE ? customDial : countryDial, whatsapp);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, whatsapp: waNumber, email, tier, addon1080, agreeSnk: true, referralCode: referralApplied ? referralInput.trim().toUpperCase() : "", countryDial: countryDial === OTHER_COUNTRY_VALUE ? customDial : countryDial }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t(dict.buy.errTransaction));

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
        setQrisStep("pay");
        setQrisModal(true);
      } else {
        setError(t(dict.buy.errPaymentMode));
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || t(dict.buy.errGeneric));
      setLoading(false);
    }
  }

  const selected = tiers.find((x) => x.value === tier);
  const cashback = tier ? settings.cashbackTiers[tier] || 0 : 0;
  const addonPrice = tier ? settings.addonPrices[tier] || 0 : 0;
  const basePrice = selected ? (promoEnabled ? selected.amount : selected.originalAmount) : 0;
  const totalPrice = Math.max(0, (tier ? basePrice + (addon1080 ? addonPrice : 0) : 0) - referralDiscount);
  const waValue = whatsapp.trim();
  const waDigits = waValue.replace(/[^\d]/g, "").replace(/^0+/, "");
  const waValid = waDigits.length >= 8 && waDigits.length <= 15;
  const waInvalid = waValue !== "" && !waValid;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = fullName && waValid && email && emailVerified && tier && agree && !loading;
  const isCashbackEligible = cashback > 0;
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const otpClock = `${pad2(Math.floor(otpSeconds / 60))}:${pad2(otpSeconds % 60)}`;
  const qrisClock = `${pad2(Math.floor(qrisSeconds / 60))}:${pad2(qrisSeconds % 60)}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {supplementLoading && (
        <div className="fixed inset-0 z-[60] bg-white/70 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200/50">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">{t(dict.buy.title)}</h1>
        <p className="text-sm text-gray-500 mt-1">{t(dict.buy.sub)}</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="card-lg space-y-6"
      >
        <div className="space-y-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t(dict.buy.sectionPersonal)}</h2>

          <div>
            <label className="field-label">
              <User className="w-3.5 h-3.5 inline mr-1.5 text-emerald-500" />
              {t(dict.buy.fullName)} <span className="text-red-400">*</span>
            </label>
            <input
              className="input-field"
              placeholder={t(dict.buy.fullNamePh)}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">
              <Phone className="w-3.5 h-3.5 inline mr-1.5 text-emerald-500" />
              {t(dict.buy.whatsapp)} <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <select
                className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                value={countryDial}
                onChange={(e) => { setCountryDial(e.target.value); setError(""); }}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.dial}>{c.flag} {c.label} +{c.dial}</option>
                ))}
                <option value={OTHER_COUNTRY_VALUE}>{t(dict.buy.otherCountry)}</option>
              </select>
              <div className="flex-1 min-w-0">
                <input
                  className={cn(
                    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400",
                    waInvalid ? "border-red-400 focus:ring-red-300 focus:border-red-400" : ""
                  )}
                  type="tel"
                  placeholder={t(dict.buy.whatsappPh)}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
                {countryDial === OTHER_COUNTRY_VALUE && (
                  <input
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 placeholder:text-gray-300"
                    type="tel"
                    placeholder={t(dict.buy.customDialPh)}
                    value={customDial}
                    onChange={(e) => setCustomDial(e.target.value.replace(/[^\d]/g, ""))}
                  />
                )}
              </div>
            </div>
            {waInvalid && (
              <p className="text-xs font-medium text-red-600 mt-1.5 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {t(dict.buy.waInvalid)}
              </p>
            )}
            {countryDial === OTHER_COUNTRY_VALUE && !/^\d{1,4}$/.test(customDial) && waValue !== "" && (
              <p className="text-xs font-medium text-red-600 mt-1.5 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {t(dict.buy.dialInvalid)}
              </p>
            )}
            <p className="field-hint">{t(dict.buy.waHint1)}</p>
            <p className="field-hint">{t(dict.buy.waHint2)}</p>
          </div>

          <div>
            <label className="field-label">
              <Mail className="w-3.5 h-3.5 inline mr-1.5 text-emerald-500" />
              {t(dict.buy.email)} <span className="text-red-400">*</span>
            </label>
            <input
              className="input-field"
              type="email"
              placeholder={t(dict.buy.emailPh)}
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
            <p className="field-hint">{t(dict.buy.emailHint)}</p>

            {emailVerified ? (
              <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span><strong>{email}</strong> {t(dict.buy.verifiedNote)}</span>
              </div>
            ) : verifyScreen === "otp" ? (
              <div className="mt-2 p-3 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-800 mb-2">
                  {tf(t(dict.buy.otpSent), { email })}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full",
                    otpExpired ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-800"
                  )}>
                    <Timer className="w-3 h-3" />
                    {otpExpired ? t(dict.buy.otpExpired) : tf(t(dict.buy.otpValid), { time: otpClock })}
                  </span>
                  {!otpExpired && <span className="text-[11px] text-blue-600">{t(dict.buy.otpEnterBefore)}</span>}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm tracking-widest font-mono text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    placeholder="••••••"
                    maxLength={6}
                    inputMode="numeric"
                    disabled={otpExpired}
                    value={otpCode}
                    onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "")); setVerifyError(""); }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={verifying || otpExpired}
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50"
                  >
                    {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    {t(dict.buy.verifyBtn)}
                  </button>
                </div>
                {otpExpired ? (
                  <button
                    type="button"
                    onClick={handleSendVerifyCode}
                    disabled={verifying}
                    className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 disabled:opacity-50"
                  >
                    {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    {t(dict.buy.resendCode)}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendVerifyCode}
                    disabled={verifying}
                    className="mt-2 text-[11px] font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
                  >
                    {t(dict.buy.resendLink)}
                  </button>
                )}
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
                  {verifying ? t(dict.buy.sendingCode) : t(dict.buy.sendCode)}
                </button>
                <p className="text-[11px] text-gray-400 mt-1">{t(dict.buy.codeValidityNote)}</p>
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
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">{t(dict.buy.sectionPlan)}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {tiers.map((tr, i) => {
              const aPrice = settings.addonPrices[tr.value] || 0;
              const isSelected = tier === tr.value;
              const cardPrice = isSelected ? basePrice : (promoEnabled ? tr.amount : tr.originalAmount);
              return (
                <motion.div
                  key={tr.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <button
                    type="button"
                    onClick={() => { setTier(tr.value); if (addon1080 && !aPrice) setAddon1080(false); }}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 w-full ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-50/50 shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-emerald-500" />
                    )}
                    <div className="font-semibold text-sm text-gray-900">{tr.label}</div>
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
                              {t(dict.buy.addon1080)}
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
                            <TrendingUp className="w-3 h-3" /> {tf(t(dict.buy.total), { amount: formatRupiah(totalPrice) })}
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

        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            <Gift className="w-3.5 h-3.5 inline mr-1.5 text-purple-500" />
            {t(dict.buy.referralTitle)}
          </h2>
          {referralApplied && referralDiscount > 0 ? (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2 text-sm text-purple-800">
                <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  {tf(t(dict.buy.referralApplied), { amount: formatRupiah(referralDiscount) })}{" "}
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-100 rounded-full px-2 py-0.5 ml-1">
                    {tf(t(dict.buy.referralDiscApplied), { amount: formatRupiah(referralDiscount) })}
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveReferral}
                className="text-xs font-semibold text-purple-600 hover:text-purple-800 underline underline-offset-2 shrink-0"
              >
                ✕ {t(dict.buy.referralRemove)}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                placeholder={t(dict.buy.referralPh)}
                value={referralInput}
                onChange={(e) => { setReferralInput(e.target.value.toUpperCase()); setReferralError(""); }}
              />
              <button
                type="button"
                onClick={handleApplyReferral}
                className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 transition-all duration-200"
              >
                {t(dict.buy.referralApply)}
              </button>
            </div>
          )}
          {referralError && (
            <p className="text-xs font-medium text-red-600 mt-1.5 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {referralError}
            </p>
          )}
        </div>

        <hr className="border-gray-100" />

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
              <div className="font-semibold text-amber-800">{t(dict.buy.eligibleTitle)}</div>
              <div className="text-xs text-amber-700">{tf(t(dict.buy.eligibleDesc), { amount: formatRupiah(cashback) })}</div>
            </div>
          </div>
        )}

        <div>
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 mb-3">
            <p className="text-sm font-semibold text-amber-900 mb-2">
              {t(dict.buy.warningTitle)}
            </p>
            <ul className="text-xs text-amber-800 list-disc list-inside space-y-1">
              <li>{t(dict.buy.warn1)}</li>
              <li>{t(dict.buy.warn2)}</li>
              <li>{t(dict.buy.warn3)}</li>
              <li>{t(dict.buy.warn4)}</li>
            </ul>
            <a
              href="/syarat-ketentuan"
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900"
            >
              {t(dict.buy.readTnc)}
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
                {t(dict.buy.agreePart1)}{" "}
                <a
                  href="/syarat-ketentuan"
                  target="_blank"
                  className="underline underline-offset-2 hover:text-emerald-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t(dict.buy.agreeLink)}
                  <ExternalLink className="w-3 h-3 inline ml-0.5" />
                </a>{" "}
                {t(dict.buy.agreePart2)}
              </div>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md ${
            addon1080
              ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-200/50"
              : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-200/50"
          }`}
        >
          {loading ? t(dict.buy.processing) : (
            <>{tf(t(dict.buy.submit), { amount: formatRupiah(totalPrice) })} <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          {t(dict.buy.secureNote)}
        </p>
      </motion.form>
{qrisModal && (

        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 no-print">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center animate-scale-in my-auto">
            {qrisStep === "pay" && (
              <>
                <QrCode className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-gray-900 mb-1">{t(dict.buy.qris.title)}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  {t(dict.buy.qris.sub)}
                </p>

                <div className={cn(
                  "mb-4 inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full",
                  qrisExpired ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
                )}>
                  <Timer className="w-3 h-3" />
                  {qrisExpired ? t(dict.buy.qris.qrExpiredBadge) : tf(t(dict.buy.qris.qrValidBadge), { time: qrisClock })}
                </div>

                {qrisExpired ? (
                  <div className="p-8 rounded-xl bg-gray-50 border border-gray-100 mb-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                      <X className="w-6 h-6 text-red-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-4">{t(dict.buy.qris.qrExpiredTitle)}</p>
                    <button
                      type="button"
                      onClick={() => { setQrisSeconds(3 * 60); setQrisExpired(false); setQrisTick((x) => x + 1); }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all duration-200"
                    >
                      <RefreshCw className="w-4 h-4" /> {t(dict.buy.qris.viewAgain)}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 mb-4">
                      {settings.qrisImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={settings.qrisImageUrl} alt="QRIS" className="mx-auto w-52 h-52 object-contain" />
                      ) : (
                        <p className="text-sm text-gray-400 py-10">{t(dict.buy.qris.notConfigured)}</p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-left mb-4">
                      <h3 className="text-xs font-semibold text-blue-800 mb-2">{t(dict.buy.qris.howToPay)}</h3>
                      <ol className="text-xs text-blue-900 space-y-1">
                        {(settings.qrisInstructions || "").split("\n").filter(Boolean).map((line, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="font-bold text-blue-700 shrink-0">{i + 1}.</span>
                            <span>{line.replace(/^\s*\d+[.)]\s*/, "")}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-gray-500">{t(dict.buy.qris.totalToPay)}</span>
                  <span className="font-bold text-gray-900">{formatRupiah(qrisAmount)}</span>
                </div>

                <button
                  onClick={() => setQrisStep("proof")}
                  className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t(dict.buy.qris.alreadyPaid)}
                </button>

                <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                  <button onClick={handleBatal} className="inline-flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2">
                    <X className="w-3.5 h-3.5" /> {t(dict.buy.qris.cancel)}
                  </button>
                  <span className="text-gray-300">·</span>
                  <button onClick={() => router.push("/")} className="inline-flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2">
                    <Home className="w-3.5 h-3.5" /> {t(dict.buy.qris.backHome)}
                  </button>
                </div>
              </>
            )}

            {qrisStep === "proof" && (
              <>
                <FileImage className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-gray-900 mb-1">{t(dict.buy.qris.proofTitle)}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  {t(dict.buy.qris.proofSub)}
                </p>

                <label className="flex flex-col items-center justify-center gap-2 w-full p-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/70 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors duration-200 mb-3">
                  <Upload className="w-6 h-6 text-gray-400" />
                  {proofFile ? (
                    <span className="text-sm font-medium text-emerald-700 break-all">{proofFile.name}</span>
                  ) : (
                    <>
                      <span className="text-sm font-semibold text-gray-600">{t(dict.buy.qris.chooseFile)}</span>
                      <span className="text-xs text-gray-400">{t(dict.buy.qris.clickToChoose)}</span>
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
                      <Loader2 className="w-4 h-4 animate-spin" /> {t(dict.buy.qris.submitting)}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> {t(dict.buy.qris.submitProof)}
                    </>
                  )}
                </button>

                <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                  <button onClick={() => setQrisStep("pay")} className="inline-flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2">
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" /> {t(dict.buy.qris.back)}
                  </button>
                  <span className="text-gray-300">·</span>
                  <button onClick={handleBatal} className="inline-flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2">
                    <X className="w-3.5 h-3.5" /> {t(dict.buy.qris.cancel)}
                  </button>
                </div>
              </>
            )}

            {qrisStep === "thanks" && (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <BellRing className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{t(dict.buy.qris.thanksTitle)}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  {t(dict.buy.qris.thanksSub)}
                </p>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-left text-xs text-emerald-800 space-y-2 mb-4">
                  <p>
                    {tf(t(dict.buy.qris.thanksBox1), {
                      eligible: isCashbackEligible ? t(dict.buy.qris.thanksEligible) : "",
                      email,
                    })}
                  </p>
                  <p className="text-emerald-700">
                    {t(dict.buy.qris.thanksBox2)}
                  </p>
                  <p className="text-emerald-700">
                    {t(dict.buy.qris.thanksBox3)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 mb-4 flex items-start gap-2">
                  <Loader2 className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />
                  <span>{t(dict.buy.qris.autoCheckNote)}</span>
                </div>

                <button
                  onClick={() => router.push("/")}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md"
                >
                  <Home className="w-4 h-4" /> {t(dict.buy.qris.backHome)}
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
                    <h2 className="text-lg font-bold text-gray-900 mb-2">{t(dict.buy.qris.refundSentTitle)}</h2>
                    <p className="text-sm text-gray-500 mb-4">
                      {tf(t(dict.buy.qris.refundSentSub), { email })}
                    </p>
                    <button
                      onClick={() => router.push("/")}
                      className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md"
                    >
                      <Home className="w-4 h-4" /> {t(dict.buy.qris.backHome)}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                      <X className="w-7 h-7 text-red-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">
                      {rejectionType === "insufficient" ? t(dict.buy.qris.mismatchTitle) : t(dict.buy.qris.rejectedTitle)}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      {rejectionType === "insufficient" ? t(dict.buy.qris.mismatchSub) : t(dict.buy.qris.rejectedSub)}
                    </p>

                    {rejectionType === "insufficient" && (
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-left text-xs text-gray-600 space-y-1.5 mb-4">
                        <div className="flex justify-between">
                          <span>{t(dict.buy.qris.productPrice)}</span>
                          <span className="font-bold text-gray-900">{formatRupiah((amountPaidByCustomer || 0) + (amountRemaining || 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t(dict.buy.qris.paidSoFar)}</span>
                          <span className="font-semibold">{formatRupiah(amountPaidByCustomer || 0)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-1.5">
                          <span>{t(dict.buy.qris.remaining)}</span>
                          <span className="font-bold text-red-600">{formatRupiah(amountRemaining || 0)}</span>
                        </div>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-left text-xs text-red-800 mb-4">
                      <strong>{t(dict.buy.qris.reason)}</strong> {rejectionReason || t(dict.buy.qris.defaultReason)}
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-800 mb-4">
                      <BellRing className="w-4 h-4 inline mr-1.5 text-amber-600" />
                      {rejectionType === "insufficient" ? (
                        t(dict.buy.qris.optionInsufficient)
                      ) : (
                        tf(t(dict.buy.qris.optionRejected), { email })
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
                          {t(dict.buy.qris.requestRefund)}
                        </button>
                        <button
                          onClick={handleBayarKekurangan}
                          disabled={!!busy}
                          className="mt-3 w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 shadow-md"
                        >
                          {busy === "supplement" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          {tf(t(dict.buy.qris.payDifference), { amount: formatRupiah(amountRemaining || 0) })}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => router.push("/")}
                        className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-md"
                      >
                        <Home className="w-4 h-4" /> {t(dict.buy.qris.backHome)}
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
            <h2 className="text-lg font-bold text-gray-900 mb-1">{t(dict.buy.qris.paidTitle)}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {tf(t(dict.buy.qris.paidSub), { name: fullName })}
            </p>

            {/* Download aplikasi */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-left mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-emerald-800">{t(dict.buy.qris.downloadApp)}</h3>
              </div>
              {dlState === "prep" && (
                <p className="text-xs text-emerald-700 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t(dict.buy.qris.preparing)}
                </p>
              )}
              {dlState === "countdown" && (
                <p className="text-xs text-emerald-700">
                  {tf(t(dict.buy.qris.autoDownloadIn), { n: countdown })}
                </p>
              )}
              {dlState === "error" && (
                <p className="text-xs text-red-600">{error || t(dict.buy.qris.dlFail)}</p>
              )}
              {downloadUrl && (
                <>
                  <a
                    href={downloadUrl}
                    className="mt-3 inline-flex items-center justify-center gap-2 w-full px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md"
                  >
                    <Download className="w-4 h-4" /> {t(dict.buy.qris.downloadBtn)}
                  </a>
                  <p className="text-[11px] text-emerald-700 mt-2">
                    {tf(t(dict.buy.qris.dlNote1), { email })}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    {t(dict.buy.qris.dlNote2)}
                  </p>
                </>
              )}
            </div>

            {/* Kode unik cashback (hanya paket eligible) */}
            {isCashbackEligible && (
              <div className="text-left mb-4">
                <p className="text-xs text-amber-800 font-semibold mb-2 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" /> {t(dict.buy.qris.cbEligible)}
                </p>
                <div className="p-4 rounded-xl bg-gray-900 text-white font-mono text-xl tracking-widest mb-2 select-all text-center">
                  {cashbackCode}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t(dict.buy.qris.cbCodeWarning)}
                </p>
              </div>
            )}

            <button
              onClick={() => router.push("/")}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md"
            >
              {t(dict.buy.qris.ok)} <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-gray-400 mt-3">{t(dict.buy.qris.okHint)}</p>
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
