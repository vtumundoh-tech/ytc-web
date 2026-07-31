export type Tier = {
  value: string;
  label: string;
  amount: number;
  originalAmount: number;
};

// 4 base tiers — hanya 720p
export const TIERS: Tier[] = [
  { value: "daily_720", label: "1 Hari", amount: 5000, originalAmount: 10000 },
  { value: "weekly_720", label: "7 Hari", amount: 24850, originalAmount: 35000 },
  { value: "semi_monthly_720", label: "17 Hari", amount: 39050, originalAmount: 55000 },
  { value: "monthly_720", label: "30 Hari", amount: 48990, originalAmount: 69000 },
];

// Addon: baseValue → harga upgrade 1080p
export const ADDON_1080_PRICES: Record<string, number> = {
  daily_720: 3000,
  weekly_720: 12000,
  semi_monthly_720: 12000,
  monthly_720: 13000,
};

export const CASHBACK_TIERS: Tier[] = [
  { value: "daily_720", label: "1 Hari", amount: 0, originalAmount: 0 },
  { value: "weekly_720", label: "7 Hari", amount: 6000, originalAmount: 0 },
  { value: "semi_monthly_720", label: "17 Hari", amount: 3000, originalAmount: 0 },
  { value: "monthly_720", label: "30 Hari", amount: 9000, originalAmount: 0 },
];

export function findTier(value: string): Tier | undefined {
  return TIERS.find((t) => t.value === value);
}

export function findCashback(value: string): number {
  const found = CASHBACK_TIERS.find((t) => t.value === value);
  return found ? found.amount : 0;
}

export function getAddonPrice(baseValue: string): number {
  return ADDON_1080_PRICES[baseValue] || 0;
}

export function getTotalPrice(baseValue: string, addon1080: boolean): number {
  const tier = findTier(baseValue);
  if (!tier) return 0;
  return tier.amount + (addon1080 ? getAddonPrice(baseValue) : 0);
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function formatPrice(n: number): string {
  const k = Math.round((n / 1000) * 10) / 10;
  return String(k).replace(".", ",") + "k";
}

export function discountPercent(tier: Tier): number {
  if (tier.originalAmount <= tier.amount) return 0;
  return Math.round((1 - tier.amount / tier.originalAmount) * 100);
}
