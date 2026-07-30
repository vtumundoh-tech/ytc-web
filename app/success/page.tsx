export default function SuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 sm:py-24">
      <div className="card-lg text-center animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-emerald-600 animate-check"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">Pembayaran Berhasil!</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Key lisensi akan dikirim ke nomor WhatsApp yang Anda daftarkan begitu pembayaran terkonfirmasi (biasanya beberapa menit).
        </p>
      </div>
    </div>
  );
}
