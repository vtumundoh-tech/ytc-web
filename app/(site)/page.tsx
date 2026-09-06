"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Download, Mic, Scissors, Brain, Volume2, Gift, Phone, Mail,
  ChevronRight, Sparkles, Clock, ShieldCheck, Monitor,
  Flame, Coins, User, ExternalLink, Cpu, Clapperboard, Send, Subtitles, Bot,
  Play, Zap, FileText, MessageSquare,
} from "lucide-react";
import { formatRupiah, formatPrice, formatUSD } from "@/lib/tiers";
import { useAppSettings } from "@/hooks/useAppSettings";
import { dict, tf } from "@/lib/i18n";
import { useLang } from "@/components/LanguageProvider";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, margin: "-80px" },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, margin: "-60px" },
  transition: { duration: 0.4 },
};

const FEATURE_ICONS = [Clapperboard, Cpu, Download, Mic, Scissors, Brain, Volume2, Subtitles, Send];
const LATEST_ICONS = [Bot, Send];
const STEP_ICONS = [User, Coins, Gift];

const TIKTOK_URL = "https://www.tiktok.com/@mineclipstudios";
const YOUTUBE_URL = "https://www.youtube.com/@Mineclips_collection";

function HeroMockup() {
  const { t } = useLang();
  const tabs = [
    { icon: Scissors, label: dict.home.mock.tabClips, active: true },
    { icon: FileText, label: dict.home.mock.tabTranscript, active: false },
    { icon: MessageSquare, label: dict.home.mock.tabVoice, active: false },
  ];

  return (
    <div className="relative max-w-3xl mx-auto mt-12 sm:mt-16 px-2">
      <div
        className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-emerald-200/50 via-transparent to-violet-200/50 blur-2xl rounded-[2.5rem]"
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur shadow-2xl overflow-hidden text-left"
      >
        <div className="flex items-center gap-1.5 px-4 h-10 bg-gray-50/80 border-b border-gray-100">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" aria-hidden="true" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" aria-hidden="true" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
          <span className="mx-auto text-xs font-semibold text-gray-400 select-none">
            {t(dict.home.mock.appTitle)}
          </span>
          <span className="w-10" aria-hidden="true" />
        </div>

        <div className="flex">
          <aside className="hidden sm:flex flex-col gap-1 w-40 shrink-0 p-3 border-r border-gray-100 bg-gray-50/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <div
                  key={tab.label.en}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                    tab.active
                      ? "bg-emerald-100/70 text-emerald-800"
                      : "text-gray-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{t(tab.label)}</span>
                </div>
              );
            })}
            <div className="mt-auto pt-6 space-y-1.5" aria-hidden="true">
              <div className="h-2 rounded bg-gray-100 w-4/5" />
              <div className="h-2 rounded bg-gray-100 w-3/5" />
            </div>
          </aside>

          <div className="flex-1 p-4 min-w-0">
            <div className="relative aspect-video rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-950 overflow-hidden mb-4 shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/25">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" aria-hidden="true" />
                </div>
              </div>
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur text-[10px] font-bold text-white tracking-wide">
                1080p • 9:16
              </span>
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="inline-block max-w-full px-2.5 py-1 rounded bg-black/60 backdrop-blur text-[11px] font-semibold text-white truncate">
                  {t(dict.home.mock.subtitleDemo)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {dict.home.mock.modes.map((m, i) => (
                <span
                  key={m.en}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    i === 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}
                >
                  {t(m)}
                </span>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                <span className="text-gray-500">{t(dict.home.mock.progressLabel)}</span>
                <span className="text-emerald-600 tabular">72%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "8%" }}
                  whileInView={{ width: "72%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute -left-3 lg:-left-10 top-1/4 hidden md:flex items-center gap-2.5 card px-4 py-3 shadow-lg"
      >
        <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <Zap className="w-4 h-4 text-emerald-600" aria-hidden="true" />
        </span>
        <span className="text-xs font-bold text-gray-900">{t(dict.home.mock.statClips)}</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.75 }}
        className="absolute -right-3 lg:-right-10 bottom-10 hidden md:flex items-center gap-2.5 card px-4 py-3 shadow-lg"
      >
        <span className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
          <Scissors className="w-4 h-4 text-violet-600" aria-hidden="true" />
        </span>
        <span className="text-xs font-bold text-gray-900">{t(dict.home.mock.statTime)}</span>
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const { settings } = useAppSettings();
  const { t } = useLang();
  const reduce = useReducedMotion();
  const promoEnabled = settings.promoEnabled;
  const tiers = settings.tiers;
  const cashbackEligible = tiers.filter((tp) => (settings.cashbackTiers[tp.value] || 0) > 0);
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");

  const anim = reduce ? {} : fadeUp;
  const animStagger = reduce ? {} : stagger;

  return (
    <div className="overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="relative pt-10 sm:pt-14 pb-4 text-center">
        <div className="absolute inset-x-0 top-0 -z-10 h-[480px] pointer-events-none" aria-hidden="true">
          <div className="absolute left-1/2 top-[-180px] -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute left-[12%] top-[-60px] w-[280px] h-[280px] rounded-full bg-violet-200/25 blur-3xl" />
          <div className="absolute right-[10%] top-[40px] w-[240px] h-[240px] rounded-full bg-amber-100/40 blur-3xl" />
        </div>

        <motion.div {...anim} className="relative max-w-5xl mx-auto px-4">
          <div className="badge-emerald mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            {t(dict.home.hero.badge)}
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {t(dict.home.hero.h1a)} <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
              {t(dict.home.hero.h1b)}
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t(dict.home.hero.sub)}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="badge-emerald">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> {t(dict.home.hero.badgeLifetime)}
            </span>
            <span className="badge-amber">
              <Coins className="w-3.5 h-3.5" aria-hidden="true" /> {t(dict.home.hero.badgeCashback)}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              href="#harga"
              className="btn-emerald inline-flex items-center gap-2 !px-7"
            >
              {t(dict.home.hero.ctaPricing)} <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link href="/beli" className="btn-outline inline-flex items-center gap-2 !px-7">
              {t(dict.home.hero.ctaBuy)}
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-5">{t(dict.home.hero.note)}</p>
        </motion.div>

        <HeroMockup />
      </section>

      {/* ─── FITUR TERBARU ─── */}
      <motion.section {...anim} className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="px-3 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
            {t(dict.home.latest.newBadge)}
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {t(dict.home.latest.title)}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {dict.home.latest.items.map((f, i) => {
            const Icon = LATEST_ICONS[i];
            return (
              <motion.div
                key={f.label.en}
                {...animStagger}
                transition={reduce ? undefined : { ...stagger.transition, delay: i * 0.1 }}
                className="card-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col items-center text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center mb-4 mx-auto group-hover:bg-violet-100 group-hover:scale-105 transition-all duration-200">
                  <Icon className="w-5 h-5 text-violet-600" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{t(f.label)}</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{t(f.desc)}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── FITUR ─── */}
      <motion.section {...anim} className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <h2 className="section-title">{t(dict.home.features.title)}</h2>
        <p className="section-sub">{t(dict.home.features.sub)}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dict.home.features.items.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <motion.div
                key={f.label.en}
                {...animStagger}
                transition={reduce ? undefined : { ...stagger.transition, delay: (i % 3) * 0.08 }}
                className="card-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col items-center text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 mx-auto group-hover:bg-emerald-100 group-hover:scale-105 transition-all duration-200">
                  <Icon className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{t(f.label)}</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{t(f.desc)}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── HARGA ─── */}
      <motion.section id="harga" {...anim} className="relative max-w-4xl mx-auto px-4 py-10 sm:py-14 scroll-mt-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50/80 to-transparent" />
        <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
          <h2 className="section-title !mb-0">{t(dict.home.pricing.title)}</h2>

          {/* Toggle Mata Uang */}
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setCurrency("IDR")}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-200 ${
                currency === "IDR" ? "bg-emerald-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Rp
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-200 ${
                currency === "USD" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              $
            </button>
          </div>
        </div>
        <p className="section-sub">{t(dict.home.pricing.sub)}</p>
        <div className="text-center mb-6 space-y-1">
          <p className="text-xs text-gray-400">
            <Coins className="w-4 h-4 inline text-amber-500 -mt-0.5" aria-hidden="true" />{" "}
            {t(dict.home.pricing.cashbackNote)}
          </p>
          {currency === "USD" && (
            <p className="text-[11px] text-blue-500 font-medium">
              {tf(t(dict.home.pricing.usdNote), { rate: settings.usdRate || 16000, label: settings.usdRateLabel || "" })}
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {tiers.map((tier, i) => {
            const disc = promoEnabled ? tier.discountPercent : 0;
            const cashback = settings.cashbackTiers[tier.value] || 0;
            const basePrice = promoEnabled ? tier.amount : tier.originalAmount;
            const originalPrice = tier.originalAmount;
            const isSpecial = tier.value === "permanent_1080";
            const money = (n: number) => (currency === "USD" ? formatUSD(Math.round(n / (settings.usdRate || 16000))) : formatPrice(n));
            const moneyFull = (n: number) => (currency === "USD" ? formatUSD(Math.round(n / (settings.usdRate || 16000))) : formatRupiah(n));

            return (
              <motion.div
                key={tier.value}
                {...animStagger}
                transition={reduce ? undefined : { ...stagger.transition, delay: i * 0.1 }}
                className={`card-sm flex flex-col relative transition-all duration-200 hover:shadow-xl ${
                  isSpecial
                    ? "ring-2 ring-emerald-400 shadow-lg shadow-emerald-100/60 sm:scale-[1.02]"
                    : "hover:-translate-y-0.5"
                }`}
              >
                {isSpecial && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-md whitespace-nowrap z-10 flex items-center gap-1">
                    <Flame className="w-3 h-3" aria-hidden="true" /> {t(dict.home.pricing.mostPopular)}
                  </div>
                )}

                <div className="flex-1">
                  <span className="font-bold text-gray-900 text-sm">{tier.label}</span>

                  <div className="mt-3 mb-3">
                    {disc > 0 && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 line-through tabular">{money(originalPrice)}</span>
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded tabular">
                          -{disc}%
                        </span>
                      </div>
                    )}
                    <div className="text-3xl font-extrabold text-gray-900 tracking-tight tabular">
                      {money(basePrice)}
                    </div>
                    {disc > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[11px] text-emerald-600 font-semibold tabular">
                          {tf(t(dict.home.pricing.save), { amount: moneyFull(originalPrice - basePrice) })}
                        </span>
                      </div>
                    )}
                  </div>

                  {cashback > 0 && (
                    <div className="flex items-center gap-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-100 mb-3">
                      <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                      <span className="text-[11px] font-bold text-amber-800 tabular">
                        {tf(t(dict.home.pricing.cashbackAmount), { amount: moneyFull(cashback) })}
                      </span>
                    </div>
                  )}

                  <ul className="space-y-2 mb-5">
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" /> {t(dict.home.pricing.bulletLifetime)}
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <Monitor className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                      {t(tier.value === "permanent_1080" ? dict.home.pricing.bullet1080 : dict.home.pricing.bullet720)}
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" /> {t(dict.home.pricing.bulletFeatures)}
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" /> {t(dict.home.pricing.bulletForever)}
                    </li>
                  </ul>
                </div>

                <Link
                  href={`/beli?tier=${tier.value}`}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 ${
                    isSpecial
                      ? "btn-emerald !py-2.5 !text-xs"
                      : "btn-dark !py-2.5 !text-xs"
                  }`}
                >
                  {t(dict.home.pricing.choose)} <ChevronRight className="w-3 h-3" aria-hidden="true" />
                </Link>
                <p className="mt-2.5 text-[10px] text-orange-500 font-medium text-center flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>{t(dict.home.pricing.urgency)}</span>
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── CARA BELI ─── */}
      <motion.section id="cara-beli" {...anim} className="max-w-5xl mx-auto px-4 py-10 sm:py-14 scroll-mt-20">
        <h2 className="section-title">{t(dict.home.steps.title)}</h2>
        <p className="section-sub">{t(dict.home.steps.sub)}</p>
        <div className="relative grid sm:grid-cols-3 gap-4">
          <div
            className="hidden sm:block absolute top-[52px] left-[16%] right-[16%] h-px bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200"
            aria-hidden="true"
          />
          {dict.home.steps.items.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <motion.div
                key={step.label.en}
                {...animStagger}
                transition={reduce ? undefined : { ...stagger.transition, delay: i * 0.12 }}
                className="card-sm text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-50 ring-4 ring-white flex items-center justify-center mx-auto mb-3 relative">
                  <Icon className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center tabular">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-xs">{t(step.label)}</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{t(step.desc)}</p>
              </motion.div>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <Link href="/beli" className="btn-dark inline-flex items-center gap-2">
            {t(dict.home.steps.cta)} <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </motion.section>

      {/* ─── PEMBAYARAN ─── */}
      <motion.section {...anim} className="relative max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50/80 to-transparent" />
        <div className="card-lg max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-blue-600" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{t(dict.home.payment.title)}</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
            {t(dict.home.payment.sub)}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {/* SAAT INI KHUSUS QRIS.
                TODO: buka lagi array di bawah saat metode lain (transfer bank, e-wallet langsung, dll.) sudah siap:
                {["QRIS", t(dict.home.payment.methodBank), "E-Wallet"].map((m, i) => ( */}
            {["QRIS"].map((m, i) => (
              <motion.span
                key={m}
                initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={reduce ? undefined : { delay: i * 0.05 }}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 shadow-sm"
              >
                {m}
              </motion.span>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-4">{t(dict.home.payment.safeNote)}</p>
        </div>
      </motion.section>

      {/* ─── CASHBACK ─── */}
      <motion.section id="cashback" {...anim} className="max-w-5xl mx-auto px-4 py-10 sm:py-14 scroll-mt-20">
        <h2 className="section-title">{t(dict.home.cashback.title)}</h2>
        <p className="section-sub">{t(dict.home.cashback.sub)}</p>
        <p className="text-xs text-gray-400 text-center -mt-4 mb-8">
          {t(dict.home.cashback.tncNote)}
        </p>

        {cashbackEligible.length > 0 && (
          <div className="max-w-lg mx-auto card-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4">{t(dict.home.cashback.amountsTitle)}</h3>
            <div className="space-y-2">
              {cashbackEligible.map((tp) => (
                <div key={tp.value} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="text-sm font-medium text-gray-900">{tp.label}</span>
                  <span className="text-sm font-bold text-amber-700 tabular">
                    + {formatRupiah(settings.cashbackTiers[tp.value] || 0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/klaim-cashback"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 rounded"
              >
                {t(dict.home.cashback.claimNow)} <ChevronRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}

        <div className="max-w-lg mx-auto mt-6 card-sm text-xs text-gray-500 leading-relaxed space-y-2">
          <p><strong>{t(dict.home.cashback.reqTitle)}</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              {t(dict.home.cashback.req1Pre)}
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="link-accent text-violet-600 hover:text-violet-700">
                TikTok @mineclipstudios
                <ExternalLink className="w-3 h-3 inline ml-0.5" aria-hidden="true" />
              </a>
              {t(dict.home.cashback.req1Mid)}
              <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="link-accent text-violet-600 hover:text-violet-700">
                YouTube Channel @Mineclips_collection
                <ExternalLink className="w-3 h-3 inline ml-0.5" aria-hidden="true" />
              </a>
            </li>
            <li>{t(dict.home.cashback.req2)}</li>
            <li>{t(dict.home.cashback.req3)}</li>
            <li>{t(dict.home.cashback.req4)}</li>
            <li>{t(dict.home.cashback.req5)}</li>
          </ol>
          <p className="mt-3">{t(dict.home.cashback.closing)}</p>
        </div>
      </motion.section>

      {/* ─── KONTAK ─── */}
      <motion.section {...anim} className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <div className="card-lg max-w-lg mx-auto text-center">
          <h2 className="text-lg font-bold text-gray-900">{t(dict.home.contact.title)}</h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">{t(dict.home.contact.sub)}</p>
          <div className="space-y-3 text-left max-w-xs mx-auto">
            <a
              href="https://wa.me/6282395912267"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gray-900">WhatsApp</div>
                <div className="text-xs text-gray-500 truncate">+62 823-9591-2267</div>
              </div>
            </a>
            <a
              href="mailto:mineclipstudios@gmail.com"
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <Mail className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gray-900">Email</div>
                <div className="text-xs text-gray-500 truncate">mineclipstudios@gmail.com</div>
              </div>
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
