import Link from "next/link";
import {
  Download, Mic, Scissors, Brain, Volume2, CreditCard, Gift, Phone, Mail,
  ChevronRight, Sparkles, Clock, ShieldCheck, TrendingUp,
} from "lucide-react";
import { TIERS, CASHBACK_TIERS, formatRupiah, discountPercent, findCashback } from "@/lib/tiers";

const FEATURES = [
  { icon: Download, label: "Download Video", desc: "YouTube, TikTok, Instagram — langsung dari aplikasi." },
  { icon: Mic, label: "Transkripsi AI", desc: "Otomatis transkrip audio pakai Whisper AI. Akurat & cepat." },
  { icon: Scissors, label: "Potong Klip Viral", desc: "Buat klip pendek siap upload ke TikTok, Reels, Shorts." },
  { icon: Brain, label: "AI Scoring", desc: "Skor konten pakai Gemini/OpenRouter/Claude." },
  { icon: Volume2, label: "Narator Otomatis", desc: "Suara narasi realistik dari Azure TTS." },
];

const STEPS = [
  { icon: Download, label: "Download & Install", desc: "Download aplikasi YouTube Clipper di laptop Windows Anda." },
  { icon: CreditCard, label: "Dapatkan Machine ID", desc: "Buka halaman aktivasi, salin 12-digit Machine ID." },
  { icon: Gift, label: "Pilih Paket", desc: "Pilih durasi sewa sesuai kebutuhan — 1, 7, 17, atau 30 hari." },
  { icon: ShieldCheck, label: "Bayar via Midtrans", desc: "QRIS, Virtual Account, atau E-Wallet. Aman & terpercaya." },
  { icon: Sparkles, label: "Key Dikirim", desc: "Lisensi dikirim otomatis ke aplikasi & via WhatsApp." },
];

const CASHBACK_ELIGIBLE = CASHBACK_TIERS.filter((t) => t.amount > 0);

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ────────────── HERO ────────────── */}
      <section className="relative max-w-5xl mx-auto px-4 pt-16 sm:pt-24 pb-12 sm:pb-20 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/60 to-transparent" />
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/50 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          YouTube Clipper v2.0 — Software Lisensi
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Download, Transkrip, Potong,{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
            Viral.
          </span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Software desktop Windows all-in-one untuk content creator: download video dari YouTube/TikTok/Instagram,
          transkripsi otomatis dengan Whisper AI, potong klip pendek viral, scoring AI, dan narator Azure TTS.
        </p>
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
        <p className="text-xs text-gray-400 mt-4">Windows 10/11 • Pembayaran via Midtrans (QRIS/VA/E-Wallet)</p>
      </section>

      {/* ────────────── FITUR ────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center">Kenapa YouTube Clipper?</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-10">Satu software untuk semua kebutuhan konten viral Anda.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="card-sm hover:shadow-md transition-shadow duration-200 group">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{f.label}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ────────────── HARGA ────────────── */}
      <section id="harga" className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50/80 to-transparent" />
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center">Pilih Paket Sewa</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-3">Harga spesial — diskon terbatas. Harga sewaktu-waktu bisa berubah.</p>
        <p className="text-xs text-gray-400 text-center mb-10">💰 Setiap pembelian paket 720p tertentu berhak klaim cashback!</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((tier) => {
            const disc = discountPercent(tier);
            const cashback = findCashback(tier.value);
            const isMonthly = tier.value.includes("monthly");
            const isWeekly720 = tier.value === "weekly_720";
            const isSemiMonthly720 = tier.value === "semi_monthly_720";
            const isBestValue = tier.value === "monthly_720";

            return (
              <div
                key={tier.value}
                className={`card-sm flex flex-col relative transition-all duration-200 hover:shadow-lg ${
                  isBestValue ? "ring-2 ring-emerald-400 shadow-md" : ""
                }`}
              >
                {isBestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-[10px] font-bold rounded-full shadow-sm whitespace-nowrap">
                    ⭐ BEST SELLER
                  </div>
                )}
                {isWeekly720 && !isBestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm whitespace-nowrap">
                    🔥 POPULER
                  </div>
                )}
                {isSemiMonthly720 && !isBestValue && !isWeekly720 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[10px] font-bold rounded-full shadow-sm whitespace-nowrap">
                    🎯 TERLARIS
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold text-gray-900 text-sm">{tier.label}</span>
                    {isMonthly && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                        SPECIAL
                      </span>
                    )}
                  </div>

                  {/* Harga */}
                  <div className="mb-3">
                    {disc > 0 && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 line-through">{formatRupiah(tier.originalAmount)}</span>
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded">
                          -{disc}%
                        </span>
                      </div>
                    )}
                    <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
                      {formatRupiah(tier.amount)}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {disc > 0
                        ? `Hemat ${formatRupiah(tier.originalAmount - tier.amount)}`
                        : "Harga spesial"}
                    </div>
                  </div>

                  {/* Info tambahan */}
                  {tier.label.includes("1080p") && (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mb-3">
                      <TrendingUp className="w-3 h-3" /> Resolusi Full HD
                    </div>
                  )}

                  {/* Cashback */}
                  {cashback > 0 && (
                    <div className="flex items-center gap-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-100 mb-3">
                      <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-amber-800">
                        Cashback {formatRupiah(cashback)}
                      </span>
                    </div>
                  )}

                  {/* Bullet poin */}
                  <ul className="space-y-1.5 mb-4">
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" /> Lisensi non-eksklusif
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3 text-emerald-500 shrink-0" /> Masa aktif {tier.label.split("(")[0].trim().toLowerCase()}
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" /> Semua fitur premium
                    </li>
                  </ul>
                </div>

                <Link
                  href={`/beli?tier=${tier.value}`}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    disc >= 30
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 shadow-md shadow-emerald-200/50"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  Pilih Paket <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ────────────── CARA BELI ────────────── */}
      <section id="cara-beli" className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center">Cara Pembelian</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-10">Cukup 5 langkah — dari install sampai key siap pakai.</p>
        <div className="grid sm:grid-cols-5 gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="card-sm text-center hover:shadow-md transition-shadow duration-200">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3 relative">
                  <Icon className="w-5 h-5 text-emerald-600" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-xs">{step.label}</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{step.desc}</p>
              </div>
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
      </section>

      {/* ────────────── MIDTRANS ────────────── */}
      <section className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50/80 to-transparent" />
        <div className="card-lg max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Pembayaran Aman via Midtrans</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
            Pembayaran diproses oleh <strong>Midtrans</strong> — payment gateway tepercaya di Indonesia.
            Data Anda terenkripsi & aman.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {["QRIS", "GoPay", "ShopeePay", "BCA VA", "BNI VA", "BRI VA", "Permata VA"].map((m) => (
              <span key={m} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 shadow-sm">
                {m}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-4">Semua transaksi diproses langsung oleh Midtrans — tidak dialihkan ke website lain.</p>
        </div>
      </section>

      {/* ────────────── CASHBACK ────────────── */}
      <section id="cashback" className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center">Program Cashback</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-3">
          Dapatkan uang kembali dengan follow, like & share konten TikTok kami.
        </p>
        <p className="text-xs text-gray-400 text-center mb-10">
          Syarat & Ketentuan berlaku — lihat detail di halaman klaim cashback.
        </p>

        {CASHBACK_ELIGIBLE.length > 0 && (
          <div className="max-w-lg mx-auto card-sm">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">Besaran Cashback</h3>
            <div className="space-y-2">
              {CASHBACK_ELIGIBLE.map((t) => (
                <div key={t.value} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="text-sm font-medium text-gray-900">{t.label.replace(" — Rp.*", "")}</span>
                  <span className="text-sm font-bold text-amber-700">+ {formatRupiah(t.amount)}</span>
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
            <li>Follow TikTok @yourstudio</li>
            <li>Like & comment video promo terbaru (WAJIB video berbeda untuk setiap klaim)</li>
            <li>Share video ke minimal 3 teman (DM/Story)</li>
            <li>Lampirkan screenshot bukti setiap langkah</li>
          </ol>
          <p className="mt-3">Cashback ditransfer ke nomor WhatsApp terdaftar. Maksimal 1 klaim per key.</p>
        </div>
      </section>

      {/* ────────────── KONTAK ────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="card-lg max-w-lg mx-auto text-center">
          <h2 className="text-lg font-bold text-gray-900">Hubungi Kami</h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">Ada pertanyaan? Butuh bantuan? Tim kami siap membantu.</p>
          <div className="space-y-3 text-left max-w-xs mx-auto">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-xs font-semibold text-gray-900">WhatsApp</div>
                <div className="text-xs text-gray-500">+62 812-3456-7890</div>
              </div>
            </a>
            <a
              href="mailto:support@youtubeclipper.com"
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <Mail className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs font-semibold text-gray-900">Email</div>
                <div className="text-xs text-gray-500">support@youtubeclipper.com</div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
