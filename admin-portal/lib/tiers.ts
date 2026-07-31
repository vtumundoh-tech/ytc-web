export type Tier = {
  value: string;
  label: string;
  amount: number;
  originalAmount: number;
};

export const TIERS: Tier[] = [
  { value: "daily_720", label: "1 Hari", amount: 5000, originalAmount: 10000 },
  { value: "weekly_720", label: "7 Hari", amount: 24850, originalAmount: 35000 },
  { value: "semi_monthly_720", label: "17 Hari", amount: 39050, originalAmount: 55000 },
  { value: "monthly_720", label: "30 Hari", amount: 48990, originalAmount: 69000 },
];

export const ADDON_1080_PRICES: Record<string, number> = {
  daily_720: 3000,
  weekly_720: 12000,
  semi_monthly_720: 12000,
  monthly_720: 13000,
};

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}
