import { hexToRgb, normalizeHex, type Rgb } from './css-color';

export interface GlassConfig {
  bgColorInput: string;
  opacityPct: number;
  blurPx: number;
  borderOpacityPct: number;
  borderWidthPx: number;
  radiusPx: number;
  shadowEnabled: boolean;
}

export interface ResolvedGlass {
  rgb: Rgb;
  opacity: number;
  borderOpacity: number;
  blur: number;
  borderWidth: number;
  radius: number;
  bgRgba: string;
  borderRgba: string;
}

export function resolveGlass(config: GlassConfig): ResolvedGlass {
  const hex = normalizeHex(config.bgColorInput) ?? '#ffffff';
  const rgb = hexToRgb(hex) ?? { r: 255, g: 255, b: 255 };
  const opacity = Math.min(100, Math.max(0, config.opacityPct || 0)) / 100;
  const borderOpacity = Math.min(100, Math.max(0, config.borderOpacityPct || 0)) / 100;
  const blur = Math.max(0, config.blurPx || 0);
  const borderWidth = Math.max(0, config.borderWidthPx || 0);
  const radius = Math.max(0, config.radiusPx || 0);
  const bgRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  const borderRgba = `rgba(255, 255, 255, ${borderOpacity})`;
  return { rgb, opacity, borderOpacity, blur, borderWidth, radius, bgRgba, borderRgba };
}

/** Builds the glassmorphism CSS block, including both the unprefixed and -webkit- backdrop-filter. */
export function buildGlassCss(config: GlassConfig): string {
  const r = resolveGlass(config);
  const lines = [
    `background: ${r.bgRgba};`,
    `backdrop-filter: blur(${r.blur}px);`,
    `-webkit-backdrop-filter: blur(${r.blur}px);`,
    `border: ${r.borderWidth}px solid ${r.borderRgba};`,
    `border-radius: ${r.radius}px;`,
  ];
  if (config.shadowEnabled) {
    lines.push('box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);');
  }
  return lines.join('\n');
}
