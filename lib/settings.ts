import { supabaseServer } from "@/lib/supabaseServer";

export type TierSetting = {
  value: string;
  label: string;
  amount: number;
  originalAmount: number;
  discountPercent: number;
};

export type AppSettings = {
  promoEnabled: boolean;
  tiers: TierSetting[];
  addonPrices: Record<string, number>;
  cashbackTiers: Record<string, number>;
  updatedAt?: string;
};

const DEFAULT_TIERS: TierSetting[] = [
  { value: "daily_720", label: "1 Hari", amount: 5000, originalAmount: 10000, discountPercent: 50 },
  { value: "weekly_720", label: "7 Hari", amount: 24850, originalAmount: 35000, discountPercent: 29 },
  { value: "semi_monthly_720", label: "17 Hari", amount: 39050, originalAmount: 55000, discountPercent: 29 },
  { value: "monthly_720", label: "30 Hari", amount: 48990, originalAmount: 69000, discountPercent: 29 },
];

const DEFAULT_ADDON_PRICES: Record<string, number> = {
  daily_720: 3000,
  weekly_720: 12000,
  semi_monthly_720: 12000,
  monthly_720: 13000,
};

const DEFAULT_CASHBACK_TIERS: Record<string, number> = {
  daily_720: 0,
  weekly_720: 6000,
  semi_monthly_720: 3000,
  monthly_720: 9000,
};

export const DEFAULT_SETTINGS: AppSettings = {
  promoEnabled: false,
  tiers: DEFAULT_TIERS,
  addonPrices: DEFAULT_ADDON_PRICES,
  cashbackTiers: DEFAULT_CASHBACK_TIERS,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) return DEFAULT_SETTINGS;

    return {
      promoEnabled: data.promo_enabled === true,
      tiers: (data.tiers as TierSetting[]) || DEFAULT_TIERS,
      addonPrices: (data.addon_prices as Record<string, number>) || DEFAULT_ADDON_PRICES,
      cashbackTiers: (data.cashback_tiers as Record<string, number>) || DEFAULT_CASHBACK_TIERS,
      updatedAt: data.updated_at || undefined,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
