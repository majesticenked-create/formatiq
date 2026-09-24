/**
 * Byte-aware Base64 primitives shared by base64-to-binary and base64-to-css.
 *
 * These operate on raw bytes (`Uint8Array`), not JS strings, which matters because a naive
 * `atob(str).charCodeAt(i)` per character silently mis-handles multi-byte UTF-8 sequences and a
 * naive `btoa(unicodeString)` throws outright on non-Latin1 characters. Text<->bytes conversion
 * goes through `TextEncoder`/`TextDecoder` instead, which are UTF-8 correct by construction.
 *
 * Guarded on `typeof atob === 'undefined'` (the exact API this module needs), not on an unrelated
 * global like `window` - the lesson from the batch-011 xml-utils.ts SSR-guard bug.
 */

export type Base64ToBytesResult = { ok: true; bytes: Uint8Array } | { ok: false; message: string };

/** Strips a `data:...;base64,` prefix if present, leaving the raw base64 payload. */
export function stripDataUriPrefix(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/^data:[^,]*;base64,(.*)$/s);
  return match ? match[1].trim() : trimmed;
}

/** Decodes a base64 string (optionally a full data URI) into raw bytes. */
export function base64ToBytes(input: string): Base64ToBytesResult {
  if (typeof atob === 'undefined') {
    return { ok: false, message: 'Loading...' };
  }

  const stripped = stripDataUriPrefix(input).replace(/\s/g, '');
  if (!stripped) {
    return { ok: false, message: 'Paste a Base64 string or data URI.' };
  }
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(stripped) || stripped.length % 4 !== 0) {
    return { ok: false, message: 'Not valid Base64 - check the alphabet and padding.' };
  }

  try {
    const binary = atob(stripped);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { ok: true, bytes };
  } catch {
    return { ok: false, message: 'Not valid Base64.' };
  }
}

/** Encodes raw bytes into a base64 string. */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
