import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">YouTube Clipper</h1>
        <p className="text-gray-500 mt-2">Pilih salah satu di bawah ini untuk melanjutkan.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Link
          href="/beli"
          className="group block rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-emerald-400 transition"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4">
            Rp
          </div>
          <h2 className="font-semibold text-gray-900 text-lg mb-1">Beli Lisensi</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Belum punya key lisensi? Pilih paket & bayar langsung via QRIS / VA / e-wallet.
          </p>
          <span className="inline-block mt-4 text-sm font-medium text-emerald-700 group-hover:underline">
            Beli sekarang →
          </span>
        </Link>

        <Link
          href="/klaim-cashback"
          className="group block rounded-2xl border border-violet-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-violet-400 transition"
        >
          <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-lg mb-4">
            %
          </div>
          <h2 className="font-semibold text-gray-900 text-lg mb-1">Klaim Cashback</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Sudah beli key dan sudah follow/like/share? Klaim cashback Anda di sini.
          </p>
          <span className="inline-block mt-4 text-sm font-medium text-violet-700 group-hover:underline">
            Klaim sekarang →
          </span>
        </Link>
      </div>
    </main>
  );
}
