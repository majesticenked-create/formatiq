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
