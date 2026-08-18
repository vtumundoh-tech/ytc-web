"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle, CheckCircle, Gift, BellRing, Home, X, RefreshCw } from "lucide-react";
import { formatRupiah } from "@/lib/tiers";

type OrderStatus = {
  found: boolean;
  status: string;
  paid: boolean;
  rejected: boolean;
  amount: number;
  tierLabel: string;
  rejectionReason: string;
  rejectionType: string;
  amountPaidByCustomer: number | null;
  amountRemaining: number | null;
  cashbackCode: string;
};

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [data, setData] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"" | "refund" | "supplement">("");
  const [refundOk, setRefundOk] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Tautan status tidak valid. Gunakan tautan yang dikirim via email.");
      return;
    }
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`/api/order-status?token=${encodeURIComponent(token)}`, { cache: "no-store" });
        const d = await res.json();
        if (cancelled) return;
        if (d && d.found) {
          setData(d);
          setLoading(false);
        } else {
          setLoading(false);
          setError("Pesanan tidak ditemukan. Gunakan tautan yang dikirim via email.");
        }
      } catch {
        if (cancelled) return;
        setLoading(false);
        setError("Terjadi kesalahan saat memuat status. Coba lagi beberapa saat.");
      }
    };
    check();
    const timer = setInterval(check, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [token]);

  async function handleRefund() {
    if (busy) return;
    setBusy("refund");
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/refund-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal mengajukan refund.");
      setRefundOk(true);
    } catch (err: any) {
      setError(err.message || "Gagal mengajukan refund.");
    } finally {
      setBusy("");
    }
  }

  async function handleSupplement() {
    if (busy) return;
    setBusy("supplement");
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/order-supplement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal membuat pembayaran pelengkap.");
      router.push(`/beli?supplement=${encodeURIComponent(d.downloadToken)}`);
    } catch (err: any) {
      setError(err.message || "Gagal membuat pembayaran pelengkap.");
    } finally {
      setBusy("");
    }
  }

  const rejectedInsufficient = data?.rejected && data.rejectionType === "insufficient";

  return (
    <div className="max-w-lg mx-auto px-4 py-16 sm:py-24">
      <div className="card-lg text-center">
        {error && !data && (
          <>
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">Gagal memuat status</h1>
            <p className="text-sm text-gray-500 mb-5">{error}</p>
            <a
              href={`mailto:mineclipstudios@gmail.com?subject=Kendala%20Status%20Pesanan`}
              className="inline-block text-sm font-semibold text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
            >
              Hubungi admin
            </a>
          </>
        )}

        {loading && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">Memeriksa status pesanan…</h1>
            <p className="text-sm text-gray-500">Status diperbarui otomatis tiap 5 detik.</p>
          </>
        )}

        {data?.paid && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
            <p className="text-sm text-gray-500 mb-5">
              Terima kasih! Pesanan Anda telah lunas.
              {data.cashbackCode ? (
                <>
                  {" "}Kode cashback Anda:{" "}
                  <span className="font-mono font-bold text-amber-700 select-all">{data.cashbackCode}</span>
                </>
              ) : (
                ""
              )}
            </p>
            <p className="text-xs text-gray-400 mb-5">
              Link unduhan & invoice dikirim ke email Anda. Bila belum ada, cek folder spam.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md"
            >
              <Home className="w-4 h-4" /> Kembali ke Beranda
            </button>
          </>
        )}

        {data && !data.paid && !data.rejected && (
          <>
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">Menunggu Verifikasi Admin</h1>
            <p className="text-sm text-gray-500 mb-5">
              Bukti bayar Anda sedang kami periksa. Status ini diperbarui otomatis — halaman akan berubah begitu admin
              memverifikasi.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md"
            >
              <Home className="w-4 h-4" /> Kembali ke Beranda
            </button>
          </>
        )}

        {data?.rejected && !rejectedInsufficient && (
          <>
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <X className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">Pesanan Tidak Sesuai Ketentuan</h1>
            <p className="text-sm text-gray-500 mb-4">Pesanan Anda tidak dapat kami proses.</p>
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-left text-xs text-red-800 mb-4">
              <strong>Alasan:</strong> {data.rejectionReason || "Pesanan Anda tidak sesuai dengan ketentuan yang berlaku."}
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-800 mb-5">
              <BellRing className="w-4 h-4 inline mr-1.5 text-amber-600" />
              Dana yang telah Anda bayarkan akan dikembalikan ke rekening pengirim paling lambat{" "}
              <strong>1x24 jam</strong>, sesuai jumlah yang ditransfer (potongan transfer bank menjadi tanggungan
              pelanggan). Detail juga dikirim ke email Anda.
            </div>
            <button
              onClick={() => router.push("/")}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-md"
            >
              <Home className="w-4 h-4" /> Kembali ke Beranda
            </button>
          </>
        )}

        {rejectedInsufficient && (
          <>
            {refundOk ? (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <h1 className="text-lg font-bold text-gray-900 mb-2">Permintaan Refund Dikirim</h1>
                <p className="text-sm text-gray-500 mb-5">
                  Permintaan refund Anda sudah terkirim ke admin. Kami akan memprosesnya paling lambat{" "}
                  <strong>1x24 jam</strong> — bukti transfer refund akan dikirim ke email Anda.
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
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>
                <h1 className="text-lg font-bold text-gray-900 mb-2">Jumlah Pembayaran Tidak Sesuai</h1>
                <p className="text-sm text-gray-500 mb-4">Pembayaran yang kami terima kurang dari nominal yang diminta.</p>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-left text-xs text-gray-600 space-y-1.5 mb-4">
                  <div className="flex justify-between">
                    <span>Harga Produk</span>
                    <span className="font-bold text-gray-900">{formatRupiah(data.amount + (data.amountRemaining || 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yang Telah Dibayar</span>
                    <span className="font-semibold">{formatRupiah(data.amountPaidByCustomer || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1.5">
                    <span>Sisa yang Harus Dibayar</span>
                    <span className="font-bold text-red-600">{formatRupiah(data.amountRemaining || 0)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-800 mb-4">
                  <BellRing className="w-4 h-4 inline mr-1.5 text-amber-600" />
                  Pilih salah satu opsi:
                  <ol className="list-decimal list-inside pl-1 mt-1 space-y-1">
                    <li><strong>Ajukan Refund</strong> — dana dikembalikan ≤1x24 jam ke rekening pengirim (potongan transfer bank ditanggung pelanggan).</li>
                    <li><strong>Bayar Kekurangan</strong> — lengkapi nominal kurang via QRIS, lalu pesanan langsung diproses.</li>
                  </ol>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700 mb-3">{error}</div>
                )}

                <button
                  onClick={handleRefund}
                  disabled={!!busy}
                  className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:opacity-50 shadow-md"
                >
                  {busy === "refund" ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Ajukan Refund
                </button>
                <button
                  onClick={handleSupplement}
                  disabled={!!busy}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 shadow-md"
                >
                  {busy === "supplement" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Bayar Kekurangan
                </button>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                  <button onClick={() => router.push("/")} className="inline-flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2">
                    <Home className="w-3.5 h-3.5" /> Kembali ke Beranda
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="card-lg text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
        </div>
      </div>
    }>
      <OrderContent />
    </Suspense>
  );
}