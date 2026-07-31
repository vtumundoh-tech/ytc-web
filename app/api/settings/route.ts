import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(
    {
      ...settings,
      meta: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
