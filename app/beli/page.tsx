"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TIERS, formatRupiah } from "@/lib/tiers";

export default function BeliPage() {
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("");
  const [agree, setAgree] = useState(false);
  const [snkOpen, setSnkOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [payment, setPayment] = useState<{
    refId: string;
    trxId: string;
    totalAmount: number;
    qrImage: string;
    qrString: string;
    expiresAt: string;
  } | null>(null);
  const [pollStatus, setPollStatus] = useState<"pending" | "paid" | null>(null);
  const [paid, setPaid] = useState(false);
  const [countdown, setCountdown] = useState(900);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canSubmit = fullName && whatsapp && tier && agree && !loading;

  const startPolling = useCallback((refId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment?ref_id=${refId}`);
        const data = await res.json();
        if (data.status === "paid") {
          setPollStatus("paid");
          setPaid(true);
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(() => {
            window.location.href = "/success";
          }, 1500);
        }
      } catch {
        // retry next cycle
      }
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!payment) return;
    const expires = new Date(payment.expiresAt).getTime();
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expires - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [payment]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, whatsapp, email, tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat transaksi");

      setPayment(data);
      setPollStatus("pending");
      startPolling(data.refId);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  if (payment && pollStatus === "pending") {
    const expired = countdown <= 0;
    return (
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border shadow-sm p-6 text-center space-y-5">
          <h1 className="text-lg font-bold text-gray-900">Scan QRIS untuk Membayar</h1>

          <div className="bg-gray-50 rounded-xl p-6 inline-block mx-auto">
            <img src={payment.qrImage} alt="QRIS" className="w-56 h-56 mx-auto" />
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Total Pembayaran</div>
            <div className="text-2xl font-bold text-gray-900">{formatRupiah(payment.totalAmount)}</div>
          </div>

          {!expired ? (
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Sisa Waktu</div>
              <div className={`text-xl font-mono font-bold ${countdown < 120 ? "text-red-600 animate-pulse" : "text-gray-900"}`}>
                {formatTime(countdown)}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-sm text-red-600 font-semibold">QRIS telah kedaluwarsa</div>
              <button
                onClick={() => {
                  setPayment(null);
                  setPollStatus(null);
                  setCountdown(900);
                  if (pollRef.current) clearInterval(pollRef.current);
                }}
                className="mt-3 text-sm bg-gray-900 text-white px-4 py-2 rounded-lg"
              >
                Buat Ulang
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Menunggu pembayaran...
          </div>

          <p className="text-xs text-gray-400">
            Scan QRIS di atas menggunakan GoPay, e-Wallet, atau M-Banking.
          </p>
        </div>
      </main>
    );
  }

  if (paid) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Pembayaran Diterima!</h1>
        <p className="text-gray-500 text-sm">Mengalihkan ke halaman sukses...</p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <div className="rounded-t-xl bg-emerald-600 text-white px-6 py-6">
        <h1 className="text-lg font-bold">Beli Lisensi YouTube Clipper</h1>
        <p className="text-sm opacity-90 mt-1">Isi data di bawah, lalu bayar — key dikirim setelah pembayaran dikonfirmasi.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-b-xl shadow-sm p-6 space-y-5">
        <Field label="Nama Lengkap" required hint="Sesuai nama yang akan digunakan untuk pembelian">
          <input
            className="input"
            placeholder="Contoh: Budi Santoso"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </Field>

        <Field label="Nomor WhatsApp" required hint="Aktif — untuk konfirmasi dan pengiriman key lisensi">
          <input
            className="input"
            type="tel"
            placeholder="Contoh: 08123456789"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
          />
        </Field>

        <Field label="Alamat Email" hint="Opsional — alternatif jika WA tidak bisa dihubungi">
          <input
            className="input"
            type="email"
            placeholder="contoh@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Paket yang Dibeli" required hint="Pilih durasi dan resolusi yang diinginkan">
          <select className="input" value={tier} onChange={(e) => setTier(e.target.value)} required>
            <option value="">— Pilih Paket —</option>
            {TIERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} — {formatRupiah(t.amount)}
              </option>
            ))}
          </select>
        </Field>

        <hr />

        <div>
          <label className="font-semibold text-sm text-gray-900 block mb-1">
            Syarat & Ketentuan Pembelian <span className="text-red-600">*</span>
          </label>
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setSnkOpen((v) => !v)}
              className="w-full flex justify-between items-center px-4 py-3 text-sm font-medium bg-gray-50 hover:bg-gray-100"
            >
              <span>Klik untuk membaca Syarat & Ketentuan lengkap</span>
              <span className={`transition-transform ${snkOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {snkOpen && (
              <div className="px-4 py-3 text-sm text-gray-600 leading-relaxed space-y-2">
                <p><strong>1. Ketentuan Pembelian</strong> — Key lisensi dikirim via WhatsApp setelah pembayaran dikonfirmasi otomatis oleh sistem. Key terkunci ke Machine ID yang didaftarkan dan tidak bisa dipindah ke perangkat lain.</p>
                <p><strong>2. No Refund</strong> — Semua pembelian lisensi bersifat final. Tidak ada refund setelah key dikirim.</p>
                <p><strong>3. Pelanggaran & Blokir</strong> — Manipulasi waktu sistem untuk memperpanjang lisensi adalah pelanggaran serius dan akan diblokir otomatis. Untuk membuka blokir, dikenakan denda 70% dari harga paket.</p>
                <p><strong>4. Data Pribadi</strong> — Data Anda hanya digunakan untuk keperluan aktivasi dan dukungan, tidak dibagikan ke pihak ketiga.</p>
                <p><strong>5. Perubahan Harga</strong> — Harga dapat berubah sewaktu-waktu. Pembelian mengikuti harga saat transaksi.</p>
              </div>
            )}
          </div>
        </div>

        <label className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4 cursor-pointer">
          <input type="checkbox" className="mt-1 accent-emerald-600 w-4 h-4" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <div>
            <div className="font-semibold text-sm text-emerald-900">Saya setuju dengan Syarat & Ketentuan yang berlaku</div>
            <div className="text-xs text-emerald-800/80 mt-1">Termasuk No Refund Policy dan denda pelanggaran 70%.</div>
          </div>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg"
          >
            {loading ? "Memproses..." : "Lanjut ke Pembayaran"}
          </button>
        </div>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 0.7rem;
          border: 1px solid #dadce0;
          border-radius: 0.5rem;
          font-size: 0.9rem;
        }
        .input:focus {
          outline: none;
          border-color: #059669;
          box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.15);
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-semibold text-sm text-gray-900 block mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {hint && <div className="text-xs text-gray-500 mb-1.5">{hint}</div>}
      {children}
    </div>
  );
}
