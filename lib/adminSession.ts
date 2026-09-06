const COOKIE_NAME = "ytc_admin_session";
// Sesi admin bersifat "sliding idle": diperpanjang otomatis selama admin aktif,
// dan berakhir setelah sekian lama tanpa aktivitas.
const IDLE_MAX_AGE_SECONDS = 4 * 60;
// Batas umur absolut cookie di browser — mengikuti window idle karena middleware
// selalu memperbarui cookie pada tiap request yang valid.
const MAX_AGE_SECONDS = IDLE_MAX_AGE_SECONDS;

// Cookie bertanda "secure" hanya dipakai di produksi/HTTPS; di localhost/LAN
// (http) atribut secure malah membuat cookie tak tersimpan sehingga sesi gagal.
export function isSecureCookieEnv(): boolean {
  return process.env.NODE_ENV === "production" || process.env.FORCE_SECURE_COOKIES === "true";
}

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET belum diset");
  return s;
}

async function hmac(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionCookieValue(): Promise<string> {
  const issuedAt = Date.now().toString();
  const sig = await hmac(issuedAt);
  return `${issuedAt}.${sig}`;
}

export async function isValidSessionCookieValue(value: string | undefined): Promise<boolean> {
  return (await getSessionCookieState(value)) === "ok";
}

export type SessionIssue =
  | { kind: "ok" }
  | { kind: "idle" }
  | { kind: "invalid"; reason: string };

export async function inspectSessionCookie(value: string | undefined): Promise<SessionIssue> {
  if (!value) return { kind: "invalid", reason: "cookie sesi tidak ditemukan" };
  const [issuedAt, sig] = value.split(".");
  if (!issuedAt || !sig) return { kind: "invalid", reason: "format cookie tidak valid" };
  const expectedSig = await hmac(issuedAt);
  if (sig !== expectedSig) return { kind: "invalid", reason: "tanda tangan tidak sama (potensi pemalsuan)" };
  const age = (Date.now() - Number(issuedAt)) / 1000;
  if (age < 0) return { kind: "invalid", reason: "usia cookie negatif (klien curang)" };
  return age <= IDLE_MAX_AGE_SECONDS ? { kind: "ok" } : { kind: "idle" };
}

/**
 * Kondisi cookie sesi admin:
 * - "ok"      : tanda tangan valid & belum melewati batas idle
 * - "idle"    : tanda tangan valid tapi sudah lewat batas idle (admin tidak aktif)
 * - "invalid" : tidak ada / rusak / tanda tangan salah (indikasi bypass)
 */
export async function getSessionCookieState(
  value: string | undefined
): Promise<"ok" | "idle" | "invalid"> {
  const issue = await inspectSessionCookie(value);
  return issue.kind === "invalid" ? "invalid" : issue.kind;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = MAX_AGE_SECONDS;

async function hmacForNamespace(message: string, ns: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(`${ns}:${secret()}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createGateCookieValue(): Promise<string> {
  const issuedAt = Date.now().toString();
  const sig = await hmacForNamespace(issuedAt, "gate");
  return `${issuedAt}.${sig}`;
}

export async function isValidGateCookieValue(value: string | undefined, maxAgeSeconds: number): Promise<boolean> {
  if (!value) return false;
  const [issuedAt, sig] = value.split(".");
  if (!issuedAt || !sig) return false;
  const expectedSig = await hmacForNamespace(issuedAt, "gate");
  if (sig !== expectedSig) return false;
  const age = (Date.now() - Number(issuedAt)) / 1000;
  return age >= 0 && age <= maxAgeSeconds;
}
