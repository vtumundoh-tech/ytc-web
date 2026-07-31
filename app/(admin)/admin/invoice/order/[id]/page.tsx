"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Order = {
  id: string;
  created_at: string;
  full_name: string;
  whatsapp: string;
  email: string | null;
  tier_label: string;
  amount: number;
  status: string;
  payment_type: string | null;
  midtrans_order_id: string;
  license_key: string | null;
  admin_notes: string | null;
  agree_snk: boolean;
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function InvoiceOrderPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => {
        const found = (d.data || []).find((o: Order) => o.id === params.id);
        setOrder(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

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

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Order tidak ditemukan.</p>
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                YC
              </div>
              <span className="font-bold text-gray-900 text-sm">YouTube Clipper</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Lisensi Software Desktop</p>
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2 justify-end">
              <FileText className="w-4 h-4 text-emerald-600" /> INVOICE
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{order.midtrans_order_id}</p>
          </div>
        </div>

        {/* Info */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Pelanggan</h3>
            <p className="text-sm font-semibold text-gray-900">{order.full_name}</p>
            <p className="text-xs text-gray-500">{order.whatsapp}</p>
            {order.email && <p className="text-xs text-gray-500">{order.email}</p>}
          </div>
          <div className="sm:text-right">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Tanggal</h3>
            <p className="text-sm text-gray-900">
              {new Date(order.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            {order.payment_type && (
              <>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-3 mb-1">Pembayaran</h3>
                <p className="text-xs text-gray-500 capitalize">{order.payment_type.replace("_", " ")}</p>
              </>
            )}
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
              <td className="py-3 text-sm text-gray-900">Lisensi YouTube Clipper - {order.tier_label}</td>
              <td className="py-3 text-sm font-semibold text-gray-900 text-right">{rupiah(order.amount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-3 text-sm font-bold text-gray-900">Total</td>
              <td className="pt-3 text-sm font-bold text-gray-900 text-right">{rupiah(order.amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
