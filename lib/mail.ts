import nodemailer from "nodemailer";

export type OrderMailData = {
  full_name: string;
  email: string | null;
  tier_label: string;
  amount: number;
  midtrans_order_id: string;
  paid_at?: string | null;
  downloadToken?: string | null;
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function getTransporter(): nodemailer.Transporter {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: user && pass ? { user, pass } : undefined,
  });
}

function mailEnabled(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);
}

function downloadLinkFor(token?: string | null): string {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (token && /^https?:\/\//.test(appUrl)) {
    return `${appUrl}/unduh?token=${encodeURIComponent(token)}`;
  }
  const fallback = process.env.APP_DOWNLOAD_URL || "";
  return /^https?:\/\//.test(fallback) ? fallback : "";
}

export async function sendInvoiceEmail(order: OrderMailData): Promise<boolean> {
  if (!mailEnabled()) {
    console.warn("[mail] SMTP belum dikonfigurasi, invoice email dilewati.");
    return false;
  }
  const to = order.email?.trim();
  if (!to) return false;

  const downloadUrl = downloadLinkFor(order.downloadToken);
  const dateStr = order.paid_at
    ? new Date(order.paid_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });

  const downloadBlock = downloadUrl
    ? `<a class="btn" href="${downloadUrl}">Download Aplikasi</a>
      <p class="muted" style="margin-top:8px;">Link unduh bersifat sementara (terkunci ke pesanan Anda).</p>`
    : `<p class="muted">Link download aplikasi akan dikirimkan melalui email/WhatsApp oleh admin.</p>`;

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: Arial, Helvetica, sans-serif; background: #f1f5f9; margin: 0; padding: 24px; color: #0f172a; }
  .sheet { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
  .head { background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 24px 32px; }
  .head h1 { margin: 0; font-size: 20px; }
  .head p { margin: 4px 0 0; font-size: 12px; opacity: .9; }
  .body { padding: 32px; }
  .muted { color: #64748b; font-size: 12px; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
  .total { font-weight: 700; }
  .btn { display: inline-block; margin-top: 20px; padding: 13px 24px; background: #0ea5e9; color: #fff !important; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; }
  .note { margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 10px; font-size: 12px; color: #475569; }
  .foot { margin-top: 24px; font-size: 11px; color: #94a3b8; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="head">
      <h1>Invoice — YouTube Clipper</h1>
      <p>MineClip Studio</p>
    </div>
    <div class="body">
      <p>Halo <strong>${order.full_name}</strong>,</p>
      <p class="muted">Terima kasih atas pembelian Anda. Berikut invoice dan tautan unduh aplikasi.</p>

      <div class="row"><span>Order ID</span><span>${order.midtrans_order_id}</span></div>
      <div class="row"><span>Tanggal</span><span>${dateStr}</span></div>
      <div class="row"><span>Item</span><span>Lisensi YouTube Clipper - ${order.tier_label}</span></div>
      <div class="row total"><span>Total</span><span>${rupiah(order.amount)}</span></div>

      ${downloadBlock}

      <div class="note">
        <strong>Langkah selanjutnya:</strong>
        <ol style="margin:8px 0 0; padding-left:18px;">
          <li>Unduh installer pada tombol di atas.</li>
          <li>Jalankan install (Run as Administrator), lalu salin <strong>Machine ID</strong> dari halaman aktivasi.</li>
          <li>Kirim Machine ID ke Admin via WhatsApp/email untuk menerima <strong>key aktivasi</strong>.</li>
        </ol>
        <p style="margin-top:8px;">Jika ada kendala, balas email ini atau hubungi admin WhatsApp.</p>
      </div>

      <p class="foot">MineClip Studio &middot; YouTube Clipper<br>Email: mineclipstudios@gmail.com</p>
    </div>
  </div>
</body>
</html>`;

  const downloadLine = downloadUrl ? `\nDownload aplikasi: ${downloadUrl}` : "\nLink unduh aplikasi akan dikirim oleh admin via WhatsApp/email.";

  const text = `Halo ${order.full_name},

Terima kasih atas pembelian Anda. Berikut invoice pembelian:
Order ID : ${order.midtrans_order_id}
Tanggal  : ${dateStr}
Item      : Lisensi YouTube Clipper - ${order.tier_label}
Total     : ${rupiah(order.amount)}

${downloadLine}

Setelah install, salin Machine ID dari halaman aktivasi dan kirim ke admin via WhatsApp/email untuk menerima key aktivasi.

MineClip Studio - YouTube Clipper`;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: `Invoice Pembelian - ${order.midtrans_order_id}`,
      text,
      html,
    });
    return true;
  } catch (err: any) {
    console.error("[mail] invoice gagal dikirim:", err?.code || "", err?.response || err?.message || err);
    return false;
  }
}

export async function sendCashbackConfirmationEmail(data: { full_name: string; email: string | null }): Promise<boolean> {
  if (!mailEnabled()) {
    console.warn("[mail] SMTP belum dikonfigurasi, email cashback dilewati.");
    return false;
  }
  const to = data.email?.trim();
  if (!to) return false;

  const html = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;padding:24px 32px;">
      <h1 style="margin:0;font-size:18px;">Permohonan Cashback Diterima</h1>
      <p style="margin:4px 0 0;font-size:12px;opacity:.9;">MineClip Studio</p>
    </div>
    <div style="padding:32px;">
      <p>Halo <strong>${data.full_name}</strong>,</p>
      <p style="font-size:14px;color:#475569;">Kami telah menerima permohonan klaim cashback Anda. Mohon menunggu <strong>tinjauan admin</strong> (maksimal 1x24 jam).</p>
      <p style="font-size:14px;color:#475569;">Hasil verifikasi akan diinformasikan melalui <strong>email / WhatsApp</strong> bila disetujui.</p>
      <p style="margin-top:24px;font-size:12px;color:#64748b;">MineClip Studio - YouTube Clipper</p>
    </div>
  </div>
</body>
</html>`;

  const text = `Halo ${data.full_name},

Kami telah menerima permohonan klaim cashback Anda. Mohon menunggu tinjauan admin (maksimal 1x24 jam).
Hasil verifikasi akan diinformasikan melalui email / WhatsApp bila disetujui.

MineClip Studio - YouTube Clipper`;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: "Konfirmasi Pengajuan Cashback",
      text,
      html,
    });
    return true;
  } catch (err: any) {
    console.error("[email] cashback confirmation error:", err?.code || "", err?.response || err?.message || err);
    return false;
  }
}