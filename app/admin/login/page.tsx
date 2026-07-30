"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogIn, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Password salah.");
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-24">
      <div className="card-lg animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Login Admin</h1>
          <p className="text-xs text-gray-500 mt-1">Masukkan password untuk mengakses dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Masukkan password admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black shadow-md"
          >
            {loading ? "..." : <><LogIn className="w-4 h-4" /> Masuk</>}
          </button>
        </form>
      </div>
    </div>
  );
}
