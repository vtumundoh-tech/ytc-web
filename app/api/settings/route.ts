import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rl = await checkRateLimit(rateLimitKey("settings", getClientIp(req)), 120, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }

  const settings = await getSettings();
  return NextResponse.json(settings, {
    headers: { "Cache-Control": "no-store" },
  });
}
