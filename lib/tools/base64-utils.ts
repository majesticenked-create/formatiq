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

/**
 * Renders raw bytes as hexadecimal, operating on the byte values directly - never on
 * `charCodeAt` of a UTF-8-decoded string, which would mangle any byte sequence that isn't valid
 * UTF-8 (arbitrary/binary Base64 payloads are not guaranteed to be text at all).
 */
export function bytesToHex(bytes: Uint8Array, options: { grouped?: boolean } = {}): string {
  const { grouped = true } = options;
  const hexBytes = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return grouped ? hexBytes.join(' ') : hexBytes.join('');
}

/**
 * Renders raw bytes as space-separated 3-digit zero-padded octal (e.g. byte 65 -> "101"), again
 * operating on byte values directly rather than on decoded characters.
 */
export function bytesToOctal(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(8).padStart(3, '0')).join(' ');
}

export type DecodeBase64Utf8Result =
  | { ok: true; text: string }
  | { ok: false; stage: 'base64' | 'utf8'; message: string };

/**
 * Shared first two stages of the "Base64 -> structured format" tools (JSON/XML/YAML/CSV/TSV):
 * decode Base64 to raw bytes, then decode those bytes as UTF-8 text with `fatal: true` so
 * invalid UTF-8 byte sequences throw explicitly instead of silently turning into U+FFFD
 * replacement characters. Callers add their own third stage (JSON.parse / parseXml / parseYaml /
 * delimited-row parsing) on top of the returned text.
 */
export function decodeBase64Utf8(input: string): DecodeBase64Utf8Result {
  const bytesResult = base64ToBytes(input);
  if (!bytesResult.ok) {
    return { ok: false, stage: 'base64', message: bytesResult.message };
  }

  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytesResult.bytes);
    return { ok: true, text };
  } catch {
    return { ok: false, stage: 'utf8', message: 'Valid Base64, but the decoded bytes are not valid UTF-8 text.' };
  }
}
