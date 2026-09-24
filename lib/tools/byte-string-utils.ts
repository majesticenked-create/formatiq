/**
 * Decimal-byte-list <-> UTF-8 text conversion, additive shared utility for byte-to-string-converter.
 *
 * This is deliberately distinct from text-ascii-converter, which converts text to/from a list of
 * Unicode *code points* (one number per character, via `codePointAt`/`fromCodePoint`). Here the
 * input is a list of raw *byte* values (0-255 each), which for any character outside the ASCII
 * range is a *different, longer* list than its code point - e.g. the code point for "é" is 233,
 * but its UTF-8 byte encoding is the two bytes 195 169. Decoding must therefore go through
 * `TextDecoder('utf-8')` on the assembled byte array, never `String.fromCharCode` per byte (which
 * would treat each byte as its own character/code unit and mangle any multi-byte sequence).
 */

export type BytesToTextResult = { ok: true; text: string } | { ok: false; message: string };

/** Parses a string of decimal byte values (space/comma/newline separated) into a Uint8Array. */
export function parseByteList(input: string): { ok: true; bytes: Uint8Array } | { ok: false; message: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, message: 'Enter decimal byte values, e.g. 72 101 108 108 111.' };
  }

  const tokens = trimmed.split(/[\s,]+/).filter((t) => t.length > 0);
  const bytes: number[] = [];
  for (const token of tokens) {
    if (!/^\d+$/.test(token)) {
      return { ok: false, message: `"${token}" isn't a valid decimal byte value.` };
    }
    const n = Number(token);
    if (n < 0 || n > 255) {
      return { ok: false, message: `"${token}" is out of range - each byte must be 0-255.` };
    }
    bytes.push(n);
  }

  return { ok: true, bytes: Uint8Array.from(bytes) };
}

/** Decodes a decimal byte-value list into UTF-8 text. */
export function byteListToText(input: string): BytesToTextResult {
  const parsed = parseByteList(input);
  if (!parsed.ok) return { ok: false, message: parsed.message };

  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(parsed.bytes);
    return { ok: true, text };
  } catch {
    return { ok: false, message: 'Those bytes are not a valid UTF-8 sequence.' };
  }
}

/** Encodes text into its UTF-8 byte values, rendered as a space-separated decimal list. */
export function textToByteList(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return Array.from(bytes).join(' ');
}
