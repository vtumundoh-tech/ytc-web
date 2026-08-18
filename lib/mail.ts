import nodemailer from "nodemailer";

export type OrderMailData = {
  full_name: string;
  email: string | null;
  tier_label: string;
  amount: number;
  midtrans_order_id: string;
  paid_at?: string | null;
  downloadToken?: string | null;
  cashbackCode?: string | null;
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

  const cashbackBlock = order.cashbackCode
    ? `<div class="note" style="background:#fffbeb;border:1px solid #fde68a;">
        <strong style="color:#92400e;">🎁 Paket ini eligible cashback!</strong>
        <p style="margin:8px 0 4px;color:#78350f;">Gunakan kode unik berikut saat klaim cashback:</p>
        <div style="background:#111827;color:#fff;font-family:monospace;font-size:20px;letter-spacing:2px;text-align:center;padding:12px;border-radius:8px;margin:8px 0;">${order.cashbackCode}</div>
        <p class="muted" style="color:#92400e;">Demi keamanan, kode ini hanya dibuat sekali dan tidak akan dikirim ulang. Harap simpan baik-baik.</p>
      </div>`
    : "";

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

      ${cashbackBlock}

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

${order.cashbackCode ? `KODE CASHBACK (simpan baik-baik, hanya dibuat sekali): ${order.cashbackCode}\n` : ""}
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

export async function sendOrderRejectedEmail(data: {
  full_name: string;
  email: string | null;
  midtrans_order_id: string;
  tier_label: string;
  amount: number;
  reason: string;
  insufficient?: boolean;
  statusPageLink?: string | null;
}): Promise<boolean> {
  if (!mailEnabled()) {
    console.warn("[mail] SMTP belum dikonfigurasi, email penolakan dilewati.");
    return false;
  }
  const to = data.email?.trim();
  if (!to) return false;

  const reason = data.reason || "Pesanan Anda tidak sesuai dengan ketentuan yang berlaku.";
  const statusLink = data.statusPageLink
    ? `<a class="btn" href="${data.statusPageLink}">Lihat Status & Pilih Aksi</a>`
    : "";
  const insufficientNote = data.insufficient
    ? `<p style="margin-top:12px;">Anda dapat memilih salah satu dari dua opsi berikut di halaman status pesanan:</p>
       <ol style="margin:6px 0 0 18px;padding:0;">
         <li><strong>Ajukan Refund</strong> — dana dikembalikan paling lambat 1x24 jam ke rekening pengirim sesuai jumlah yang ditransfer (potongan biaya transfer bank menjadi tanggungan pelanggan).</li>
         <li><strong>Bayar Kekurangan</strong> — lengkapi nominal yang kurang, lalu pesanan akan langsung diproses.</li>
       </ol>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: Arial, Helvetica, sans-serif; background: #f1f5f9; margin: 0; padding: 24px; color: #0f172a; }
  .sheet { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
  .head { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; padding: 24px 32px; }
  .head h1 { margin: 0; font-size: 20px; }
  .head p { margin: 4px 0 0; font-size: 12px; opacity: .9; }
  .body { padding: 32px; }
  .muted { color: #64748b; font-size: 12px; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
  .total { font-weight: 700; }
  .reason { margin-top: 20px; padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; font-size: 14px; color: #991b1b; }
  .btn { display: inline-block; margin-top: 20px; padding: 13px 24px; background: #0ea5e9; color: #fff !important; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; }
  .note { margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 10px; font-size: 12px; color: #475569; }
  .foot { margin-top: 24px; font-size: 11px; color: #94a3b8; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="head">
      <h1>Pesanan Tidak Sesuai Ketentuan</h1>
      <p>MineClip Studio</p>
    </div>
    <div class="body">
      <p>Halo <strong>${data.full_name}</strong>,</p>
      <p class="muted">Kami mohon maaf, pesanan Anda tidak dapat kami proses dengan alasan berikut.</p>

      <div class="reason">${reason}</div>

      ${data.insufficient ? `<p class="muted" style="margin-top:14px;">Jumlah pembayaran yang kami terima tidak sesuai dengan nominal yang diminta.</p>${insufficientNote}${statusLink}` : ""}

      <div class="note">
        <strong>Refund:</strong> Dana yang telah Anda bayarkan akan dikembalikan paling lambat <strong>1x24 jam</strong>
        ke rekening pengirim yang melakukan transfer, sesuai jumlah dana yang ditransfer (potongan biaya transfer bank
        menjadi tanggungan pelanggan). Mohon menunggu dan pantau email Anda.
      </div>

      <div class="row" style="margin-top:20px;"><span>Order ID</span><span>${data.midtrans_order_id}</span></div>
      <div class="row"><span>Item</span><span>Lisensi YouTube Clipper - ${data.tier_label}</span></div>
      <div class="row total"><span>Total</span><span>${rupiah(data.amount)}</span></div>

      <p class="foot">MineClip Studio &middot; YouTube Clipper<br>Email: mineclipstudios@gmail.com</p>
    </div>
  </div>
</body>
</html>`;

  const choiceLine = data.insufficient
    ? `\nAnda dapat memilih "Ajukan Refund" atau "Bayar Kekurangan" di halaman status pesanan${data.statusPageLink ? `: ${data.statusPageLink}` : ""}.`
    : "";

  const text = `Halo ${data.full_name},

Kami mohon maaf, pesanan Anda tidak dapat kami proses dengan alasan:
${reason}
${choiceLine}

Refund: dana yang telah Anda bayarkan akan dikembalikan paling lambat 1x24 jam ke rekening pengirim sesuai jumlah yang ditransfer (potongan biaya transfer bank menjadi tanggungan pelanggan). Mohon menunggu.

Order ID : ${data.midtrans_order_id}
Item      : Lisensi YouTube Clipper - ${data.tier_label}
Total     : ${rupiah(data.amount)}

MineClip Studio - YouTube Clipper`;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: `Pesanan Tidak Sesuai Ketentuan - ${data.midtrans_order_id}`,
      text,
      html,
    });
    return true;
  } catch (err: any) {
    console.error("[email] order rejected error:", err?.code || "", err?.response || err?.message || err);
    return false;
  }
}

export async function sendRefundSentEmail(data: {
  full_name: string;
  email: string | null;
  tier_label: string;
  amount: number;
  adminNotes: string;
  attachment: { filename: string; content: Buffer; contentType: string };
}): Promise<boolean> {
  if (!mailEnabled()) {
    console.warn("[mail] SMTP belum dikonfigurasi, email refund dilewati.");
    return false;
  }
  const to = data.email?.trim();
  if (!to) return false;

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
  .note { margin-top: 24px; padding: 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; font-size: 12px; color: #065f46; }
  .foot { margin-top: 24px; font-size: 11px; color: #94a3b8; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="head">
      <h1>Refund Telah Dikirim</h1>
      <p>MineClip Studio</p>
    </div>
    <div class="body">
      <p>Halo <strong>${data.full_name}</strong>,</p>
      <p class="muted">Terima kasih sudah bersabar. Dana refund untuk pembayaran Anda telah kami kirim.</p>

      <div class="row" style="margin-top:14px;"><span>Item</span><span>Lisensi YouTube Clipper - ${data.tier_label}</span></div>
      <div class="row total"><span>Nominal Refund</span><span>${rupiah(data.amount)}</span></div>

      ${data.adminNotes ? `<div class="note" style="margin-top:14px;"><strong>Catatan admin:</strong> ${data.adminNotes}</div>` : ""}

      <div class="note">
        <strong>Bukti transfer dilampirkan</strong> pada email ini. Silakan cek lampiran.
        <p style="margin-top:6px;">Jika dalam 1x24 jam dana belum masuk, hubungi admin melalui WhatsApp atau balas email ini.</p>
      </div>

      <p class="foot">MineClip Studio &middot; YouTube Clipper<br>Email: mineclipstudios@gmail.com</p>
    </div>
  </div>
</body>
</html>`;

  const text = `Halo ${data.full_name},

Terima kasih sudah bersabar. Dana refund untuk pembayaran Anda telah kami kirim:
Item              : Lisensi YouTube Clipper - ${data.tier_label}
Nominal Refund    : ${rupiah(data.amount)}
${data.adminNotes ? `Catatan admin     : ${data.adminNotes}` : ""}

Bukti transfer dilampirkan pada email ini.
Jika dalam 1x24 jam dana belum masuk, hubungi admin melalui WhatsApp atau balas email ini.

MineClip Studio - YouTube Clipper`;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: "Refund Telah Dikirim",
      text,
      html,
      attachments: [data.attachment],
    });
    return true;
  } catch (err: any) {
    console.error("[email] refund sent error:", err?.code || "", err?.response || err?.message || err);
    return false;
  }
}