export type Tier = {
  value: string;
  label: string;
  amount: number;
  originalAmount: number;
};

// 2 paket permanen (beli-utuh) — tanpa sewa & tanpa addon
export const TIERS: Tier[] = [
  { value: "permanent_720", label: "Basic", amount: 409200, originalAmount: 1320000 },
  { value: "permanent_1080", label: "Special Offer", amount: 450000, originalAmount: 1500000 },
];

export const CASHBACK_TIERS: Tier[] = [
  { value: "permanent_720", label: "Basic", amount: 45000, originalAmount: 0 },
  { value: "permanent_1080", label: "Special Offer", amount: 50000, originalAmount: 0 },
];

export function findTier(value: string): Tier | undefined {
  return TIERS.find((t) => t.value === value);
}

export function findCashback(value: string): number {
  const found = CASHBACK_TIERS.find((t) => t.value === value);
  return found ? found.amount : 0;
}

export function getTotalPrice(baseValue: string, _addon1080 = false): number {
  const tier = findTier(baseValue);
  if (!tier) return 0;
  return tier.amount;
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function formatPrice(n: number): string {
  return Math.round(n / 1000) + "k";
}

export function discountPercent(tier: Tier): number {
  if (tier.originalAmount <= tier.amount) return 0;
  return Math.round((1 - tier.amount / tier.originalAmount) * 100);
}
