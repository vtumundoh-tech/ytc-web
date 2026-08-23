"use client";

import { useState, useEffect } from "react";
import { parseJsonSafe, isHeicFile } from "@/lib/fetchJson";
import { useAppSettings } from "@/hooks/useAppSettings";
import { dict, tf } from "@/lib/i18n";
import type { T } from "@/lib/i18n";
import { useLang } from "@/components/LanguageProvider";
import { Gift, User, Phone, Mail, Hash, Tag, Image, FileText, CheckCircle, AlertTriangle, ExternalLink, Search, X } from "lucide-react";

const TIKTOK_URL = "https://www.tiktok.com/@mineclipstudios";
const YOUTUBE_URL = "https://www.youtube.com/@Mineclips_collection";

export default function KlaimCashbackPage() {
  const { settings } = useAppSettings();
  const tiers = settings.tiers;
  const { t } = useLang();

  const [cashbackCode, setCashbackCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkState, setCheckState] = useState<"idle" | "ok" | "notfound">("idle");
  const [unlocked, setUnlocked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [vA, setVA] = useState<number | null>(null);
  const [vB, setVB] = useState<number | null>(null);
  const [fPayment, setFPayment] = useState<File[]>([]);
  const [fFollow, setFFollow] = useState<File[]>([]);
  const [fLike, setFLike] = useState<File[]>([]);
  const [fShare, setFShare] = useState<File[]>([]);
  const [agree, setAgree] = useState(false);
  const [snkOpen, setSnkOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const expectedAnswer = vA !== null && vB !== null ? String(vA + vB) : "";
  const requiredFilled =
    cashbackCode && fullName && email && tier && amountPaid &&
    fPayment.length > 0 && fFollow.length > 0 && fLike.length === 6 && fShare.length > 0 &&
    agree && vA !== null && vB !== null && String(captcha).trim() === expectedAnswer;

  useEffect(() => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    setVA(a);
    setVB(b);
  }, []);

  async function handleCheck() {
    setChecking(true);
    setError("");
    setCheckState("idle");
    try {
      const res = await fetch(`/api/cashback/check?q=${encodeURIComponent(cashbackCode.trim())}`);
      const data = await parseJsonSafe<{ found?: boolean; data?: any }>(res);
      if (!data.ok) throw new Error(data.error || t(dict.claim.errCheck));
      if (!data.data.found) {
        setCheckState("notfound");
        setUnlocked(false);
        return;
      }
      const d = data.data.data;
      setFullName(d.full_name || "");
      setWhatsapp(d.whatsapp || "");
      setEmail(d.email || "");
      setTier(d.tier || "");
      setAmountPaid(d.amount ? String(d.amount) : "");
      setUnlocked(true);
      setCheckState("ok");
    } catch (err: any) {
      setError(err.message || t(dict.claim.errGeneric));
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!requiredFilled) return;
    const allFiles = [...fPayment, ...fFollow, ...fLike, ...fShare];
    if (allFiles.some(isHeicFile)) {
      setError(t(dict.common.heic));
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("fullName", fullName);
      fd.append("whatsapp", whatsapp);
      fd.append("email", email);
      fd.append("cashbackCode", cashbackCode.toUpperCase().trim());
      fd.append("tier", tier);
      fd.append("amountPaid", amountPaid);
      fd.append("notes", notes);
      fd.append("agreeSnk", "yes");
      fPayment.forEach((f) => fd.append("paymentProof", f));
      fFollow.forEach((f) => fd.append("screenshotFollow", f));
      fLike.forEach((f) => fd.append("screenshotLike", f));
      fShare.forEach((f) => fd.append("screenshotShare", f));

      const res = await fetch("/api/cashback", { method: "POST", body: fd });
      const data = await parseJsonSafe<{ error?: string }>(res);
      if (!data.ok) throw new Error(data.error || t(dict.claim.errSubmit));
      setDone(true);
    } catch (err: any) {
      setError(err.message || t(dict.claim.errGeneric));
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
          <h1 className="text-xl font-bold text-gray-900 mb-3">{t(dict.claim.doneTitle)}</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{t(dict.claim.doneSub)}</p>
          <p className="text-gray-400 text-xs leading-relaxed mt-3">{t(dict.claim.doneSpamNote)}</p>
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
        <h1 className="text-xl font-bold text-gray-900">{t(dict.claim.title)}</h1>
        <p className="text-sm text-gray-500 mt-1">{t(dict.claim.sub)}</p>
      </div>

      <div className="card-sm mb-6 flex items-start gap-3 animate-fade-in">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-700">{t(dict.claim.summaryTitle)}</strong>{" "}
          {t(dict.claim.sumPreTiktok)}
          <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 font-semibold underline underline-offset-2 hover:text-violet-700">
            TikTok @mineclipstudios
            <ExternalLink className="w-3 h-3 inline ml-0.5" />
          </a>{" "}
          {t(dict.claim.sumMidYoutube)}
          <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 font-semibold underline underline-offset-2 hover:text-violet-700">
            YouTube @Mineclips_collection
            <ExternalLink className="w-3 h-3 inline ml-0.5" />
          </a>{" "}
          {t(dict.claim.sumRest)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-lg space-y-6 animate-slide-up">
        <div className="space-y-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t(dict.claim.sectionCheck)}</h2>

          <div>
            <label className="field-label">
              <Hash className="w-3.5 h-3.5 inline mr-1.5 text-violet-500" />
              {t(dict.claim.uniqueCode)} <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                className="input-field flex-1 font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                maxLength={12}
                placeholder={t(dict.claim.codePh)}
                value={cashbackCode}
                onChange={(e) => setCashbackCode(e.target.value)}
                disabled={checking}
                required
              />
              <button
                type="button"
                onClick={handleCheck}
                disabled={checking || cashbackCode.trim().length < 6}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shrink-0"
              >
                <Search className="w-4 h-4" />
                {checking ? t(dict.claim.checking) : t(dict.claim.checkData)}
              </button>
            </div>
            <p className="field-hint">{t(dict.claim.codeHint)}</p>
            {checkState === "ok" && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 flex items-start gap-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t(dict.claim.foundMsg)}</span>
              </div>
            )}
            {checkState === "notfound" && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-700 flex items-start gap-2 animate-fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t(dict.claim.notFoundMsg)}</span>
              </div>
            )}
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="space-y-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t(dict.claim.sectionUser)}</h2>

          <Field icon={User} label={t(dict.claim.fullName)} required>
            <input
              className="input-field readOnly:bg-gray-50 readOnly:opacity-80 readOnly:cursor-not-allowed"
              value={fullName}
              readOnly
              required
            />
          </Field>

          <Field icon={Mail} label={t(dict.claim.email)} required hint={t(dict.claim.emailHint)}>
            <input
              className="input-field readOnly:bg-gray-50 readOnly:opacity-80 readOnly:cursor-not-allowed"
              type="email"
              value={email}
              readOnly
              required
            />
          </Field>

          <Field icon={Phone} label={t(dict.claim.whatsapp)} hint={t(dict.claim.whatsappHint)}>
            <input
              className="input-field readOnly:bg-gray-50 readOnly:opacity-80 readOnly:cursor-not-allowed"
              type="tel"
              value={whatsapp}
              readOnly
            />
          </Field>
        </div>

        <hr className="border-gray-100" />

        <div className="space-y-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t(dict.claim.sectionPurchase)}</h2>

          <Field icon={Tag} label={t(dict.claim.tierBought)} required>
            <select
              className="input-field disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-gray-50"
              value={tier}
              disabled
              required
            >
              <option value="">{t(dict.claim.selectPlaceholder)}</option>
              {tiers.map((tr) => (
                <option key={tr.value} value={tr.value}>{tr.label}</option>
              ))}
            </select>
          </Field>

        </div>

        <hr className="border-gray-100" />

        <div className="space-y-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t(dict.claim.sectionUpload)}</h2>

          <FileUpload label={t(dict.claim.proofPayment)} files={fPayment} onChange={setFPayment} required t={t} />
          <FileUpload
            label={t(dict.claim.proofFollow)}
            files={fFollow}
            onChange={setFFollow}
            required
            hint={t(dict.claim.proofFollowHint)}
            t={t}
          />
          <FileUpload
            label={t(dict.claim.proofLike)}
            files={fLike}
            onChange={setFLike}
            required
            maxFiles={6}
            hint={t(dict.claim.proofLikeHint)}
            t={t}
          />
          <FileUpload
            label={t(dict.claim.proofShare)}
            files={fShare}
            onChange={setFShare}
            required
            hint={t(dict.claim.proofShareHint)}
            t={t}
          />
        </div>

        <hr className="border-gray-100" />

        <Field icon={FileText} label={t(dict.claim.notes)} hint={t(dict.claim.optional)}>
          <textarea className="input-field" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <div>
          <label className="field-label">
            <CheckCircle className="w-3.5 h-3.5 inline mr-1.5 text-violet-500" />
            {t(dict.claim.captcha)} <span className="text-red-400">*</span>
          </label>
          <input
            className="input-field max-w-[160px]"
            type="number"
            placeholder={vA !== null && vB !== null ? `${vA} + ${vB} = ?` : "…"}
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value)}
            required
          />
          <p className="field-hint">{tf(t(dict.claim.captchaHint), { a: vA ?? "", b: vB ?? "" })}</p>
        </div>

        <hr className="border-gray-100" />

        <div>
          {snkOpen && (
            <div className="mt-3 p-4 rounded-xl bg-gray-50 text-xs text-gray-500 leading-relaxed space-y-2 animate-fade-in">
              <p>{t(dict.claim.snk1)}</p>
              <p>{t(dict.claim.snk2)}</p>
              <p>{t(dict.claim.snk3)}</p>
              <p>{t(dict.claim.snk4)}</p>
              <p>{t(dict.claim.snk5)}</p>
              <p>{t(dict.claim.snk6)}</p>
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-violet-50/30 border border-violet-100 cursor-pointer">
          <input type="checkbox" className="mt-0.5 accent-violet-600 w-4 h-4 rounded" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <div>
            <div className="text-sm font-semibold text-violet-900">
              {t(dict.claim.agreePre)}
              <a
                href="/syarat-ketentuan"
                target="_blank"
                className="underline underline-offset-2 hover:text-violet-800"
                onClick={(e) => e.stopPropagation()}
              >
                {t(dict.claim.agreeLink)}
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
          {loading ? t(dict.claim.sending) : <><Gift className="w-4 h-4" /> {t(dict.claim.submit)}</>}
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

function FileUpload({ label, files, onChange, maxFiles = 1, required, hint, t }: {
  label: string;
  files: File[];
  onChange: (f: File[]) => void;
  maxFiles?: number;
  required?: boolean;
  hint?: string;
  t: (s: T) => string;
}) {
  const canAdd = files.length < maxFiles;
  const typesLine = tf(
    t(dict.claim.fileTypes),
    { max: maxFiles > 1 ? tf(t(dict.claim.fileTypesMax), { n: maxFiles }) : "" }
  );

  function handleSelect(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (next.length >= maxFiles) break;
      next.push(f);
    }
    onChange(next);
  }

  return (
    <div>
      <label className="field-label">
        <Image className="w-3.5 h-3.5 inline mr-1.5 text-violet-500" />
        {label} {required && <span className="text-red-400">*</span>}
        {maxFiles > 1 && <span className="text-gray-400 font-normal">({files.length}/{maxFiles})</span>}
      </label>

      {files.length > 0 && (
        <div className="space-y-2 mb-2">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                <Image className="w-4 h-4 text-violet-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                  <p className="text-[11px] text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                aria-label={t(dict.claim.deleteFile)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAdd ? (
        <label className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
          files.length > 0 ? "border-violet-200 bg-violet-50/30 hover:border-violet-300" : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/30"
        }`}>
          <div className="text-center">
            <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{files.length > 0 ? t(dict.claim.addImage) : t(dict.claim.pickImage)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{typesLine}</p>
          </div>
          <input type="file" accept="image/*" multiple={maxFiles > 1} className="hidden" onChange={(e) => handleSelect(e.target.files)} />
        </label>
      ) : (
        <p className="text-xs text-emerald-600 font-medium">{tf(t(dict.claim.maxReached), { n: maxFiles })}</p>
      )}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}
