"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Claim = {
  id: string;
  created_at: string;
  full_name: string;
  whatsapp: string;
  machine_id: string;
  license_key: string;
  tier: string;
  addon_1080p: string | null;
  amount_paid: number;
  payment_proof_url: string | null;
  screenshot_follow_url: string;
  screenshot_like_url: string;
  screenshot_share_url: string;
  notes: string | null;
  status: string;
  admin_notes: string | null;
  agree_snk: boolean;
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function parseLikeUrls(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* fallthrough */
  }
  return [value];
}

export default function InvoiceClaimPage() {
  const params = useParams();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/claims")
      .then((r) => r.json())
      .then((d) => {
        const found = (d.data || []).find((c: Claim) => c.id === params.id);
        setClaim(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const cashbackAmount = claim ? (claim.status === "paid" || claim.status === "approved" ? Math.round(claim.amount_paid * 0.15) : 0) : 0;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="card-lg animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Klaim tidak ditemukan.</p>
        <Link href="/admin" className="text-sm text-emerald-600 underline mt-2 inline-block">Kembali</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <style jsx>{`
        @media print {
          @page { margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="no-print flex items-center justify-between mb-6">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" /> Cetak / PDF
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm print:shadow-none print:border-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                YC
              </div>
              <span className="font-bold text-gray-900 text-sm">YouTube Clipper</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Cashback Program</p>
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2 justify-end">
              <FileText className="w-4 h-4 text-violet-600" /> CASHBACK INVOICE
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">#{claim.id.slice(0, 8)}</p>
          </div>
        </div>

        {/* Info */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Pelanggan</h3>
            <p className="text-sm font-semibold text-gray-900">{claim.full_name}</p>
            <p className="text-xs text-gray-500">{claim.whatsapp}</p>
            <p className="text-xs text-gray-500 mt-1">Machine ID: {claim.machine_id}</p>
            <p className="text-xs text-gray-500">Key: {claim.license_key}</p>
          </div>
          <div className="sm:text-right">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Tanggal Klaim</h3>
            <p className="text-sm text-gray-900">
              {new Date(claim.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-3 mb-1">Status</h3>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-block ${
              claim.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              claim.status === "approved" ? "bg-blue-50 text-blue-700 border-blue-200" :
              claim.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
              "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {claim.status}
            </span>
          </div>
        </div>

        {/* Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-widest pb-2">Item</th>
              <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-widest pb-2">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50">
              <td className="py-3 text-sm text-gray-900">
                Pembelian lisensi {claim.tier.replace("_", " ")}
                {claim.addon_1080p === "yes" ? " +1080p" : ""}
              </td>
              <td className="py-3 text-sm font-semibold text-gray-900 text-right">{rupiah(claim.amount_paid)}</td>
            </tr>
            {cashbackAmount > 0 && (
              <tr className="border-b border-gray-50">
                <td className="py-3 text-sm text-emerald-700 font-medium">Cashback dibayarkan</td>
                <td className="py-3 text-sm font-semibold text-emerald-700 text-right">- {rupiah(cashbackAmount)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-3 text-sm font-bold text-gray-900">Total dibayar pelanggan</td>
              <td className="pt-3 text-sm font-bold text-gray-900 text-right">{rupiah(claim.amount_paid)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Bukti */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Bukti Lampiran</h3>
          <div className="flex flex-wrap gap-2">
            {claim.payment_proof_url && (
              <a href={claim.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-violet-600 hover:text-violet-800 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-lg">Bukti Bayar</a>
            )}
            {claim.screenshot_follow_url && (
              <a href={claim.screenshot_follow_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">Bukti Follow/Subscribe</a>
            )}
            {claim.screenshot_like_url && parseLikeUrls(claim.screenshot_like_url).map((u, i) => {
              const multiple = parseLikeUrls(claim.screenshot_like_url).length > 1;
              return (
                <a key={`${u}-${i}`} href={u} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                  {multiple ? `Bukti Like & Comment #${i + 1}` : "Bukti Like & Comment"}
                </a>
              );
            })}
            {claim.screenshot_share_url && (
              <a href={claim.screenshot_share_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">Bukti Share</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
