"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogIn, User } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
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
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        let msg = "Username atau password salah.";
        try {
          const data = await res.json();
          if (data && typeof data.error === "string" && data.error.trim()) msg = data.error;
        } catch {
          /* biarkan pesan default bila body bukan JSON */
        }
        throw new Error(msg);
      }
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
          <p className="text-xs text-gray-500 mt-1">Masukkan username & password untuk mengakses dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoComplete="username"
                className="input-field pl-10"
                placeholder="Masukkan username admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className="input-field"
              placeholder="Masukkan password admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black shadow-md"
          >
            {loading ? "..." : <><LogIn className="w-4 h-4" /> Masuk</>}
          </button>
        </form>
      </div>
    </div>
  );
}
