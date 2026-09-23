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
