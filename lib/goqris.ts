const API_BASE = "https://api.goqris.web.id";

function getApiKey() {
  const key = process.env.GOQRIS_API_KEY;
  if (!key) throw new Error("GOQRIS_API_KEY belum diset");
  return key;
}

export type GoQRISOrderParams = {
  refId: string;
  amount: number;
  customerName?: string;
  expired?: number;
};

export type GoQRISOrderResult = {
  trx_id: string;
  ref_id: string;
  amount: number;
  unique_code: number;
  total_amount: number;
  payment_type: string;
  payment_status: string;
  expires_at: string;
  payment_detail: {
    qr_string: string;
    qr_image: string;
  };
};

export async function createGoQRISOrder(
  params: GoQRISOrderParams,
  projectName: string
): Promise<GoQRISOrderResult> {
  const res = await fetch(`${API_BASE}/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: getApiKey(),
      nama_project: projectName,
      ref_id: params.refId,
      amount: params.amount,
      customer_name: params.customerName || undefined,
      expired: params.expired || 15,
    }),
  });

  const json = await res.json();
  if (!res.ok || json.status !== "success") {
    throw new Error(json.message || `GoQRIS error (${res.status})`);
  }

  return json.data as GoQRISOrderResult;
}

export type GoQRISStatusResult = {
  trx_id: string;
  ref_id: string;
  amount: number;
  total_amount: number;
  payment_status: "pending" | "paid";
  paid_at?: string;
};

export async function checkGoQRISStatus(
  refId: string
): Promise<GoQRISStatusResult> {
  const res = await fetch(`${API_BASE}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: getApiKey(),
      ref_id: refId,
    }),
  });

  const json = await res.json();
  if (!res.ok || json.status !== "success") {
    throw new Error(json.message || `GoQRIS status error (${res.status})`);
  }

  return json.data as GoQRISStatusResult;
}
