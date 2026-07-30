import Link from "next/link";
import { CreditCard, Gift, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-12 sm:mb-16 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/50 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          YouTube Clipper — Lisensi Premium
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Nyaman. Cepat.{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
            Terpercaya.
          </span>
        </h1>
        <p className="mt-4 text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Pilih salah satu di bawah untuk membeli lisensi atau klaim cashback Anda.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
        <Link
          href="/beli"
          className="group relative overflow-hidden rounded-2xl bg-white border border-emerald-100 p-6 sm:p-8 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300 animate-slide-up"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-50" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-200/50">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Beli Lisensi</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Belum punya key lisensi? Pilih paket sesuai kebutuhan & bayar langsung via QRIS, Virtual Account, atau e-wallet.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 group-hover:gap-2.5 transition-all duration-200">
              Beli sekarang <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        <Link
          href="/klaim-cashback"
          className="group relative overflow-hidden rounded-2xl bg-white border border-violet-100 p-6 sm:p-8 shadow-sm hover:shadow-lg hover:border-violet-300 transition-all duration-300 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-50 to-transparent rounded-bl-full opacity-50" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-violet-200/50">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Klaim Cashback</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Sudah beli key dan sudah follow/like/share? Klaim cashback Anda sekarang juga.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 group-hover:gap-2.5 transition-all duration-200">
              Klaim sekarang <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
