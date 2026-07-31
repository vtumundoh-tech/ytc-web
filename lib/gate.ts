// Konstanta untuk "gate" halaman 404 palsu — ubah GATE_PATH di sini jika ingin ganti path.
export const GATE_PATH = "/arsip";

export const GATE_COOKIE_NAME = "ytc_gate_ok";
export const GATE_BLOCK_COOKIE_NAME = "ytc_gate_blocked";
export const GATE_COOKIE_MAX_AGE_SECONDS = 10 * 60; // 10 menit untuk masuk ke halaman login
export const GATE_BLOCK_MAX_AGE_SECONDS = 24 * 60 * 60; // 1 hari block setelah 3x gagal
export const GATE_MAX_FAILURES = 3;
