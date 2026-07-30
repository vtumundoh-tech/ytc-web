export type Tier = {
  value: string;
  label: string;
  amount: number;
};

// Sumber kebenaran tunggal untuk daftar paket & harga.
// Ubah di sini saja kalau harga berubah — otomatis konsisten di form & checkout.
export const TIERS: Tier[] = [
  { value: "daily_720", label: "1 Hari (720p)", amount: 5000 },
  { value: "daily_1080", label: "1 Hari (1080p)", amount: 8000 },
  { value: "weekly_720", label: "7 Hari (720p)", amount: 25000 },
  { value: "weekly_1080", label: "7 Hari (1080p)", amount: 37000 },
  { value: "semi_monthly_720", label: "17 Hari (720p)", amount: 39000 },
  { value: "semi_monthly_1080", label: "17 Hari (1080p)", amount: 51000 },
  { value: "monthly_720", label: "30 Hari (720p)", amount: 49000 },
  { value: "monthly_1080", label: "30 Hari (1080p)", amount: 62000 },
];

// Tier dasar (720p) yang bisa diklaim cashback + besaran cashback-nya.
export const CASHBACK_TIERS: Tier[] = [
  { value: "daily_720", label: "1 Hari (720p) — Rp 5.000", amount: 0 },
  { value: "weekly_720", label: "7 Hari (720p) — Rp 25.000", amount: 6000 },
  { value: "semi_monthly_720", label: "17 Hari (720p) — Rp 39.000", amount: 3000 },
  { value: "monthly_720", label: "30 Hari (720p) — Rp 49.000", amount: 9000 },
];

export const ADDON_1080: Tier[] = [
  { value: "no", label: "Tidak", amount: 0 },
  { value: "daily_1080", label: "1 Hari +1080p", amount: 8000 },
  { value: "monthly_1080", label: "30 Hari +1080p", amount: 37000 },
];

export function findTier(value: string): Tier | undefined {
  return TIERS.find((t) => t.value === value);
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}
