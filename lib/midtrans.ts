const SNAP_BASE = "https://app.sandbox.midtrans.com/snap/v1";
const SNAP_BASE_PROD = "https://app.midtrans.com/snap/v1";

function isProd() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

function authHeader() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY belum diset");
  const encoded = Buffer.from(`${serverKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

export async function createSnapTransaction(params: {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  itemName: string;
}) {
  const base = isProd() ? SNAP_BASE_PROD : SNAP_BASE;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const res = await fetch(`${base}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      credit_card: { secure: true },
      customer_details: {
        first_name: params.customerName,
        phone: params.customerPhone,
        email: params.customerEmail || undefined,
      },
      item_details: [
        {
          id: params.orderId,
          price: params.amount,
          quantity: 1,
          name: params.itemName.slice(0, 50),
        },
      ],
      callbacks: {
        finish: `${appUrl}/success?order_id=${params.orderId}`,
      },
      enabled_payments: [
        "qris",
        "gopay",
        "shopeepay",
        "bca_va",
        "bni_va",
        "bri_va",
        "permata_va",
        "other_va",
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Midtrans error (${res.status}): ${text}`);
  }

  return res.json() as Promise<{ token: string; redirect_url: string }>;
}

export async function verifyNotificationSignature(body: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}) {
  const crypto = await import("crypto");
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY belum diset");
  const raw = `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");
  return expected === body.signature_key;
}
