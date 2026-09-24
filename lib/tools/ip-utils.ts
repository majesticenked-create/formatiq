/**
 * Shared IPv4 parsing/validation helpers, extracted from IpAddressFormatter/IpHexConverter
 * so new IP-related tools can reuse the same validation rules without duplicating them.
 * Existing components are left untouched - this module is purely additive.
 */

/** Parses a dotted-decimal IPv4 string into its four 0-255 octets, or null if invalid. */
export function parseIpOctets(input: string): number[] | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;
  const parts = trimmed.split('.');
  if (parts.length !== 4) return null;
  if (parts.some((p) => !/^\d{1,3}$/.test(p))) return null;
  const values = parts.map(Number);
  if (values.some((v) => v < 0 || v > 255)) return null;
  return values;
}

/** Parses a dotted-decimal IPv4 string into a single 32-bit unsigned integer, or null if invalid. */
export function parseIpToInt(input: string): number | null {
  const values = parseIpOctets(input);
  if (!values) return null;
  return ((values[0] << 24) | (values[1] << 16) | (values[2] << 8) | values[3]) >>> 0;
}

export type BinaryToIpResult = { ok: true; ip: string } | { ok: false; message: string };

/**
 * Parses a 32-bit binary string (compact or space-separated per octet, e.g.
 * "11000000 10101000 00000001 00000001") into a dotted-decimal IPv4 address. IPv4 only - this
 * does not attempt IPv6, which has no fixed 32-bit binary form.
 */
export function binaryToIp(input: string): BinaryToIpResult {
  const stripped = input.trim().replace(/\s+/g, '');
  if (!stripped) {
    return { ok: false, message: 'Enter a 32-bit binary value, e.g. 11000000101010000000000100000001.' };
  }
  if (!/^[01]+$/.test(stripped)) {
    return { ok: false, message: 'Only 0 and 1 are valid characters in a binary IPv4 value.' };
  }
  if (stripped.length !== 32) {
    return {
      ok: false,
      message: `Expected exactly 32 binary digits (4 octets x 8 bits), got ${stripped.length}.`,
    };
  }

  const octets: number[] = [];
  for (let i = 0; i < 32; i += 8) {
    octets.push(parseInt(stripped.slice(i, i + 8), 2));
  }

  return { ok: true, ip: octets.join('.') };
}
