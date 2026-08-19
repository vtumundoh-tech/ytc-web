export type CountryItem = { code: string; dial: string; label: string; flag: string };

export const COUNTRY_CODES: CountryItem[] = [
  { code: "ID", dial: "62", label: "Indonesia", flag: "🇮🇩" },
  { code: "MY", dial: "60", label: "Malaysia", flag: "🇲🇾" },
  { code: "SG", dial: "65", label: "Singapura", flag: "🇸🇬" },
  { code: "PH", dial: "63", label: "Filipina", flag: "🇵🇭" },
  { code: "TH", dial: "66", label: "Thailand", flag: "🇹🇭" },
  { code: "VN", dial: "84", label: "Vietnam", flag: "🇻🇳" },
  { code: "CN", dial: "86", label: "Tiongkok", flag: "🇨🇳" },
  { code: "JP", dial: "81", label: "Jepang", flag: "🇯🇵" },
  { code: "KR", dial: "82", label: "Korea Selatan", flag: "🇰🇷" },
  { code: "IN", dial: "91", label: "India", flag: "🇮🇳" },
  { code: "AU", dial: "61", label: "Australia", flag: "🇦🇺" },
  { code: "US", dial: "1", label: "Amerika Serikat", flag: "🇺🇸" },
  { code: "CA", dial: "1", label: "Kanada", flag: "🇨🇦" },
  { code: "GB", dial: "44", label: "Inggris", flag: "🇬🇧" },
  { code: "DE", dial: "49", label: "Jerman", flag: "🇩🇪" },
  { code: "FR", dial: "33", label: "Prancis", flag: "🇫🇷" },
  { code: "NL", dial: "31", label: "Belanda", flag: "🇳🇱" },
  { code: "IT", dial: "39", label: "Italia", flag: "🇮🇹" },
  { code: "ES", dial: "34", label: "Spanyol", flag: "🇪🇸" },
  { code: "BR", dial: "55", label: "Brasil", flag: "🇧🇷" },
  { code: "MX", dial: "52", label: "Meksiko", flag: "🇲🇽" },
  { code: "AE", dial: "971", label: "Uni Emirat Arab", flag: "🇦🇪" },
  { code: "SA", dial: "966", label: "Arab Saudi", flag: "🇸🇦" },
  { code: "TW", dial: "886", label: "Taiwan", flag: "🇹🇼" },
];

export const OTHER_COUNTRY_VALUE = "__other__";

export function normalizeWhatsapp(countryDial: string, localNumber: string): string {
  const dial = String(countryDial || "62").replace(/\D/g, "");
  let local = String(localNumber || "").replace(/[^\d]/g, "");
  if (local.startsWith("0")) local = local.slice(1);
  return (dial + local).replace(/\D/g, "");
}

export function waLink(number: string): string {
  const digits = String(number || "").replace(/[^\d]/g, "");
  if (!digits) return "https://wa.me";
  return `https://wa.me/${digits}`;
}

export function formatWaDisplay(number: string): string {
  const n = String(number || "").replace(/[^\d]/g, "");
  if (!n) return "";
  return `+${n}`;
}