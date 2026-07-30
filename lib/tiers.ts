export type Tier = {
  value: string;
  label: string;
  amount: number;
  originalAmount: number;
};

export const TIERS: Tier[] = [
  { value: "daily_720", label: "1 Hari (720p)", amount: 5000, originalAmount: 10000 },
  { value: "daily_1080", label: "1 Hari (1080p)", amount: 8000, originalAmount: 15000 },
  { value: "weekly_720", label: "7 Hari (720p)", amount: 25000, originalAmount: 35000 },
  { value: "weekly_1080", label: "7 Hari (1080p)", amount: 37000, originalAmount: 55000 },
  { value: "semi_monthly_720", label: "17 Hari (720p)", amount: 39000, originalAmount: 55000 },
  { value: "semi_monthly_1080", label: "17 Hari (1080p)", amount: 51000, originalAmount: 75000 },
  { value: "monthly_720", label: "30 Hari (720p)", amount: 49000, originalAmount: 69000 },
  { value: "monthly_1080", label: "30 Hari (1080p)", amount: 62000, originalAmount: 85000 },
];

export const CASHBACK_TIERS: Tier[] = [
  { value: "daily_720", label: "1 Hari (720p) — Rp 5.000", amount: 0, originalAmount: 0 },
  { value: "weekly_720", label: "7 Hari (720p) — Rp 25.000", amount: 6000, originalAmount: 0 },
  { value: "semi_monthly_720", label: "17 Hari (720p) — Rp 39.000", amount: 3000, originalAmount: 0 },
  { value: "monthly_720", label: "30 Hari (720p) — Rp 49.000", amount: 9000, originalAmount: 0 },
];

export const ADDON_1080: Tier[] = [
  { value: "no", label: "Tidak", amount: 0, originalAmount: 0 },
  { value: "daily_1080", label: "1 Hari +1080p", amount: 8000, originalAmount: 0 },
  { value: "monthly_1080", label: "30 Hari +1080p", amount: 37000, originalAmount: 0 },
];

export function findTier(value: string): Tier | undefined {
  return TIERS.find((t) => t.value === value);
}

export function findCashback(value: string): number {
  const found = CASHBACK_TIERS.find((t) => t.value === value);
  return found ? found.amount : 0;
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function discountPercent(tier: Tier): number {
  if (tier.originalAmount <= tier.amount) return 0;
  return Math.round((1 - tier.amount / tier.originalAmount) * 100);
}
