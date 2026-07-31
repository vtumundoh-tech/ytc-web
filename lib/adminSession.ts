const COOKIE_NAME = "ytc_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

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
  if (!value) return false;
  const [issuedAt, sig] = value.split(".");
  if (!issuedAt || !sig) return false;
  const expectedSig = await hmac(issuedAt);
  if (sig !== expectedSig) return false;
  const age = (Date.now() - Number(issuedAt)) / 1000;
  return age >= 0 && age <= MAX_AGE_SECONDS;
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
