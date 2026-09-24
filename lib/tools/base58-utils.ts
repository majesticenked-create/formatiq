/**
 * Base58 (Bitcoin alphabet) encode/decode, additive shared utility for base58-encoder-decoder.
 *
 * Alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz" (58 characters) - the
 * standard Bitcoin Base58 alphabet, which deliberately excludes 0 (zero), O (capital O), I
 * (capital I), and l (lowercase L) because those pairs are easily confused when handwritten or
 * read aloud. This is plain Base58 - there is no Base58Check checksum/version byte here.
 *
 * The actual base-58 <-> base-256 conversion uses BigInt throughout, never plain `Number`, since
 * a `Number` silently loses precision beyond 2^53 and Base58 payloads (arbitrary byte strings)
 * routinely exceed that. Leading zero bytes are handled explicitly: each leading 0x00 byte maps
 * to exactly one leading "1" character in the encoded output, and must round-trip back to a
 * leading zero byte on decode - the core arithmetic loop only handles the non-zero remainder.
 */

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const ALPHABET_MAP: Record<string, number> = {};
for (let i = 0; i < ALPHABET.length; i++) {
  ALPHABET_MAP[ALPHABET[i]] = i;
}

const BASE = 58n;

/** Encodes raw bytes into a Base58 string using the standard Bitcoin alphabet (no checksum). */
export function bytesToBase58(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';

  let leadingZeros = 0;
  while (leadingZeros < bytes.length && bytes[leadingZeros] === 0) {
    leadingZeros++;
  }

  // Big-endian bytes -> big integer.
  let value = 0n;
  for (const b of bytes) {
    value = (value << 8n) | BigInt(b);
  }

  let digits = '';
  while (value > 0n) {
    const remainder = value % BASE;
    value = value / BASE;
    digits = ALPHABET[Number(remainder)] + digits;
  }

  return '1'.repeat(leadingZeros) + digits;
}

export type Base58ToBytesResult = { ok: true; bytes: Uint8Array } | { ok: false; message: string };

/** Decodes a Base58 string (standard Bitcoin alphabet, no checksum) back into raw bytes. */
export function base58ToBytes(input: string): Base58ToBytesResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, message: 'Paste a Base58 string.' };
  }

  for (const ch of trimmed) {
    if (!(ch in ALPHABET_MAP)) {
      return {
        ok: false,
        message: `"${ch}" is not a valid Base58 character (0, O, I, and l are excluded from the alphabet).`,
      };
    }
  }

  let leadingOnes = 0;
  while (leadingOnes < trimmed.length && trimmed[leadingOnes] === '1') {
    leadingOnes++;
  }

  let value = 0n;
  for (const ch of trimmed) {
    value = value * BASE + BigInt(ALPHABET_MAP[ch]);
  }

  const bytesReversed: number[] = [];
  while (value > 0n) {
    bytesReversed.push(Number(value % 256n));
    value = value / 256n;
  }

  const result = new Uint8Array(leadingOnes + bytesReversed.length);
  // leading zero bytes for each leading '1', then the big-endian remainder bytes.
  for (let i = 0; i < bytesReversed.length; i++) {
    result[leadingOnes + i] = bytesReversed[bytesReversed.length - 1 - i];
  }

  return { ok: true, bytes: result };
}
