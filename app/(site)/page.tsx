"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Download, Mic, Scissors, Brain, Volume2, CreditCard, Gift, Phone, Mail,
  ChevronRight, Sparkles, Clock, ShieldCheck, Monitor,
  Flame, Coins, User, ExternalLink, Cpu, Clapperboard, Send, Subtitles, Bot,
} from "lucide-react";
import { formatRupiah, formatPrice } from "@/lib/tiers";
import { useAppSettings } from "@/hooks/useAppSettings";

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

const FEATURES = [
  { icon: Clapperboard, label: "7 Mode Klip", desc: "Lucu, Seru, Ringkas, Horror, Komedi, Podcast, Tech & Vlog — bisa pilih banyak sekaligus." },
  { icon: Cpu, label: "AI Gratis", desc: "Scoring klip gratis & tanpa khawatir kena limit token." },
  { icon: Download, label: "Download Video", desc: "YouTube, TikTok, Instagram — langsung dari aplikasi." },
  { icon: Mic, label: "Transkripsi AI", desc: "Otomatis transkrip audio pakai Whisper AI. Akurat & cepat." },
  { icon: Scissors, label: "Potong Klip Viral", desc: "Buat klip pendek 9:16 siap upload ke TikTok, Reels, Shorts." },
  { icon: Brain, label: "AI Scoring", desc: "Skor konten juga dapat menggunakan Gemini/OpenRouter/Claude." },
  { icon: Volume2, label: "Narasi AI Multi-Klip", desc: "Tulis teks, AI bacakan dengan suara Indonesia — teks beda tiap klip." },
  { icon: Subtitles, label: "Subtitle SRT", desc: "Upload transkrip SRT atau embed subtitle langsung ke video." },
  { icon: Send, label: "Notifikasi Telegram", desc: "Progress klip otomatis dikirim ke Telegram Anda." },
];

const FEATURES_LATEST = [
  { icon: Bot, label: "AI Chat Pribadi Unlimited", desc: "Chat dengan video & dokumen (PDF, Word, Excel, PPT, gambar) dengan konteks yang diingat per-sesi. Berjalan offline di PC Anda sendiri — tanpa batas token, tanpa langganan." },
  { icon: Send, label: "Integrasi Telegram", desc: "Progress klip & notifikasi otomatis dikirim ke Telegram — pantau dari HP di mana saja." },
];

const STEPS = [
  { icon: User, label: "Isi Data & Pilih Paket", desc: "Isi nama, WhatsApp & email, lalu pilih paket permanen di halaman beli." },
  { icon: Coins, label: "Pilih Metode Bayar", desc: "Bayar via QRIS atau transfer bank sesuai metode yang Anda pilih." },
  { icon: Gift, label: "Key & Aplikasi Dikirim", desc: "Key lisensi permanen & aplikasi dikirim via email atau WhatsApp sesuai data yang diisi." },
];

const TIKTOK_URL = "https://www.tiktok.com/@mineclipstudio";
const YOUTUBE_URL = "https://www.youtube.com/@Mineclips_collection";

export default function HomePage() {
  const { settings } = useAppSettings();
  const promoEnabled = settings.promoEnabled;
  const tiers = settings.tiers;
  const cashbackEligible = tiers.filter((t) => (settings.cashbackTiers[t.value] || 0) > 0);

  return (
    <div className="overflow-hidden">
      {/* ─── HERO ─── */}
      <motion.section {...fadeUp} className="relative max-w-5xl mx-auto px-4 pt-16 sm:pt-24 pb-12 sm:pb-20 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/60 to-transparent" />
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/50 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          YouTube Clipper v2.0 — Lisensi Permanen
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Download, Transkrip, Potong, <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
            Viral, dan Cuan.
          </span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Software desktop Windows all-in-one untuk content creator: download video dari YouTube/TikTok/Instagram,
          pilih dari 7 mode klip, transkripsi otomatis dengan Whisper AI, scoring AI lokal gratis tanpa batas,
          dan narasi AI bersuara Indonesia.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/50">
            <ShieldCheck className="w-3.5 h-3.5" /> Sekali Bayar, Pakai Selamanya
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200/50">
            <Coins className="w-3.5 h-3.5" /> Cashback s.d. Rp50.000
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            href="#harga"
            className="btn-primary bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-200/50 inline-flex items-center gap-2"
          >
            Lihat Harga <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/beli"
            className="px-8 py-3 rounded-xl font-semibold text-sm text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm inline-flex items-center gap-2"
          >
            Beli Langsung
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">Windows 10/11 (64-bit) • Tanpa langganan • Pembayaran via QRIS / Transfer Bank</p>
      </motion.section>

      {/* ─── FITUR TERBARU ─── */}
      <motion.section {...fadeUp} className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="px-3 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
            Baru
          </span>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Fitur Terbaru v2.0</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES_LATEST.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.label}
                {...stagger}
                transition={{ ...stagger.transition, delay: i * 0.1 }}
                className="card-sm hover:shadow-md transition-shadow duration-200 group flex flex-col items-center text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-4 mx-auto group-hover:bg-violet-100 transition-colors">
                  <Icon className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{f.label}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── FITUR ─── */}
      <motion.section {...fadeUp} className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center">Kenapa YouTube Clipper?</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-10">Satu software untuk semua kebutuhan konten viral Anda.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.label}
                {...stagger}
                transition={{ ...stagger.transition, delay: i * 0.1 }}
                className="card-sm hover:shadow-md transition-shadow duration-200 group flex flex-col items-center text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4 mx-auto group-hover:bg-emerald-100 transition-colors">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{f.label}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── HARGA ─── */}
      <motion.section id="harga" {...fadeUp} className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50/80 to-transparent" />
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center">Pilih Paket</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-3">
          Lisensi permanen — sekali bayar, dapat anda gunakan selamanya. Harga sewaktu-waktu bisa berubah.
        </p>
        <p className="text-xs text-gray-400 text-center mb-10">
          <Coins className="w-4 h-4 inline text-amber-500 -mt-0.5" /> Setiap paket berhak klaim cashback!
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {tiers.map((tier, i) => {
            const disc = promoEnabled ? tier.discountPercent : 0;
            const cashback = settings.cashbackTiers[tier.value] || 0;
            const basePrice = promoEnabled ? tier.amount : tier.originalAmount;
            const originalPrice = tier.originalAmount;
            const isSpecial = tier.value === "permanent_1080";

            return (
              <motion.div
                key={tier.value}
                {...stagger}
                transition={{ ...stagger.transition, delay: i * 0.1 }}
                className={`card-sm flex flex-col relative transition-all duration-200 hover:shadow-lg ${
                  isSpecial ? "ring-2 ring-emerald-400 shadow-md" : ""
                }`}
              >
                {isSpecial && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm whitespace-nowrap z-10">
                    <Flame className="w-3 h-3 text-orange-500 inline -mt-0.5" /> PALING LARIS
                  </div>
                )}

                <div className="flex-1">
                  <span className="font-semibold text-gray-900 text-sm">{tier.label}</span>

                  {/* Harga */}
                  <div className="mt-3 mb-3">
                    {disc > 0 && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded">
                          -{disc}%
                        </span>
                      </div>
                    )}
                    <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
                      {formatPrice(basePrice)}
                    </div>
                    {disc > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[11px] text-emerald-600 font-medium">
                          Hemat {formatRupiah(originalPrice - basePrice)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cashback */}
                  {cashback > 0 && (
                    <div className="flex items-center gap-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-100 mb-3">
                      <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-amber-800">
                        Cashback {formatRupiah(cashback)}
                      </span>
                    </div>
                  )}

                  {/* Bullet */}
                  <ul className="space-y-1.5 mb-4">
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" /> Lisensi permanen — sekali bayar
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <Monitor className="w-3 h-3 text-emerald-500 shrink-0" />
                      {tier.value === "permanent_1080" ? "Resolusi Full HD 1080p" : "Resolusi HD 720p"}
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" /> Semua fitur premium & update
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3 text-emerald-500 shrink-0" /> Berlaku selamanya
                    </li>
                  </ul>
                </div>

                <Link
                  href={`/beli?tier=${tier.value}`}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isSpecial
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 shadow-md shadow-emerald-200/50"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  Pilih Paket <ChevronRight className="w-3 h-3" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── CARA BELI ─── */}
      <motion.section id="cara-beli" {...fadeUp} className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center">Cara Pembelian</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-10">Cukup 3 langkah — dari beli sampai key siap pakai.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                {...stagger}
                transition={{ ...stagger.transition, delay: i * 0.12 }}
                className="card-sm text-center hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3 relative">
                  <Icon className="w-5 h-5 text-emerald-600" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-xs">{step.label}</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/beli"
            className="btn-primary bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black shadow-lg inline-flex items-center gap-2"
          >
            Beli Sekarang <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.section>

      {/* ─── PEMBAYARAN ─── */}
      <motion.section {...fadeUp} className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50/80 to-transparent" />
        <div className="card-lg max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Pembayaran via QRIS / Transfer Bank</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
            Pilih metode pembayaran yang tersedia — QRIS atau transfer bank.
            Data Anda terenkripsi & aman.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {["QRIS", "Transfer Bank", "E-Wallet"].map((m, i) => (
              <motion.span
                key={m}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ delay: i * 0.05 }}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 shadow-sm"
              >
                {m}
              </motion.span>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-4">Semua transaksi diproses dengan aman — tidak dialihkan ke website lain.</p>
        </div>
      </motion.section>

      {/* ─── CASHBACK ─── */}
      <motion.section id="cashback" {...fadeUp} className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center">Program Cashback</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-3">
          Dapatkan uang kembali dengan cara support kami melalui follow, like & share konten TikTok/Youtube kami.
        </p>
        <p className="text-xs text-gray-400 text-center mb-10">
          Syarat & Ketentuan berlaku
        </p>

        {cashbackEligible.length > 0 && (
          <div className="max-w-lg mx-auto card-sm">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">Besaran Cashback</h3>
            <div className="space-y-2">
              {cashbackEligible.map((t) => (
                <div key={t.value} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="text-sm font-medium text-gray-900">{t.label}</span>
                  <span className="text-sm font-bold text-amber-700">+ {formatRupiah(settings.cashbackTiers[t.value] || 0)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/klaim-cashback"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
              >
                Klaim cashback sekarang <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        <div className="max-w-lg mx-auto mt-6 card-sm text-xs text-gray-500 leading-relaxed space-y-2">
          <p><strong>Syarat Klaim:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Support kami dengan follow{" "}
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 font-semibold underline underline-offset-2 hover:text-violet-700">
                TikTok @mineclipstudio
                <ExternalLink className="w-3 h-3 inline ml-0.5" />
              </a>{" "}
              atau subscribe{" "}
              <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 font-semibold underline underline-offset-2 hover:text-violet-700">
                YouTube Channel @Mineclips_collection
                <ExternalLink className="w-3 h-3 inline ml-0.5" />
              </a>
            </li>
            <li>Like &amp; comment minimal 3 post kami — baik di TikTok maupun YouTube (wajib post yang berbeda untuk setiap klaim)</li>
            <li>Share video ke minimal 3 teman atau unggah video ke Story (share boleh dilakukan 3× ke akun kami; untuk Story cukup screenshot saat sudah tayang)</li>
            <li>Follow, like, comment, dan subscribe wajib dipertahankan minimal 7 hari — jika kedapatan berhenti lebih awal, cashback tidak dapat dicairkan</li>
            <li>Lampirkan screenshot bukti dari setiap langkah</li>
          </ol>
          <p className="mt-3">Pencairan dilakukan minimal 5 hari setelah key diaktifkan dan maksimal 7 hari. Bukti transfer cashback dikirim ke nomor WhatsApp atau email terdaftar. Maksimal 1 klaim per key.</p>
        </div>
      </motion.section>

      {/* ─── KONTAK ─── */}
      <motion.section {...fadeUp} className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="card-lg max-w-lg mx-auto text-center">
          <h2 className="text-lg font-bold text-gray-900">Hubungi Kami</h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">Ada pertanyaan? Butuh bantuan? Hubungi:</p>
          <div className="space-y-3 text-left max-w-xs mx-auto">
            <a
              href="https://wa.me/6282395912267"
              target="_blank"
              className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-xs font-semibold text-gray-900">WhatsApp</div>
                <div className="text-xs text-gray-500">+62 823-9591-2267</div>
              </div>
            </a>
            <a
              href="mailto:mineclipstudios@gmail.com"
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <Mail className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs font-semibold text-gray-900">Email</div>
                <div className="text-xs text-gray-500">mineclipstudios@gmail.com</div>
              </div>
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
