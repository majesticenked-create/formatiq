// Shared hex/RGB color parsing + formatting helpers for the CSS Background
// Color, CSS Background Image, and CSS Border generators. Validation is
// strict: invalid input is reported, never silently clamped.

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Normalizes a 3- or 6-digit hex color (with or without leading #) to lowercase 6-digit "#rrggbb". Returns null if invalid. */
export function normalizeHex(input: string): string | null {
  const trimmed = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [r, g, b] = trimmed.split('');
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed}`.toLowerCase();
  }
  return null;
}

export function hexToRgb(hex: string): Rgb | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return { r, g, b };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Parses an "rgb(r, g, b)" string (or bare "r, g, b") into channels. Each channel must be an integer 0-255; out-of-range or malformed input returns null. */
export function parseRgbString(input: string): Rgb | null {
  const match = input.trim().match(/^rgba?\(\s*([^)]+)\)$|^([^()]+)$/);
  if (!match) return null;
  const body = match[1] ?? match[2];
  const parts = body.split(',').map((p) => p.trim());
  if (parts.length < 3 || parts.length > 4) return null;
  const [rStr, gStr, bStr] = parts;
  if (![rStr, gStr, bStr].every((p) => /^\d+$/.test(p))) return null;
  const [r, g, b] = [rStr, gStr, bStr].map(Number);
  if ([r, g, b].some((n) => n < 0 || n > 255)) return null;
  return { r, g, b };
}

/** Safely quotes a URL for use inside CSS url(...), escaping embedded double quotes. Rejects input containing a closing parenthesis combined with unmatched quoting that could break out of the declaration isn't necessary since the string is always wrapped in quotes - only quote characters need escaping. */
export function quoteCssUrl(url: string): string {
  const escaped = url.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `url("${escaped}")`;
}

export function copyToClipboard(text: string): void {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
}
