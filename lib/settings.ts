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
  qrisEnabled: boolean;
  qrisImageUrl: string;
  qrisInstructions: string;
  qrisPaymentNotice: string;
  updatedAt?: string;
};

const DEFAULT_TIERS: TierSetting[] = [
  { value: "permanent_720", label: "Basic", amount: 409200, originalAmount: 1320000, discountPercent: 69 },
  { value: "permanent_1080", label: "Special Offer", amount: 450000, originalAmount: 1500000, discountPercent: 70 },
];

const DEFAULT_ADDON_PRICES: Record<string, number> = {};

const DEFAULT_CASHBACK_TIERS: Record<string, number> = {
  permanent_720: 45000,
  permanent_1080: 50000,
};

const DEFAULT_QRIS_INSTRUCTIONS =
  "1. Buka aplikasi bank / e-wallet (GoPay, OVO, DANA, ShopeePay, dst).\n" +
  "2. Pilih menu Scan / Bayar QRIS.\n" +
  "3. Scan kode QR di atas.\n" +
  "4. Pastikan nominal sesuai, lalu masukkan PIN untuk menyelesaikan pembayaran.\n" +
  "5. Setelah transfer berhasil, klik tombol \"Saya sudah bayar\".";

const DEFAULT_QRIS_PAYMENT_NOTICE =
  "Harap isi jumlah pembayaran yang sesuai. Pastikan jumlah bayar sesuai — jika tidak sesuai, dana akan dikembalikan ke rekening pengirim sesuai jumlah yang ditransfer. Apabila ada potongan transfer bank, potongan tersebut ditanggung pelanggan.";

export const DEFAULT_SETTINGS: AppSettings = {
  promoEnabled: false,
  tiers: DEFAULT_TIERS,
  addonPrices: DEFAULT_ADDON_PRICES,
  cashbackTiers: DEFAULT_CASHBACK_TIERS,
  qrisEnabled: false,
  qrisImageUrl: "",
  qrisInstructions: DEFAULT_QRIS_INSTRUCTIONS,
  qrisPaymentNotice: DEFAULT_QRIS_PAYMENT_NOTICE,
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
      qrisEnabled: data.qris_enabled === true,
      qrisImageUrl: data.qris_image_url || "",
      qrisInstructions: data.qris_instructions || DEFAULT_QRIS_INSTRUCTIONS,
      qrisPaymentNotice: data.qris_payment_notice || DEFAULT_QRIS_PAYMENT_NOTICE,
      updatedAt: data.updated_at || undefined,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
