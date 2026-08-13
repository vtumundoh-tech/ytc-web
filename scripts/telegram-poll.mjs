// Telegram long-polling forwarder untuk testing lokal / VPS (tanpa URL publik).
//
// Cara pakai:
//   1. Jalankan server web: npm run dev  (atau npm run start)
//   2. Jalankan script ini: node scripts/telegram-poll.mjs
//   3. Kirim /listcb atau /listo ke bot Anda.
//
// Script membaca TELEGRAM_BOT_TOKEN dari .env.local dan meneruskan setiap
// update Telegram ke route /api/telegram/webhook pada server yang berjalan.
// Untuk produksi dengan URL publik, cukup atur webhook sekali:
//   https://api.telegram.org/bot<TOKEN>/setWebhook?url=<PUBLIC_URL>/api/telegram/webhook

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function loadEnv() {
  const env = { ...process.env };
  const envFile = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envFile)) return env;
  const lines = fs.readFileSync(envFile, "utf8").split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    let key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (env[key] === undefined) env[key] = value;
  }
  return env;
}

const env = loadEnv();
const token = env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN tidak ditemukan di .env.local. Berhenti.");
  process.exit(1);
}

const baseUrl = (
  env.WEBHOOK_BASE_URL ||
  env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");
const webhookUrl = `${baseUrl}/api/telegram/webhook`;
const BOT_API = "https://api.telegram.org";
const POLL_INTERVAL_MS = 2000;

let offset = 0;

async function getUpdates() {
  const res = await fetch(`${BOT_API}/bot${token}/getUpdates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offset, timeout: 30 }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`getUpdates ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram error: ${JSON.stringify(data.description || data)}`);
  return data.result || [];
}

async function forward(update) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (env.TELEGRAM_WEBHOOK_SECRET) {
      headers["X-Telegram-Bot-Api-Secret-Token"] = env.TELEGRAM_WEBHOOK_SECRET;
    }
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(update),
    });
    if (!res.ok) {
      console.warn(`[poll] forward ${update.update_id} gagal: ${res.status}`);
    }
  } catch (err) {
    console.warn(`[poll] forward ${update.update_id} error:`, err.message || err);
  }
}

async function tick() {
  let updates = [];
  try {
    updates = await getUpdates();
  } catch (err) {
    console.error("[poll]", err.message || err);
    return;
  }

  for (const u of updates) {
    offset = Math.max(offset, u.update_id + 1);
    await forward(u);
  }
}

console.log(`[poll] Menjalankan long-poll Telegram → ${webhookUrl}`);
console.log(`[poll] Kirim /help, /listcb, atau /listo ke bot Anda. (Ctrl+C untuk berhenti)`);

const run = async () => {
  await tick();
  setTimeout(run, POLL_INTERVAL_MS);
};
run();
