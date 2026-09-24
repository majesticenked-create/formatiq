/**
 * Binary bit-string <-> bytes helpers, shared by binary-to-base64-converter and
 * binary-to-string-converter (batch 016).
 *
 * The input here is a string of literal '0'/'1' characters representing the *bits* of one or
 * more bytes (e.g. "01001000 01101001"), not a textual representation to be encoded as-is. Each
 * group of 8 bits is one byte, so the total bit count (after stripping whitespace) must be a
 * multiple of 8 - anything else is rejected rather than silently padded or truncated, since
 * guessing which end to pad could silently shift every byte boundary.
 */

export type BinaryToBytesResult = { ok: true; bytes: Uint8Array } | { ok: false; message: string };

/** Parses a whitespace-separated binary bit string into the bytes it represents. */
export function binaryStringToBytes(input: string): BinaryToBytesResult {
  const stripped = input.trim().replace(/\s+/g, '');
  if (!stripped) {
    return { ok: false, message: 'Enter a binary value, e.g. 01001000 01101001.' };
  }
  if (!/^[01]+$/.test(stripped)) {
    return { ok: false, message: 'Only 0 and 1 are valid characters in a binary value.' };
  }
  if (stripped.length % 8 !== 0) {
    return {
      ok: false,
      message: `Binary input must represent whole bytes (a multiple of 8 bits) - got ${stripped.length} bits.`,
    };
  }

  const bytes = new Uint8Array(stripped.length / 8);
  for (let i = 0; i < stripped.length; i += 8) {
    bytes[i / 8] = parseInt(stripped.slice(i, i + 8), 2);
  }
  return { ok: true, bytes };
}

/** Renders raw bytes as a space-separated binary string, one 8-bit group per byte. */
export function bytesToBinaryString(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(2).padStart(8, '0')).join(' ');
}
