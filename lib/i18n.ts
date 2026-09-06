export type Lang = "id" | "en";

export interface T {
  id: string;
  en: string;
}

export const LANG_COOKIE = "mcs_lang";
const LANG_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 jam
const SESSION_ASKED_KEY = "mcs_lang_asked";

export function getLangCookie(): Lang | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${LANG_COOKIE}=`));
  const val = match?.split("=")[1];
  return val === "id" || val === "en" ? val : null;
}

export function setLangCookie(lang: Lang) {
  if (typeof document === "undefined") return;
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
}

export function wasAskedThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_ASKED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markAskedThisSession() {
  try {
    sessionStorage.setItem(SESSION_ASKED_KEY, "1");
  } catch {
    /* abaikan */
  }
}

export function tf(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`
  );
}

export const dict = {
  langModal: {
    title: { id: "Pilih Bahasa", en: "Choose Language" } as T,
    sub: {
      id: "Bahasa apa yang ingin Anda gunakan?",
      en: "Which language would you like to use?",
    } as T,
    indonesian: { id: "Bahasa Indonesia", en: "Bahasa Indonesia" } as T,
    english: { id: "English", en: "English" } as T,
    skip: { id: "Lewati", en: "Skip" } as T,
  },

  nav: {
    home: { id: "Beranda", en: "Home" } as T,
    pricing: { id: "Harga", en: "Pricing" } as T,
    howToBuy: { id: "Cara Beli", en: "How to Buy" } as T,
    buyLicense: { id: "Beli Lisensi", en: "Buy License" } as T,
    claimCashback: { id: "Klaim Cashback", en: "Claim Cashback" } as T,
    openMenu: { id: "Buka menu", en: "Open menu" } as T,
    closeMenu: { id: "Tutup menu", en: "Close menu" } as T,
    language: { id: "Bahasa", en: "Language" } as T,
  },

  footer: {
    tagline: {
      id: "Software desktop all-in-one untuk content creator — download, transkrip, potong klip viral.",
      en: "All-in-one desktop software for content creators — download, transcribe, and cut viral clips.",
    } as T,
    quickLinks: { id: "Tautan Cepat", en: "Quick Links" } as T,
    followUs: { id: "Ikuti Kami", en: "Follow Us" } as T,
    paymentMethods: { id: "Metode Pembayaran", en: "Payment Methods" } as T,
    terms: { id: "Syarat & Ketentuan", en: "Terms & Conditions" } as T,
    privacy: { id: "Kebijakan Privasi", en: "Privacy Policy" } as T,
    rights: { id: "Hak cipta dilindungi.", en: "All rights reserved." } as T,
  },

  home: {
    hero: {
      badge: {
        id: "MineClip Studios v2.0 — Lisensi Permanen",
        en: "MineClip Studios v2.0 — Lifetime License",
      } as T,
      h1a: { id: "Download, Transkrip, Potong,", en: "Download, Transcribe, Cut," } as T,
      h1b: { id: "Viral, dan Cuan.", en: "Go Viral, and Earn." } as T,
      sub: {
        id: "Software desktop Windows all-in-one untuk content creator: download video dari YouTube/TikTok/Instagram, pilih dari 7 mode klip, transkripsi otomatis dengan Whisper AI, scoring AI lokal gratis tanpa batas, dan narasi AI bersuara Indonesia.",
        en: "All-in-one Windows desktop software for content creators: download videos from YouTube/TikTok/Instagram, choose from 7 clip modes, automatic transcription with Whisper AI, free unlimited local AI scoring, and Indonesian-voiced AI narration.",
      } as T,
      badgeLifetime: {
        id: "Sekali Bayar, Pakai Selamanya",
        en: "One Payment, Yours Forever",
      } as T,
      badgeCashback: {
        id: "Cashback s.d. Rp50.000",
        en: "Cashback up to Rp50,000",
      } as T,
      ctaPricing: { id: "Lihat Harga", en: "See Pricing" } as T,
      ctaBuy: { id: "Beli Langsung", en: "Buy Now" } as T,
      note: {
        id: "Windows 10/11 (64-bit) • Tanpa langganan • Pembayaran via QRIS",
        en: "Windows 10/11 (64-bit) • No subscription • Pay via QRIS",
        // id: "Windows 10/11 (64-bit) • Tanpa langganan • Pembayaran via QRIS / Transfer Bank",
        // en: "Windows 10/11 (64-bit) • No subscription • Pay via QRIS / Bank Transfer",
      } as T,
    },
    mock: {
      appTitle: { id: "MineClip Studio", en: "MineClip Studio" } as T,
      tabClips: { id: "Klip Viral", en: "Viral Clips" } as T,
      tabTranscript: { id: "Transkrip", en: "Transcript" } as T,
      tabVoice: { id: "Narasi AI", en: "AI Narration" } as T,
      progressLabel: { id: "Merender 12 klip…", en: "Rendering 12 clips…" } as T,
      subtitleDemo: {
        id: "Ini contoh subtitle otomatis dari AI",
        en: "This is an AI auto-subtitle sample",
      } as T,
      statClips: { id: "Klip siap upload", en: "Clips ready to post" } as T,
      statTime: { id: "Hemat waktu edit", en: "Editing time saved" } as T,
      modes: [
        { id: "Lucu", en: "Funny" } as T,
        { id: "Seru", en: "Thrilling" } as T,
        { id: "Ringkas", en: "Concise" } as T,
        { id: "Horror", en: "Horror" } as T,
        { id: "Komedi", en: "Comedy" } as T,
        { id: "Podcast", en: "Podcast" } as T,
        { id: "Tech & Vlog", en: "Tech & Vlog" } as T,
      ],
    },
    latest: {
      newBadge: { id: "Baru", en: "New" } as T,
      title: { id: "Fitur Terbaru v2.0", en: "What's New in v2.0" } as T,
      items: [
        {
          label: { id: "AI Chat Pribadi Unlimited", en: "Unlimited Private AI Chat" } as T,
          desc: {
            id: "Chat dengan video & dokumen (PDF, Word, Excel, PPT, gambar) dengan konteks yang diingat per-sesi. Berjalan offline di PC Anda sendiri — tanpa batas token, tanpa langganan.",
            en: "Chat with videos & documents (PDF, Word, Excel, PPT, images) with per-session context memory. Runs offline on your own PC — no token limits, no subscription.",
          } as T,
        },
        {
          label: { id: "Integrasi Telegram", en: "Telegram Integration" } as T,
          desc: {
            id: "Progress klip & notifikasi otomatis dikirim ke Telegram — pantau dari HP di mana saja.",
            en: "Clip progress & notifications sent automatically to Telegram — monitor from your phone anywhere.",
          } as T,
        },
      ],
    },
    features: {
      title: { id: "Kenapa MineClip Studios?", en: "Why MineClip Studios?" } as T,
      sub: {
        id: "Satu software untuk semua kebutuhan konten viral Anda.",
        en: "One software for all your viral content needs.",
      } as T,
      items: [
        {
          label: { id: "7 Mode Klip", en: "7 Clip Modes" } as T,
          desc: {
            id: "Lucu, Seru, Ringkas, Horror, Komedi, Podcast, Tech & Vlog — bisa pilih banyak sekaligus.",
            en: "Funny, Exciting, Concise, Horror, Comedy, Podcast, Tech & Vlog — pick several at once.",
          } as T,
        },
        {
          label: { id: "AI Gratis", en: "Free AI" } as T,
          desc: {
            id: "Scoring klip gratis & tanpa khawatir kena limit token.",
            en: "Free clip scoring with no token-limit worries.",
          } as T,
        },
        {
          label: { id: "Download Video", en: "Video Download" } as T,
          desc: {
            id: "YouTube, TikTok, Instagram — langsung dari aplikasi.",
            en: "YouTube, TikTok, Instagram — straight from the app.",
          } as T,
        },
        {
          label: { id: "Transkripsi AI", en: "AI Transcription" } as T,
          desc: {
            id: "Otomatis transkrip audio pakai Whisper AI. Akurat & cepat.",
            en: "Automatic audio transcription with Whisper AI. Accurate & fast.",
          } as T,
        },
        {
          label: { id: "Potong Klip Viral", en: "Cut Viral Clips" } as T,
          desc: {
            id: "Buat klip pendek 9:16 siap upload ke TikTok, Reels, Shorts.",
            en: "Create 9:16 short clips ready for TikTok, Reels, Shorts.",
          } as T,
        },
        {
          label: { id: "AI Scoring", en: "AI Scoring" } as T,
          desc: {
            id: "Skor konten juga dapat menggunakan Gemini/OpenRouter/Claude.",
            en: "Content scoring also supports Gemini/OpenRouter/Claude.",
          } as T,
        },
        {
          label: { id: "Narasi AI Multi-Klip", en: "Multi-Clip AI Narration" } as T,
          desc: {
            id: "Tulis teks, AI bacakan dengan suara Indonesia — teks beda tiap klip.",
            en: "Write text, AI reads it with an Indonesian voice — different text per clip.",
          } as T,
        },
        {
          label: { id: "Subtitle SRT", en: "SRT Subtitles" } as T,
          desc: {
            id: "Upload transkrip SRT atau embed subtitle langsung ke video.",
            en: "Upload SRT transcripts or embed subtitles directly into video.",
          } as T,
        },
        {
          label: { id: "Notifikasi Telegram", en: "Telegram Notifications" } as T,
          desc: {
            id: "Progress klip otomatis dikirim ke Telegram Anda.",
            en: "Clip progress automatically sent to your Telegram.",
          } as T,
        },
      ],
    },
    pricing: {
      title: { id: "Pilih Paket", en: "Choose Your Plan" } as T,
      sub: {
        id: "Lisensi permanen — sekali bayar, dapat anda gunakan selamanya. Harga sewaktu-waktu bisa berubah.",
        en: "Lifetime license — pay once and use it forever. Prices may change at any time.",
      } as T,
      cashbackNote: {
        id: "Setiap paket berhak klaim cashback!",
        en: "Every plan is eligible for cashback!",
      } as T,
      mostPopular: { id: "PALING LARIS", en: "MOST POPULAR" } as T,
      save: { id: "Hemat {amount}", en: "Save {amount}" } as T,
      cashbackAmount: { id: "Cashback {amount}", en: "{amount} cashback" } as T,
      bulletLifetime: {
        id: "Lisensi permanen — sekali bayar",
        en: "Lifetime license — one-time payment",
      } as T,
      bullet720: { id: "Resolusi HD 720p", en: "HD 720p resolution" } as T,
      bullet1080: { id: "Resolusi Full HD 1080p", en: "Full HD 1080p resolution" } as T,
      bulletFeatures: {
        id: "Semua fitur premium & update",
        en: "All premium features & updates",
      } as T,
      bulletForever: { id: "Berlaku selamanya", en: "Valid forever" } as T,
      choose: { id: "Pilih Paket", en: "Choose Plan" } as T,
      usdNote: {
        id: "Untuk pembeli dari luar negeri: 1 USD = Rp {rate} (kurs per {label}). Harga dolar hanya referensi — pembayaran tetap dalam Rupiah via QRIS.",
        en: "For international buyers: 1 USD = IDR {rate} (rate as of {label}). USD price is a reference only — payment is still made in Rupiah via QRIS.",
      } as T,
      urgency: {
        id: "Beli sekarang — harga akan segera kembali ke harga normal.",
        en: "Buy now — prices will soon return to normal.",
      } as T,
    },
    steps: {
      title: { id: "Cara Pembelian", en: "How to Buy" } as T,
      sub: {
        id: "Cukup 3 langkah — dari beli sampai key siap pakai.",
        en: "Just 3 steps — from purchase to a ready-to-use key.",
      } as T,
      items: [
        {
          label: { id: "Isi Data & Pilih Paket", en: "Fill Details & Pick a Plan" } as T,
          desc: {
            id: "Isi nama, WhatsApp & email, lalu pilih paket permanen di halaman beli.",
            en: "Enter your name, WhatsApp & email, then pick a lifetime plan on the buy page.",
          } as T,
        },
        {
          label: { id: "Bayar via QRIS", en: "Pay via QRIS" } as T,
          desc: {
            id: "Scan kode QRIS dengan e-wallet atau m-banking — mudah dan aman.",
            en: "Scan the QRIS code with your e-wallet or m-banking app — easy and secure.",
            // id: "Bayar via QRIS atau transfer bank sesuai metode yang Anda pilih.",
            // en: "Pay via QRIS or bank transfer using the method you prefer.",
          } as T,
        },
        {
          label: { id: "Key & Aplikasi Dikirim", en: "Key & App Delivered" } as T,
          desc: {
            id: "Key lisensi permanen & aplikasi dikirim via email atau WhatsApp sesuai data yang diisi.",
            en: "Your lifetime license key & app are delivered via email or WhatsApp based on your details.",
          } as T,
        },
      ],
      cta: { id: "Beli Sekarang", en: "Buy Now" } as T,
    },
    payment: {
      // SAAT INI KHUSUS QRIS — teks lama (QRIS / Transfer Bank) disimpan untuk dibuka lagi nanti.
      title: {
        id: "Pembayaran via QRIS",
        en: "Pay via QRIS",
        // id: "Pembayaran via QRIS / Transfer Bank",
        // en: "Pay via QRIS / Bank Transfer",
      } as T,
      sub: {
        id: "Pembayaran dilakukan secara mudah dan aman via QRIS. Data Anda terenkripsi & terlindungi.",
        en: "Payment is made easily and securely via QRIS. Your data is encrypted & protected.",
        // id: "Pilih metode pembayaran yang tersedia — QRIS atau transfer bank. Data Anda terenkripsi & aman.",
        // en: "Choose an available payment method — QRIS or bank transfer. Your data is encrypted & secure.",
      } as T,
      methodBank: { id: "Transfer Bank", en: "Bank Transfer" } as T,
      safeNote: {
        id: "Semua transaksi diproses dengan aman — tidak dialihkan ke website lain.",
        en: "All transactions are processed securely — never redirected to other websites.",
      } as T,
    },
    cashback: {
      title: { id: "Program Cashback", en: "Cashback Program" } as T,
      sub: {
        id: "Dapatkan uang kembali dengan cara support kami melalui follow, like & share konten TikTok/Youtube kami.",
        en: "Get money back by supporting us — follow, like & share our TikTok/YouTube content.",
      } as T,
      tncNote: {
        id: "Syarat & Ketentuan berlaku",
        en: "Terms & Conditions apply",
      } as T,
      amountsTitle: { id: "Besaran Cashback", en: "Cashback Amounts" } as T,
      claimNow: {
        id: "Klaim cashback sekarang",
        en: "Claim your cashback now",
      } as T,
      reqTitle: { id: "Syarat Klaim:", en: "Claim Requirements:" } as T,
      req1Pre: { id: "Support kami dengan follow ", en: "Support us by following " } as T,
      req1Mid: { id: " atau subscribe ", en: " or subscribing to " } as T,
      req2: {
        id: "Like & comment minimal 3 post kami — baik di TikTok maupun YouTube (wajib post yang berbeda untuk setiap klaim)",
        en: "Like & comment on at least 3 of our posts — on both TikTok and YouTube (different posts required for each claim)",
      } as T,
      req3: {
        id: "Share video ke minimal 3 teman atau unggah video ke Story (share boleh dilakukan 3× ke akun kami; untuk Story cukup screenshot saat sudah tayang)",
        en: "Share the video with at least 3 friends or post it to your Story (you may share 3× to our account; for Story, a screenshot once it's live is enough)",
      } as T,
      req4: {
        id: "Follow, like, comment, dan subscribe wajib dipertahankan minimal 7 hari — jika kedapatan berhenti lebih awal, cashback tidak dapat dicairkan",
        en: "Follows, likes, comments, and subscriptions must be kept for at least 7 days — if you're caught stopping earlier, the cashback cannot be disbursed",
      } as T,
      req5: {
        id: "Lampirkan screenshot bukti dari setiap langkah",
        en: "Attach screenshot proof of every step",
      } as T,
      closing: {
        id: "Pencairan dilakukan minimal 5 hari setelah key diaktifkan dan maksimal 7 hari. Bukti transfer cashback dikirim ke nomor WhatsApp atau email terdaftar. Maksimal 1 klaim per key.",
        en: "Disbursement takes at least 5 days after key activation and up to 7 days. Cashback transfer proof is sent to your registered WhatsApp number or email. Maximum 1 claim per key.",
      } as T,
    },
    contact: {
      title: { id: "Hubungi Kami", en: "Contact Us" } as T,
      sub: {
        id: "Ada pertanyaan? Butuh bantuan? Hubungi:",
        en: "Questions? Need help? Reach us:",
      } as T,
    },
  },

  buy: {
    title: { id: "Beli Lisensi", en: "Buy a License" } as T,
    sub: {
      id: "Isi data, pilih paket, lalu bayar — key dikirim setelah dikonfirmasi.",
      en: "Fill in your details, pick a plan, then pay — your key is sent after confirmation.",
    } as T,
    sectionPersonal: { id: "Data Diri", en: "Personal Details" } as T,
    fullName: { id: "Nama Lengkap", en: "Full Name" } as T,
    fullNamePh: { id: "Contoh: Budi Santoso", en: "e.g. John Doe" } as T,
    whatsapp: { id: "Nomor WhatsApp", en: "WhatsApp Number" } as T,
    whatsappPh: { id: "Contoh: 8123456789", en: "e.g. 8123456789" } as T,
    otherCountry: { id: "🌐 Lainnya (input sendiri)", en: "🌐 Other (enter manually)" } as T,
    customDialPh: {
      id: "Kode negara, mis. 852 (Hong Kong)",
      en: "Country code, e.g. 852 (Hong Kong)",
    } as T,
    waInvalid: {
      id: "Nomor WhatsApp belum lengkap — isi minimal 8 digit angka tanpa awalan 0 (contoh: 8123456789).",
      en: "WhatsApp number incomplete — enter at least 8 digits without a leading 0 (e.g. 8123456789).",
    } as T,
    dialInvalid: {
      id: "Lengkapi kode negara (1–4 digit) pada kolom di bawah.",
      en: "Complete the country code (1–4 digits) in the field below.",
    } as T,
    waHint1: {
      id: "Kami akan menghubungi Anda melalui nomor ini untuk konfirmasi dan informasi lebih lanjut.",
      en: "We will contact you on this number for confirmation and further information.",
    } as T,
    waHint2: {
      id: "Harap gunakan nomor yang sama jika anda ingin mengklaim cashback",
      en: "Please use the same number if you want to claim cashback later",
    } as T,
    email: { id: "Alamat Email", en: "Email Address" } as T,
    emailPh: { id: "contoh@email.com", en: "you@example.com" } as T,
    emailHint: {
      id: "Untuk pengiriman invoice & konfirmasi — wajib diverifikasi via kode yang dikirim ke email.",
      en: "For invoice delivery & confirmation — must be verified with a code sent to your email.",
    } as T,
    verifiedNote: {
      id: "terverifikasi. Verifikasi email berlaku selama halaman ini terbuka; jika email diganti, verifikasi ulang.",
      en: "is verified. Email verification lasts while this page stays open; change the email to verify again.",
    } as T,
    otpSent: {
      id: "Kode verifikasi 6 digit dikirim ke {email}. 📬 Kalau tidak muncul, cek juga folder Promosi / Spam / Junk.",
      en: "A 6-digit verification code was sent to {email}. 📬 If it doesn't appear, also check your Promotions / Spam / Junk folder.",
    } as T,
    otpValid: { id: "Berlaku {time}", en: "Expires in {time}" } as T,
    otpExpired: { id: "Kode kedaluwarsa", en: "Code expired" } as T,
    otpEnterBefore: {
      id: "masukkan kode sebelum waktu habis",
      en: "enter the code before time runs out",
    } as T,
    verifyBtn: { id: "Verifikasi", en: "Verify" } as T,
    resendCode: { id: "Kirim Ulang Kode", en: "Resend Code" } as T,
    resendLink: { id: "Kirim ulang kode", en: "Resend code" } as T,
    sendCode: { id: "Kirim Kode Verifikasi", en: "Send Verification Code" } as T,
    sendingCode: { id: "Mengirim kode…", en: "Sending code…" } as T,
    codeValidityNote: {
      id: "Kode berlaku 5 menit & hanya untuk satu sesi pembelian ini.",
      en: "The code is valid for 5 minutes & only for this purchase session.",
    } as T,
    errEmailInvalid: {
      id: "Alamat email tidak valid, cek kembali.",
      en: "That email address is invalid, please check it.",
    } as T,
    errOtpFormat: {
      id: "Masukkan 6 digit kode yang dikirim ke email.",
      en: "Enter the 6-digit code sent to your email.",
    } as T,
    errSendCode: {
      id: "Gagal mengirim kode verifikasi.",
      en: "Failed to send verification code.",
    } as T,
    errVerifyFail: {
      id: "Verifikasi gagal.",
      en: "Verification failed.",
    } as T,
    errVerifyRetry: {
      id: "Verifikasi gagal, coba lagi.",
      en: "Verification failed, try again.",
    } as T,
    errWaIncomplete: {
      id: "Nomor WhatsApp belum lengkap — isi minimal 8 digit angka (contoh: 8123456789).",
      en: "WhatsApp number incomplete — enter at least 8 digits (e.g. 8123456789).",
    } as T,
    errNeedVerify: {
      id: "Verifikasi email dulu: masukkan email, klik \"Kirim Kode Verifikasi\", lalu masukkan kode 6 digit yang dikirim.",
      en: "Verify your email first: enter your email, click \"Send Verification Code\", then enter the 6-digit code sent.",
    } as T,
    sectionPlan: { id: "Pilih Paket", en: "Choose Your Plan" } as T,
    addon1080: { id: "+1080p Upgrade", en: "+1080p Upgrade" } as T,
    total: { id: "Total: {amount}", en: "Total: {amount}" } as T,
    eligibleTitle: {
      id: "Paket ini eligible cashback!",
      en: "This plan is eligible for cashback!",
    } as T,
    eligibleDesc: {
      id: "Dapatkan {amount} setelah klaim cashback.",
      en: "Get {amount} after claiming cashback.",
    } as T,
    warningTitle: {
      id: "⚠️ Baca sebelum melanjutkan — penting:",
      en: "⚠️ Read before continuing — important:",
    } as T,
    warn1: {
      id: "Pastikan jumlah QRIS yang Anda bayar sesuai nominal. Jika kurang, pesanan ditolak dan Anda harus memilih refund (dana kembali ≤1×24 jam, potongan transfer bank ditanggung pelanggan) atau bayar kekurangan (klausul 4.4).",
      en: "Make sure the QRIS amount you pay matches exactly. If it falls short, the order is rejected and you must choose a refund (funds return ≤1×24h, bank transfer fees borne by customer) or pay the difference (clause 4.4).",
    } as T,
    warn2: {
      id: "Yang sudah disetujui / Lunas tidak dapat di-refund (klausul 5.5).",
      en: "Approved / Paid orders cannot be refunded (clause 5.5).",
    } as T,
    warn3: {
      id: "Key & unduhan dikirim ke email — cek juga folder Promosi / Spam / Junk.",
      en: "Keys & downloads are sent to your email — also check Promotions / Spam / Junk folders.",
    } as T,
    warn4: {
      id: "Nomor WhatsApp wajib lengkap (minimal 8 digit angka) untuk konfirmasi & cashback.",
      en: "A complete WhatsApp number (at least 8 digits) is required for confirmation & cashback.",
    } as T,
    readTnc: {
      id: "Baca Syarat & Ketentuan lengkap →",
      en: "Read the full Terms & Conditions →",
    } as T,
    agreePart1: {
      id: "Saya telah membaca dan menyetujui ",
      en: "I have read and agree to the ",
    } as T,
    agreeLink: { id: "Syarat & Ketentuan", en: "Terms & Conditions" } as T,
    agreePart2: {
      id: " terlebih dahulu. Dengan menyetujui berarti saya menyetujui seluruh klausul Syarat & Ketentuan di atas termasuk ketentuan pembayaran, refund, dan cashback tanpa konfirmasi tambahan.",
      en: " first. By agreeing, I accept all clauses of the Terms & Conditions above including payment, refund, and cashback terms without further confirmation.",
    } as T,
    processing: { id: "Memproses...", en: "Processing…" } as T,
    submit: { id: "Submit Pembelian — {amount}", en: "Place Order — {amount}" } as T,
    secureNote: {
      id: "Pembayaran Anda diproses dengan aman.",
      en: "Your payment is processed securely.",
    } as T,
    referralTitle: {
      id: "Kode Referral (opsional)",
      en: "Referral Code (optional)",
    } as T,
    referralPh: {
      id: "Masukkan kode referral jika punya",
      en: "Enter a referral code if you have one",
    } as T,
    referralApply: { id: "Terapkan", en: "Apply" } as T,
    referralApplied: {
      id: "Diskon referral {amount} diterapkan!",
      en: "Referral discount {amount} applied!",
    } as T,
    referralRemoved: { id: "Kode referral dihapus.", en: "Referral code removed." } as T,
    referralRemove: { id: "Hapus", en: "Remove" } as T,
    referralInvalid: {
      id: "Kode referral tidak ditemukan atau sudah tidak aktif.",
      en: "Referral code not found or no longer active.",
    } as T,
    referralLimitReached: {
      id: "Kode referral sudah mencapai batas pemakaian.",
      en: "This referral code has reached its usage limit.",
    } as T,
    referralDiscApplied: {
      id: "Diskon Referral: -{amount}",
      en: "Referral Discount: -{amount}",
    } as T,
    errTransaction: {
      id: "Gagal membuat transaksi",
      en: "Failed to create transaction",
    } as T,
    errPaymentMode: {
      id: "Mode pembayaran belum aktif. Silakan hubungi admin.",
      en: "Payment mode is not active yet. Please contact admin.",
    } as T,
    errGeneric: {
      id: "Terjadi kesalahan, coba lagi.",
      en: "Something went wrong, please try again.",
    } as T,
    qris: {
      title: { id: "Bayar via QRIS", en: "Pay via QRIS" } as T,
      sub: {
        id: "Scan kode QR di bawah menggunakan GoPay atau aplikasi e-wallet / m-banking Anda.",
        en: "Scan the QR code below using GoPay or your e-wallet / m-banking app.",
      } as T,
      qrExpiredBadge: { id: "Kode QR kedaluwarsa", en: "QR code expired" } as T,
      qrValidBadge: { id: "QR berlaku {time}", en: "QR valid for {time}" } as T,
      qrExpiredTitle: {
        id: "Kode QR sudah tidak tampil",
        en: "The QR code is no longer shown",
      } as T,
      viewAgain: { id: "Lihat Lagi", en: "Show Again" } as T,
      notConfigured: {
        id: "QRIS belum dikonfigurasi admin.",
        en: "QRIS has not been configured by the admin.",
      } as T,
      howToPay: { id: "Cara Pembayaran", en: "Payment Instructions" } as T,
      totalToPay: { id: "Total yang dibayar", en: "Total to pay" } as T,
      backHome: { id: "Kembali ke Beranda", en: "Back to Home" } as T,
      proofTitle: { id: "Lampirkan Bukti Bayar", en: "Attach Payment Proof" } as T,
      proofSub: {
        id: "Upload screenshot bukti pembayaran QRIS Anda (JPEG/PNG/WebP, maks 5MB) agar admin bisa memverifikasi dengan cepat.",
        en: "Upload a screenshot of your QRIS payment proof (JPEG/PNG/WebP, max 5MB) so admin can verify quickly.",
      } as T,
      chooseFile: {
        id: "Pilih screenshot bukti bayar",
        en: "Choose your payment screenshot",
      } as T,
      clickToChoose: { id: "Klik untuk memilih file", en: "Click to choose a file" } as T,
      submitting: { id: "Mengirim…", en: "Sending…" } as T,
      submitProof: { id: "Upload Bukti & Konfirmasi Pembayaran", en: "Upload Proof & Confirm Payment" } as T,
      thanksTitle: { id: "Terima kasih!", en: "Thank you!" } as T,
      thanksSub: {
        id: "Bukti bayar Anda sudah kami terima. Silakan menunggu sampai admin memverifikasi data Anda.",
        en: "We've received your payment proof. Please wait while admin verifies your data.",
      } as T,
      thanksBox1: {
        id: "Download aplikasi dan kode cashback{eligible} akan dikirim otomatis ke email {email} saat status pembayaran Anda menjadi Lunas.",
        en: "The app download and cashback code{eligible} will be sent automatically to {email} once your payment status becomes Paid.",
      } as T,
      thanksEligible: { id: " (jika Anda eligible)", en: " (if you're eligible)" } as T,
      thanksBox2: {
        id: "Jika ada kendala, kami akan menghubungi Anda melalui email/WhatsApp yang terdaftar.",
        en: "If there's an issue, we will contact you via your registered email/WhatsApp.",
      } as T,
      thanksBox3: {
        id: "📬 Email terkadang masuk ke folder Promosi / Spam / Junk — cek juga folder-folder tersebut di penyedia email Anda.",
        en: "📬 Emails sometimes land in the Promotions / Spam / Junk folder — check those folders in your email provider too.",
      } as T,
      autoCheckNote: {
        id: "Status Anda diperiksa otomatis tiap 5 detik — halaman ini akan berubah otomatis begitu admin menyetujui.",
        en: "Your status is checked automatically every 5 seconds — this page will update once admin approves.",
      } as T,
      paidTitle: { id: "Pembayaran Berhasil!", en: "Payment Successful!" } as T,
      paidSub: {
        id: "Terima kasih, {name}. Pembayaran Anda telah berhasil diproses.",
        en: "Thank you, {name}. Your payment has been processed successfully.",
      } as T,
      downloadApp: { id: "Download Aplikasi", en: "Download App" } as T,
      preparing: { id: "Menyiapkan unduhan…", en: "Preparing download…" } as T,
      autoDownloadIn: {
        id: "Mengunduh otomatis dalam {n} detik…",
        en: "Auto-downloading in {n}s…",
      } as T,
      dlFail: {
        id: "Gagal menyiapkan unduhan.",
        en: "Failed to prepare the download.",
      } as T,
      downloadBtn: { id: "Unduh Aplikasi", en: "Download App" } as T,
      dlNote1: {
        id: "Harap unduh di Komputer, bukan di HP. Tautan juga dikirim ke email {email} bila perlu mengunduh kembali dalam 24 jam.",
        en: "Please download on a Computer, not on your phone. The link is also sent to {email} if you need to re-download within 24 hours.",
      } as T,
      dlNote2: {
        id: "📬 Email terkadang masuk folder Promosi / Spam / Junk — periksa juga folder-folder tersebut jika email belum masuk.",
        en: "📬 Emails sometimes land in the Promotions / Spam / Junk folder — check those folders if the email hasn't arrived.",
      } as T,
      cbEligible: {
        id: "Paket ini dapat cashback",
        en: "This plan gets cashback",
      } as T,
      cbCodeWarning: {
        id: "Demi alasan keamanan, kode ini hanya dibuat sekali dan tidak akan ditampilkan lagi. Harap simpan baik-baik — akan dibutuhkan saat klaim cashback.",
        en: "For security reasons, this code is generated only once and will never be shown again. Please keep it safe — you'll need it when claiming cashback.",
      } as T,
      ok: { id: "OK", en: "OK" } as T,
      okHint: {
        id: "Klik OK untuk kembali ke beranda.",
        en: "Click OK to return to the home page.",
      } as T,
      refundSentTitle: {
        id: "Permintaan Refund Dikirim",
        en: "Refund Request Sent",
      } as T,
      refundSentSub: {
        id: "Permintaan refund Anda sudah terkirim ke admin. Kami akan memprosesnya paling lambat 1x24 jam — bukti transfer refund akan dikirim ke email {email}.",
        en: "Your refund request has been sent to admin. We'll process it within 1x24h — refund transfer proof will be sent to {email}.",
      } as T,
      mismatchTitle: {
        id: "Jumlah Pembayaran Tidak Sesuai",
        en: "Payment Amount Mismatch",
      } as T,
      rejectedTitle: {
        id: "Pesanan Tidak Sesuai Ketentuan",
        en: "Order Violates Our Terms",
      } as T,
      mismatchSub: {
        id: "Pembayaran yang kami terima kurang dari nominal yang diminta.",
        en: "The payment we received is less than the requested amount.",
      } as T,
      rejectedSub: {
        id: "Kami mohon maaf, pesanan Anda tidak dapat kami proses.",
        en: "We're sorry, but your order cannot be processed.",
      } as T,
      productPrice: { id: "Harga Produk", en: "Product Price" } as T,
      paidSoFar: { id: "Yang Telah Dibayar", en: "Amount Paid" } as T,
      remaining: { id: "Sisa yang Harus Dibayar", en: "Remaining to Pay" } as T,
      reason: { id: "Alasan:", en: "Reason:" } as T,
      defaultReason: {
        id: "Pesanan Anda tidak sesuai dengan ketentuan yang berlaku.",
        en: "Your order does not comply with the applicable terms.",
      } as T,
      optionInsufficient: {
        id: "Pilih salah satu opsi: 1) Ajukan refund — dana dikembalikan ≤1x24 jam ke rekening pengirim (potongan transfer bank ditanggung pelanggan); 2) Bayar kekurangan — lengkapi nominal kurang via QRIS lalu pesanan langsung diproses.",
        en: "Choose one option: 1) Request a refund — funds return ≤1x24h to the sender's account (bank transfer fees borne by customer); 2) Pay the difference — complete the missing amount via QRIS and the order proceeds immediately.",
      } as T,
      optionRejected: {
        id: "Dana yang telah Anda bayarkan akan dikembalikan ke rekening pengirim paling lambat 1x24 jam, sesuai jumlah yang ditransfer (potongan transfer bank menjadi tanggungan pelanggan). Mohon menunggu — detail dikirim juga ke email {email}.",
        en: "The funds you paid will be returned to the sender's account within 1x24h, matching the transferred amount (bank transfer fees borne by customer). Please wait — details are also sent to {email}.",
      } as T,
      requestRefund: { id: "Ajukan Refund", en: "Request Refund" } as T,
      payDifference: {
        id: "Bayar Kekurangan ({amount})",
        en: "Pay the Difference ({amount})",
      } as T,
      errProofFile: {
        id: "Pilih dulu screenshot bukti bayar Anda.",
        en: "Choose your payment screenshot first.",
      } as T,
      errProofFormat: {
        id: "Format file harus JPEG/PNG/WebP.",
        en: "File format must be JPEG/PNG/WebP.",
      } as T,
      errProofSize: {
        id: "Ukuran file maksimal 5MB.",
        en: "Maximum file size is 5MB.",
      } as T,
      errProofInvalid: {
        id: "File tidak valid. Pastikan itu gambar screenshot yang asli.",
        en: "Invalid file. Make sure it's an original screenshot image.",
      } as T,
      errProofSubmit: {
        id: "Gagal mengirim bukti bayar.",
        en: "Failed to submit payment proof.",
      } as T,
      errProofSubmitRetry: {
        id: "Gagal mengirim bukti bayar. Coba lagi.",
        en: "Failed to submit payment proof. Try again.",
      } as T,
      errRefund: {
        id: "Gagal mengajukan refund.",
        en: "Failed to request refund.",
      } as T,
      errRefundRetry: {
        id: "Gagal mengajukan refund. Coba lagi.",
        en: "Failed to request refund. Try again.",
      } as T,
      errSupplement: {
        id: "Gagal membuat pembayaran pelengkap.",
        en: "Failed to create supplement payment.",
      } as T,
      errSupplementRetry: {
        id: "Gagal membuat pembayaran pelengkap. Coba lagi.",
        en: "Failed to create supplement payment. Try again.",
      } as T,
      errSupplementLink: {
        id: "Tautan pembayaran pelengkap tidak valid. Gunakan tautan dari email atau halaman status pesanan.",
        en: "Invalid supplement payment link. Use the link from your email or the order status page.",
      } as T,
      errSupplementLoad: {
        id: "Terjadi kesalahan saat memuat pembayaran pelengkap.",
        en: "An error occurred while loading the supplement payment.",
      } as T,
      errDlLink: {
        id: "Gagal membuat tautan unduh.",
        en: "Failed to create download link.",
      } as T,
    },
  },

  claim: {
    limitReached: {
      id: "Batas pengajuan sudah mencapai batas (maks. 3 kali). Silakan hubungi kami melalui WhatsApp untuk bantuan.",
      en: "You have reached the claim limit (max. 3 attempts). Please contact us via WhatsApp for assistance.",
    } as T,
    doneTitle: { id: "Klaim terkirim!", en: "Claim submitted!" } as T,
    doneSub: {
      id: "Admin akan memverifikasi bukti Anda maksimal 1x24 jam. Cashback akan ditransfer ke nomor WhatsApp yang Anda daftarkan.",
      en: "Admin will verify your proof within 1x24h. The cashback will be transferred to your registered WhatsApp number.",
    } as T,
    doneSpamNote: {
      id: "📬 Email konfirmasi mungkin masuk ke folder Promosi / Spam / Junk — periksa juga folder-folder tersebut jika email belum muncul.",
      en: "📬 Confirmation emails may land in the Promotions / Spam / Junk folder — check those folders if the email hasn't appeared.",
    } as T,
    title: { id: "Klaim Cashback", en: "Claim Cashback" } as T,
    sub: {
      id: "Lampirkan bukti bayar & bukti follow/subscribe, like & comment, dan share untuk klaim cashback Anda.",
      en: "Attach your payment proof & follow/subscribe, like & comment, and share proof to claim your cashback.",
    } as T,
    summaryTitle: { id: "Syarat Ringkas:", en: "Quick Requirements:" } as T,
    sumPreTiktok: { id: "Follow ", en: "Follow " } as T,
    sumMidYoutube: { id: " atau subscribe ", en: " or subscribe to " } as T,
    sumRest: {
      id: " · Like & comment minimal 3 post kami · Share ke minimal 3 teman atau unggah ke Story · Semua wajib dipertahankan minimal 7 hari — jika kedapatan berhenti lebih awal, cashback tidak dapat dicairkan · Lampirkan screenshot bukti setiap langkah. Pencairan dilakukan minimal 7 hari setelah key diaktifkan. Harap diisi data yang sebenar-benarnya seperti yang di submit saat pembelian agar mudah untuk kami melakukan tracking untuk pengembalian dana. Jika data yang ditemukan berbeda bukan tanggung jawab kami karena tidak dapat meneruskan cashback.",
      en: " · Like & comment on at least 3 of our posts · Share with at least 3 friends or post to Story · Everything must be kept for at least 7 days — if caught stopping earlier, the cashback cannot be disbursed · Attach screenshot proof of every step. Disbursement takes at least 7 days after key activation. Please fill in data exactly as submitted during purchase so we can easily track it for fund returns. If the data found differs, it is not our responsibility as the cashback cannot be forwarded.",
    } as T,
    sectionCheck: { id: "Cek Data Pembelian", en: "Check Purchase Data" } as T,
    uniqueCode: { id: "Kode Unik", en: "Unique Code" } as T,
    codePh: { id: "Contoh: YTC-XXXXXXX", en: "e.g. YTC-XXXXXXX" } as T,
    checkData: { id: "Check Data", en: "Check Data" } as T,
    checking: { id: "Mengecek...", en: "Checking…" } as T,
    codeHint: {
      id: "Isi kode unik yang muncul saat pembayaran berhasil (hanya muncul sekalik).",
      en: "Enter the unique code shown after successful payment (shown only once).",
    } as T,
    foundMsg: {
      id: "Data ditemukan! Field data di bawah sudah terisi otomatis dan terkunci — Anda hanya perlu mengunggah bukti.",
      en: "Data found! The fields below are auto-filled and locked — you only need to upload proof.",
    } as T,
    notFoundMsg: {
      id: "Kode tidak ditemukan. Pastikan kode unik sesuai saat pembelian.",
      en: "Code not found. Make sure it matches the one from your purchase.",
    } as T,
    sectionUser: { id: "Informasi Pengguna", en: "User Information" } as T,
    sectionPurchase: { id: "Informasi Pembelian", en: "Purchase Information" } as T,
    tierBought: { id: "Tier yang Dibeli", en: "Plan Purchased" } as T,
    selectPlaceholder: { id: "— Pilih —", en: "— Select —" } as T,
    sectionUpload: { id: "Upload Bukti", en: "Upload Proof" } as T,
    proofPayment: { id: "Bukti Bayar", en: "Payment Proof" } as T,
    proofFollow: {
      id: "Screenshot — Bukti Follow / Subscribe",
      en: "Screenshot — Follow / Subscribe Proof",
    } as T,
    proofFollowHint: {
      id: "Screenshot akun yang sudah follow TikTok atau subscribe YouTube.",
      en: "Screenshot of the account after following TikTok or subscribing on YouTube.",
    } as T,
    proofLike: {
      id: "Screenshot — Like & Comment (wajib 6 foto)",
      en: "Screenshot — Likes & Comments (6 photos required)",
    } as T,
    proofLikeHint: {
      id: "Wajib 6 foto: 3 postingan × 1 like + 1 komentar (masing-masing). Post di TikTok maupun YouTube — tidak boleh mengulang postingan yang sama.",
      en: "6 photos required: 3 posts × 1 like + 1 comment each. Posts on both TikTok and YouTube — repeating the same post is not allowed.",
    } as T,
    proofShare: {
      id: "Screenshot — Share ke Teman / Story",
      en: "Screenshot — Share to Friends / Story",
    } as T,
    proofShareHint: {
      id: "Bukti share ke minimal 3 teman (screenshot isi dm yang menunjukkan postingan yang di-share), atau screenshot Story saat sudah tayang.",
      en: "Proof of sharing with at least 3 friends (screenshot of DMs showing the shared post), or a Story screenshot once it's live.",
    } as T,
    notes: { id: "Catatan Tambahan", en: "Additional Notes" } as T,
    optional: { id: "Opsional", en: "Optional" } as T,
    fullName: { id: "Nama Lengkap", en: "Full Name" } as T,
    email: { id: "Alamat Email", en: "Email Address" } as T,
    emailHint: {
      id: "Untuk konfirmasi pengajuan cashback",
      en: "For cashback request confirmation",
    } as T,
    whatsapp: { id: "Nomor WhatsApp", en: "WhatsApp Number" } as T,
    whatsappHint: {
      id: "Aktif — untuk transfer cashback",
      en: "Active — used for the cashback transfer",
    } as T,
    captcha: { id: "Verifikasi", en: "Verification" } as T,
    captchaHint: {
      id: "Berapa hasil dari {a} + {b}? (angka acak setiap kali)",
      en: "What is {a} + {b}? (randomized each time)",
    } as T,
    snk1: {
      id: "Cashback hanya berlaku 1 kali per key, non-tunai, ditransfer ke WhatsApp terdaftar.",
      en: "Cashback applies only once per key, non-cash, transferred to the registered WhatsApp.",
    } as T,
    snk2: {
      id: "Follow, like, comment, dan subscribe wajib dipertahankan minimal 7 hari — jika kedapatan berhenti lebih awal, cashback tidak dapat dicairkan.",
      en: "Follows, likes, comments, and subscriptions must be kept for at least 7 days — if caught stopping earlier, the cashback cannot be disbursed.",
    } as T,
    snk3: {
      id: "Like & comment wajib minimal 3 post yang berbeda setiap klaim — mengulang post yang sama dianggap tidak sah.",
      en: "Likes & comments must cover at least 3 different posts per claim — repeating the same post is invalid.",
    } as T,
    snk4: {
      id: "Pencairan dilakukan minimal 7 hari setelah key diaktifkan.",
      en: "Disbursement takes at least 7 days after key activation.",
    } as T,
    snk5: {
      id: "Kecurangan mengakibatkan blacklist permanen & key dapat dicabut tanpa refund.",
      en: "Fraud results in permanent blacklisting & the key may be revoked without refund.",
    } as T,
    snk6: {
      id: "Keputusan Admin bersifat mutlak.",
      en: "Admin decisions are final.",
    } as T,
    agreePre: { id: "Saya setuju dengan ", en: "I agree to the " } as T,
    agreeLink: { id: "Syarat & Ketentuan", en: "Terms & Conditions" } as T,
    sending: { id: "Mengirim...", en: "Sending…" } as T,
    submit: { id: "Kirim Klaim Cashback", en: "Submit Cashback Claim" } as T,
    errCheck: {
      id: "Gagal memeriksa data.",
      en: "Failed to check data.",
    } as T,
    errSubmit: {
      id: "Gagal mengirim klaim",
      en: "Failed to submit claim",
    } as T,
    errGeneric: {
      id: "Terjadi kesalahan, coba lagi.",
      en: "Something went wrong, please try again.",
    } as T,
    addImage: { id: "Tap untuk tambah gambar", en: "Tap to add image" } as T,
    pickImage: { id: "Tap untuk pilih gambar", en: "Tap to choose image" } as T,
    fileTypes: {
      id: "JPEG, PNG, atau WebP (maks 5MB){max}",
      en: "JPEG, PNG, or WebP (max 5MB){max}",
    } as T,
    fileTypesMax: { id: ", maksimal {n} gambar", en: ", up to {n} images" } as T,
    maxReached: {
      id: "Sudah mencapai maksimal {n} gambar.",
      en: "Reached the maximum of {n} images.",
    } as T,
    deleteFile: { id: "Hapus file", en: "Delete file" } as T,
  },

  order: {
    loadErrorTitle: { id: "Gagal memuat status", en: "Failed to load status" } as T,
    contactAdmin: { id: "Hubungi admin", en: "Contact admin" } as T,
    checkingTitle: { id: "Memeriksa status pesanan…", en: "Checking order status…" } as T,
    autoUpdate: {
      id: "Status diperbarui otomatis tiap 5 detik.",
      en: "Status updates automatically every 5 seconds.",
    } as T,
    paidTitle: { id: "Pembayaran Berhasil!", en: "Payment Successful!" } as T,
    paidSub: {
      id: "Terima kasih! Pesanan Anda telah lunas.",
      en: "Thank you! Your order is fully paid.",
    } as T,
    yourCbCode: { id: "Kode cashback Anda:", en: "Your cashback code:" } as T,
    emailSentNote: {
      id: "Link unduhan & invoice dikirim ke email Anda. 📬 Bila belum ada, cek juga folder Promosi / Spam / Junk di penyedia email Anda.",
      en: "The download link & invoice were sent to your email. 📬 If nothing arrived, also check the Promotions / Spam / Junk folders in your email provider.",
    } as T,
    waitingTitle: {
      id: "Menunggu Verifikasi Admin",
      en: "Awaiting Admin Verification",
    } as T,
    waitingSub: {
      id: "Bukti bayar Anda sedang kami periksa. Status ini diperbarui otomatis — halaman akan berubah begitu admin memverifikasi.",
      en: "We're reviewing your payment proof. This status updates automatically — the page will change once admin verifies.",
    } as T,
    rejectedTitle: {
      id: "Pesanan Tidak Sesuai Ketentuan",
      en: "Order Violates Our Terms",
    } as T,
    rejectedSub: {
      id: "Pesanan Anda tidak dapat kami proses.",
      en: "Your order cannot be processed.",
    } as T,
    reason: { id: "Alasan:", en: "Reason:" } as T,
    defaultReason: {
      id: "Pesanan Anda tidak sesuai dengan ketentuan yang berlaku.",
      en: "Your order does not comply with the applicable terms.",
    } as T,
    rejectedAmber: {
      id: "Dana yang telah Anda bayarkan akan dikembalikan ke rekening pengirim paling lambat 1x24 jam, sesuai jumlah yang ditransfer (potongan transfer bank menjadi tanggungan pelanggan). Detail juga dikirim ke email Anda. 📬 Cek juga folder Promosi / Spam / Junk.",
      en: "The funds you paid will be returned to the sender's account within 1x24h, matching the transferred amount (bank transfer fees borne by customer). Details are also sent to your email. 📬 Also check the Promotions / Spam / Junk folders.",
    } as T,
    refundSentTitle: { id: "Permintaan Refund Dikirim", en: "Refund Request Sent" } as T,
    refundSentSub: {
      id: "Permintaan refund Anda sudah terkirim ke admin. Kami akan memprosesnya paling lambat 1x24 jam — bukti transfer refund akan dikirim ke email Anda.",
      en: "Your refund request has been sent to admin. We'll process it within 1x24h — refund transfer proof will be sent to your email.",
    } as T,
    mismatchTitle: {
      id: "Jumlah Pembayaran Tidak Sesuai",
      en: "Payment Amount Mismatch",
    } as T,
    mismatchSub: {
      id: "Pembayaran yang kami terima kurang dari nominal yang diminta.",
      en: "The payment we received is less than the requested amount.",
    } as T,
    productPrice: { id: "Harga Produk", en: "Product Price" } as T,
    paidSoFar: { id: "Yang Telah Dibayar", en: "Amount Paid" } as T,
    remaining: { id: "Sisa yang Harus Dibayar", en: "Remaining to Pay" } as T,
    optionsIntro: { id: "Pilih salah satu opsi:", en: "Choose one option:" } as T,
    optRefund: {
      id: "Ajukan Refund — dana dikembalikan ≤1x24 jam ke rekening pengirim (potongan transfer bank ditanggung pelanggan).",
      en: "Request a Refund — funds return ≤1x24h to the sender's account (bank transfer fees borne by customer).",
    } as T,
    optSupplement: {
      id: "Bayar Kekurangan — lengkapi nominal kurang via QRIS, lalu pesanan langsung diproses.",
      en: "Pay the Difference — complete the missing amount via QRIS, then the order proceeds immediately.",
    } as T,
    requestRefund: { id: "Ajukan Refund", en: "Request Refund" } as T,
    payDifference: { id: "Bayar Kekurangan", en: "Pay the Difference" } as T,
    backHome: { id: "Kembali ke Beranda", en: "Back to Home" } as T,
    errTokenInvalid: {
      id: "Tautan status tidak valid. Gunakan tautan yang dikirim via email.",
      en: "Invalid status link. Use the link sent via email.",
    } as T,
    errNotFound: {
      id: "Pesanan tidak ditemukan. Gunakan tautan yang dikirim via email.",
      en: "Order not found. Use the link sent via email.",
    } as T,
    errLoad: {
      id: "Terjadi kesalahan saat memuat status. Coba lagi beberapa saat.",
      en: "An error occurred while loading the status. Try again shortly.",
    } as T,
    errRefund: { id: "Gagal mengajukan refund.", en: "Failed to request refund." } as T,
    errSupplement: {
      id: "Gagal membuat pembayaran pelengkap.",
      en: "Failed to create supplement payment.",
    } as T,
  },

  success: {
    title: { id: "Pembayaran Berhasil!", en: "Payment Successful!" } as T,
    sub: {
      id: "Key lisensi dan aplikasi akan dikirim ke email atau WhatsApp yang Anda daftarkan begitu pembayaran terkonfirmasi (biasanya beberapa menit).",
      en: "Your license key and app will be sent to your registered email or WhatsApp as soon as payment is confirmed (usually within minutes).",
    } as T,
  },

  download: {
    preparingTitle: { id: "Menyiapkan unduhan…", en: "Preparing your download…" } as T,
    preparingSub: {
      id: "Sedang menyiapkan file aplikasi untuk Anda.",
      en: "Getting your app file ready.",
    } as T,
    startedTitle: { id: "Unduhan dimulai…", en: "Download started…" } as T,
    startedSub: {
      id: "Jika unduhan tidak berjalan otomatis, tekan tombol di bawah ini.",
      en: "If the download doesn't start automatically, press the button below.",
    } as T,
    downloadBtn: { id: "Unduh Aplikasi", en: "Download App" } as T,
    failedTitle: { id: "Unduhan gagal", en: "Download failed" } as T,
    invalidLink: { id: "Tautan unduh tidak valid.", en: "Invalid download link." } as T,
    errLoad: { id: "Gagal memuat unduhan.", en: "Failed to load the download." } as T,
    errGeneric: {
      id: "Terjadi kesalahan, coba lagi nanti.",
      en: "Something went wrong, please try again later.",
    } as T,
    contactAdmin: { id: "Hubungi admin", en: "Contact admin" } as T,
  },

  notFound: {
    title: { id: "Halaman tidak ditemukan", en: "Page not found" } as T,
    sub: {
      id: "Halaman yang Anda cari tidak tersedia atau telah dipindahkan. Silakan kembali ke halaman utama.",
      en: "The page you're looking for is unavailable or has moved. Please return to the home page.",
    } as T,
    backHome: { id: "Kembali ke Halaman Utama", en: "Back to Home" } as T,
    backPrev: { id: "Kembali", en: "Go Back" } as T,
  },

  common: {
    heic: {
      id: "Foto dari iPhone/iPad (HEIC) belum didukung. Ubah dulu ke JPEG/PNG, lalu coba lagi.",
      en: "Photos from iPhone/iPad (HEIC) aren't supported yet. Convert them to JPEG/PNG first, then try again.",
    } as T,
  },
} as const;
