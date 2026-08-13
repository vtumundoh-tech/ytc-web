import { NextRequest, NextResponse } from "next/server";
import { handleTelegramCommand, sendTelegramMessage } from "@/lib/telegram";
import { safeEqual } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret) {
      const header = req.headers.get("x-telegram-bot-api-secret-token") || "";
      if (!header || !(await safeEqual(header, secret))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const update = await req.json();
    const msg = update?.message || update?.edited_message;
    if (!msg?.text || !msg.chat) {
      return NextResponse.json({ ok: true });
    }

    const chatId = msg.chat.id;
    const text = String(msg.text);

    const reply = await handleTelegramCommand(text, chatId);
    if (reply !== null) {
      await sendTelegramMessage(reply);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("telegram webhook error:", err?.message || err);
    return NextResponse.json({ ok: true });
  }
}