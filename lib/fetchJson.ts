export type SafeJson<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

export function uploadErrorForStatus(status: number, fallback: string): string {
  if (status === 413) return "Ukuran file terlalu besar untuk server (maks 5MB). Coba perkecil gambarnya.";
  if (status === 429) return "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.";
  if (status >= 500) return "Server sedang bermasalah. Coba lagi beberapa saat.";
  return fallback;
}

export async function parseJsonSafe<T>(res: Response): Promise<SafeJson<T>> {
  if (!res.ok && res.status === 413) {
    return { ok: false, status: 413, error: uploadErrorForStatus(413, "") };
  }
  try {
    const data = await res.json();
    if (res.ok) return { ok: true, data: data as T };
    const msg = data && (typeof data.error === "string" ? data.error : typeof data.message === "string" ? data.message : "");
    return {
      ok: false,
      status: res.status,
      error: msg || uploadErrorForStatus(res.status, "Gagal memproses. Coba lagi."),
    };
  } catch {
    return { ok: false, status: res.status, error: uploadErrorForStatus(res.status, "Gagal memproses. Coba lagi.") };
  }
}

export function isHeicFile(file: File): boolean {
  const t = (file.type || "").toLowerCase();
  return t === "image/heic" || t === "image/heif" || /\.(heic|heif)$/i.test(file.name || "");
}

export const HEIC_ERROR = "Foto dari iPhone/iPad (HEIC) belum didukung. Ubah dulu ke JPEG/PNG, lalu coba lagi.";