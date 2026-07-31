"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function GateClient() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin/login");
        router.refresh();
      } else {
        router.push("/");
      }
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-white bg-gray-900 px-2.5 py-1 rounded-lg shadow-md">
          &larr; Admin di sini
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="."
          className="inline-block w-4 h-4 rounded-full bg-black ring-2 ring-white shadow-md hover:scale-110 transition-all duration-200 cursor-pointer"
        />
      </div>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="card-lg w-full max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Verifikasi Akses</h2>
              <p className="text-xs text-gray-500 mt-1">Masukkan kode akses untuk melanjutkan</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                className="input-field"
                placeholder="Kode akses"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 animate-fade-in">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !password}
                className="btn-primary w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black shadow-md flex items-center justify-center gap-2"
              >
                {loading ? "..." : "Lanjutkan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
