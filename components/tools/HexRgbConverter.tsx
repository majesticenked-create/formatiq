'use client';

import { useMemo, useState } from 'react';

type Format = 'hex' | 'rgb' | 'hsl';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function parseHex(input: string): Rgb | null {
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
  return null;
}

function parseRgb(input: string): Rgb | null {
  const match = input.trim().match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (!match) return null;
  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  if ([r, g, b].some((v) => v < 0 || v > 255)) return null;
  return { r, g, b };
}

function parseHsl(input: string): Rgb | null {
  const match = input.trim().match(/^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (!match) return null;
  const h = Number(match[1]);
  const s = Number(match[2]);
  const l = Number(match[3]);
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null;
  return hslToRgb(h, s, l);
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;
  const delta = max - min;

  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === rNorm) h = ((gNorm - bNorm) / delta) % 6;
    else if (max === gNorm) h = (bNorm - rNorm) / delta + 2;
    else h = (rNorm - gNorm) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHex({ r, g, b }: Rgb): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function tryParse(format: Format, input: string) {
  if (!input.trim()) {
    return { ok: false as const, message: 'Enter a color value.' };
  }

  const rgb = format === 'hex' ? parseHex(input) : format === 'rgb' ? parseRgb(input) : parseHsl(input);

  if (!rgb) {
    const examples: Record<Format, string> = {
      hex: 'e.g. #3B82F6 or #38F',
      rgb: 'e.g. rgb(59, 130, 246)',
      hsl: 'e.g. hsl(217, 91%, 60%)',
    };
    return { ok: false as const, message: `Not a valid ${format.toUpperCase()} value - ${examples[format]}.` };
  }

  const hsl = rgbToHsl(rgb);
  return {
    ok: true as const,
    hex: rgbToHex(rgb),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    swatch: rgbToHex(rgb),
  };
}

interface OutputRowProps {
  label: string;
  value: string;
}

function OutputRow({ label, value }: OutputRowProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="panel" style={{ marginBottom: 8 }}>
      <div className="panel-bar">
        <span>{label}</span>
        <div className="panel-actions">
          <button className="icon-btn" onClick={copy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px' }}>
        {value}
      </div>
    </div>
  );
}

export default function HexRgbConverter() {
  const [format, setFormat] = useState<Format>('hex');
  const [input, setInput] = useState('#3B82F6');

  const result = useMemo(() => tryParse(format, input), [format, input]);

  function switchFormat(next: Format) {
    setFormat(next);
    setInput(next === 'hex' ? '#3B82F6' : next === 'rgb' ? 'rgb(59, 130, 246)' : 'hsl(217, 91%, 60%)');
  }

  return (
    <div>
      <div className="control-row">
        <button
          className="icon-btn"
          style={{
            borderColor: format === 'hex' ? 'var(--accent-dim)' : undefined,
            color: format === 'hex' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchFormat('hex')}
        >
          HEX
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: format === 'rgb' ? 'var(--accent-dim)' : undefined,
            color: format === 'rgb' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchFormat('rgb')}
        >
          RGB
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: format === 'hsl' ? 'var(--accent-dim)' : undefined,
            color: format === 'hsl' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchFormat('hsl')}
        >
          HSL
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>{format.toUpperCase()} input</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Valid color' : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div>
          <div
            style={{
              height: 64,
              borderRadius: 6,
              border: '1px solid var(--border)',
              marginBottom: 16,
              background: result.swatch,
            }}
          />
          <OutputRow label="HEX" value={result.hex} />
          <OutputRow label="RGB" value={result.rgb} />
          <OutputRow label="HSL" value={result.hsl} />
        </div>
      )}
    </div>
  );
}
