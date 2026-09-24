/**
 * Shared color-model math for tools that produce a HEX result from a non-RGB color model
 * (CMYK, HSV). RGB<->HEX and RGB<->CMYK already have their own local implementations in
 * HexRgbConverter.tsx and RgbCmykConverter.tsx respectively (left untouched, since those
 * components are additive-only for this batch) - this module exists for the *new* one-step
 * conversions (CMYK to HEX, HSV to HEX) that don't have an existing home, so they don't each
 * grow a third parallel copy of `rgbToHex`.
 *
 * All conversions here are pure, device-independent math - no ICC color-profile lookups, no
 * network calls. Treat results as a close approximation, not print- or profile-accurate color.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/**
 * CMYK (each channel 0-100) -> RGB (each channel 0-255), using the standard formula:
 * R = 255 x (1-C) x (1-K), and likewise for G/M and B/Y. Rounding rule: `Math.round` on the
 * final 0-255 value, applied once (not on any intermediate 0-1 fraction), matching the
 * existing RgbCmykConverter's CMYK->RGB rounding so results agree between the two tools.
 */
export function cmykToRgb(c: number, m: number, y: number, k: number): Rgb {
  const r = 255 * (1 - c / 100) * (1 - k / 100);
  const g = 255 * (1 - m / 100) * (1 - k / 100);
  const b = 255 * (1 - y / 100) * (1 - k / 100);
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

/**
 * HSV (h in degrees 0-360, s/v as 0-100 percentages) -> RGB (each channel 0-255), using the
 * standard sector-based algorithm: normalize s/v to 0-1, compute chroma C = V*S, X = C*(1 -
 * |(H/60 mod 2) - 1|), m = V - C, pick (R',G',B') by which 60-degree sector H falls in, then
 * add m and scale to 0-255. Hue 360 is normalized to 0 before sector selection. Rounding rule:
 * `Math.round` on the final 0-255 value, same as `cmykToRgb` and `rgbToHex` below.
 */
export function hsvToRgb(h: number, s: number, v: number): Rgb {
  const hNorm = ((h % 360) + 360) % 360;
  const sNorm = s / 100;
  const vNorm = v / 100;

  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((hNorm / 60) % 2) - 1));
  const m = vNorm - c;

  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (hNorm < 60) {
    rp = c;
    gp = x;
  } else if (hNorm < 120) {
    rp = x;
    gp = c;
  } else if (hNorm < 180) {
    gp = c;
    bp = x;
  } else if (hNorm < 240) {
    gp = x;
    bp = c;
  } else if (hNorm < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

/** RGB (each channel 0-255) -> 6-digit uppercase HEX string, e.g. `{r:255,g:0,b:0}` -> `#FF0000`. */
export function rgbToHex({ r, g, b }: Rgb): string {
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export interface ParsedHexColor {
  r: number;
  g: number;
  b: number;
  /** Alpha 0-1, only present when the input was an 8-digit #RRGGBBAA hex string. */
  a?: number;
}

/**
 * Parses a HEX color string into RGB (and optional alpha). Accepts the same conventions as the
 * existing HexRgbConverter (`#RGB` 3-digit shorthand, `#RRGGBB` 6-digit, with or without a
 * leading `#`), plus 8-digit `#RRGGBBAA` (CSS Color 4 order - last byte pair is alpha, NOT
 * ARGB) for the tools in this batch that need an alpha channel. Returns `null` on anything else,
 * matching HexRgbConverter's `parseHex` which returns `null` rather than throwing.
 */
export function parseHexColor(input: string): ParsedHexColor | null {
  const value = input.trim().replace(/^#/, '');

  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    const r = parseInt(value[0] + value[0], 16);
    const g = parseInt(value[1] + value[1], 16);
    const b = parseInt(value[2] + value[2], 16);
    return { r, g, b };
  }
  if (/^[0-9a-fA-F]{6}$/.test(value)) {
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return { r, g, b };
  }
  if (/^[0-9a-fA-F]{8}$/.test(value)) {
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    const a = parseInt(value.slice(6, 8), 16) / 255;
    return { r, g, b, a };
  }
  return null;
}

/** Alias of `parseHexColor` for callers that only need the RGB channels (no alpha). */
export function hexToRgb(input: string): Rgb | null {
  const parsed = parseHexColor(input);
  if (!parsed) return null;
  return { r: parsed.r, g: parsed.g, b: parsed.b };
}

/**
 * RGB (each channel 0-255) -> CMYK (each channel 0-100), using the standard formula:
 * K = 1 - max(R,G,B)/255. If K = 1 (pure black), C = M = Y = 0 to avoid a divide-by-zero.
 * Otherwise C = (1-R/255-K)/(1-K), and likewise for M/G and Y/B. Rounding rule: `Math.round` on
 * the final 0-100 value, matching `cmykToRgb`'s single-final-rounding convention above.
 */
export function rgbToCmyk({ r, g, b }: Rgb): { c: number; m: number; y: number; k: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const k = 1 - Math.max(rNorm, gNorm, bNorm);

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - rNorm - k) / (1 - k);
  const m = (1 - gNorm - k) / (1 - k);
  const y = (1 - bNorm - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

/**
 * RGB (each channel 0-255) -> HSV (h in degrees 0-360, s/v as 0-100 percentages), using the
 * standard max/min/delta-based algorithm. V = max channel (normalized 0-1). S = 0 if max is 0,
 * else delta/max. H = 0 if delta is 0 (achromatic), otherwise the standard 60-degree sector
 * formula, normalized into 0-360. Rounding rule: `Math.round` on the final H/S/V values, only
 * at the end (not on intermediate 0-1 fractions), matching this file's other conversions.
 */
export function rgbToHsv({ r, g, b }: Rgb): { h: number; s: number; v: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) h = ((gNorm - bNorm) / delta) % 6;
    else if (max === gNorm) h = (bNorm - rNorm) / delta + 2;
    else h = (rNorm - gNorm) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) };
}
