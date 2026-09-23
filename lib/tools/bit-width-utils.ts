/**
 * Shared bit-width helpers for NAND/NOR calculators, so a NOT step (used by both NAND and NOR)
 * produces a bounded, non-negative result for the selected width instead of relying on
 * JavaScript's unbounded/negative bitwise semantics.
 */

export type BitWidth = 8 | 16 | 32;

export const BIT_WIDTHS: BitWidth[] = [8, 16, 32];

export function maxValueForWidth(width: BitWidth): number {
  return width === 32 ? 0xffffffff : (1 << width) - 1;
}

/** Masks a number down to the given bit width, returning an unsigned integer in [0, 2^width - 1]. */
export function maskToWidth(value: number, width: BitWidth): number {
  if (width === 32) return value >>> 0;
  return value & maxValueForWidth(width);
}

export function toBinaryPadded(value: number, width: BitWidth): string {
  return (value >>> 0).toString(2).padStart(width, '0');
}

export function toHexPadded(value: number, width: BitWidth): string {
  const hexDigits = width / 4;
  return (value >>> 0).toString(16).toUpperCase().padStart(hexDigits, '0');
}

export interface ParsedOperand {
  ok: true;
  value: number;
}
export interface ParseError {
  ok: false;
  message: string;
}

/** Parses a decimal, binary (0b-prefixed or plain), or hex (0x-prefixed) string for the given bit width. */
export function parseOperand(input: string, label: string, width: BitWidth): ParsedOperand | ParseError {
  const trimmed = input.trim();
  if (trimmed === '') return { ok: false, message: `Enter a value for ${label}.` };

  let value: number;
  if (/^0x[0-9a-fA-F]+$/.test(trimmed)) {
    value = parseInt(trimmed.slice(2), 16);
  } else if (/^0b[01]+$/.test(trimmed)) {
    value = parseInt(trimmed.slice(2), 2);
  } else if (/^\d+$/.test(trimmed)) {
    value = parseInt(trimmed, 10);
  } else {
    return { ok: false, message: `"${trimmed}" isn't a valid decimal, 0b-binary, or 0x-hex value for ${label}.` };
  }

  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return { ok: false, message: `"${trimmed}" isn't a valid number for ${label}.` };
  }

  const max = maxValueForWidth(width);
  if (value < 0 || value > max) {
    return { ok: false, message: `${label} must be between 0 and ${max} for a ${width}-bit width.` };
  }

  return { ok: true, value };
}
