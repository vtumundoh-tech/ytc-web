export default function SuccessPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto mb-5">
        ✓
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
      <p className="text-gray-500 text-sm leading-relaxed">
        Key lisensi akan dikirim ke nomor WhatsApp yang Anda daftarkan begitu pembayaran terkonfirmasi
        (biasanya beberapa menit).
      </p>
    </main>
  );
}
