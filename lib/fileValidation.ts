const SIGNATURES: Record<string, Uint8Array[]> = {
  "image/jpeg": [new Uint8Array([0xff, 0xd8, 0xff])],
  "image/png": [new Uint8Array([0x89, 0x50, 0x4e, 0x47])],
  "image/webp": [new Uint8Array([0x52, 0x49, 0x46, 0x46])],
};

const MAX_IMAGE_DIMENSION = 4000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateFileSignature(buffer: ArrayBuffer, mimeType: string): boolean {
  const signatures = SIGNATURES[mimeType];
  if (!signatures) return false;
  const view = new Uint8Array(buffer.slice(0, 8));
  return signatures.some((sig) => sig.every((byte, i) => byte === view[i]));
}

export function validateFileSize(bytes: number): boolean {
  return bytes > 0 && bytes <= MAX_IMAGE_BYTES;
}

export function isAllowedMimeType(mimeType: string): boolean {
  return Object.keys(SIGNATURES).includes(mimeType);
}
