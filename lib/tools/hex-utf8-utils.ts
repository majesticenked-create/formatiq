/**
 * Contiguous-hex <-> UTF-8 text conversion for hex-to-utf8-converter.
 *
 * This is deliberately distinct from utf8-encoder-decoder's hex mode, which expects
 * whitespace/comma-separated hex byte tokens (e.g. "48 65 6c 6c 6f"). Here the input is a
 * single contiguous hex string with no separators required - the common form hex represents
 * bytes in outside of this codebase (hex dumps, hashes, `xxd`/`openssl` output, hex literals
 * copied from other tools) - e.g. "48656C6C6F". Optional whitespace and a leading "0x"/"0X"
 * prefix are stripped first so either style still works, but neither is required.
 *
 * Two-stage error model, matching decodeBase64Utf8 in base64-utils.ts: stage 'hex' for
 * malformed hex input (odd length, invalid characters), stage 'utf8' for hex that parses fine
 * but whose bytes aren't valid UTF-8 (via `TextDecoder('utf-8', { fatal: true })`, never a
 * lenient decode that would silently substitute replacement characters).
 */

export type HexToUtf8Result = { ok: true; text: string; byteCount: number } | { ok: false; stage: 'hex' | 'utf8'; message: string };

/** Strips optional whitespace and a leading 0x/0X prefix from a hex string. */
export function normalizeHex(input: string): string {
  return input.trim().replace(/^0x/i, '').replace(/\s+/g, '');
}

/** Parses a normalized (no separators) hex string into raw bytes. */
export function hexToBytes(input: string): { ok: true; bytes: Uint8Array } | { ok: false; message: string } {
  const hex = normalizeHex(input);
  if (!hex) {
    return { ok: false, message: 'Enter a hex string to decode, e.g. 48656C6C6F.' };
  }
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    return { ok: false, message: 'Only hex digits (0-9, A-F) are allowed, plus optional spaces or a 0x prefix.' };
  }
  if (hex.length % 2 !== 0) {
    return { ok: false, message: `Hex must have an even number of digits (one byte = two digits) - got ${hex.length}.` };
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return { ok: true, bytes };
}

/** Decodes a hex string (contiguous or spaced, with optional 0x prefix) into UTF-8 text. */
export function hexToUtf8(input: string): HexToUtf8Result {
  const parsed = hexToBytes(input);
  if (!parsed.ok) return { ok: false, stage: 'hex', message: parsed.message };

  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(parsed.bytes);
    return { ok: true, text, byteCount: parsed.bytes.length };
  } catch {
    return { ok: false, stage: 'utf8', message: 'That hex is valid, but the decoded bytes are not valid UTF-8 text.' };
  }
}

/** Encodes text into its UTF-8 bytes, rendered as a contiguous lowercase hex string. */
export function textToHex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
