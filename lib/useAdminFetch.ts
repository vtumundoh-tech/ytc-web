"use client";

import { useRouter } from "next/navigation";

/**
 * fetch khusus area admin: bila sesi tidak valid (HTTP 401), langsung arahkan
 * ke halaman login sehingga tidak ada UI yang tertinggal "kosong / Unauthorized".
 */
export function useAdminFetch() {
  const router = useRouter();
  return async function adminFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
    const res = await fetch(input, init);
    if (res.status === 401) {
      router.replace("/admin/login?reason=expired");
    }
    return res;
  };
}