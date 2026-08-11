'use client';

import { useMemo, useState } from 'react';

type Mode = 'complementary' | 'analogous' | 'triadic';

interface Hsl {
  h: number;
  s: number;
  l: number;
}

function hexToHsl(hex: string): Hsl | null {
  const clean = hex.replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;

  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const delta = max - min;

  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s: s * 100, l: l * 100 };
}

function hslToHex({ h, s, l }: Hsl): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

function generatePalette(base: Hsl, mode: Mode): Hsl[] {
  if (mode === 'complementary') {
    return [
      { ...base, l: Math.min(90, base.l + 20) },
      { ...base, l: Math.min(90, base.l + 8) },
      base,
      { h: normalizeHue(base.h + 180), s: base.s, l: base.l },
      { h: normalizeHue(base.h + 180), s: base.s, l: Math.max(10, base.l - 15) },
    ];
  }

  if (mode === 'analogous') {
    return [
      { h: normalizeHue(base.h - 30), s: base.s, l: base.l },
      { h: normalizeHue(base.h - 15), s: base.s, l: base.l },
      base,
      { h: normalizeHue(base.h + 15), s: base.s, l: base.l },
      { h: normalizeHue(base.h + 30), s: base.s, l: base.l },
    ];
  }

  // triadic
  return [
    { ...base, l: Math.min(90, base.l + 20) },
    base,
    { h: normalizeHue(base.h + 120), s: base.s, l: base.l },
    { h: normalizeHue(base.h + 240), s: base.s, l: base.l },
    { ...base, l: Math.max(10, base.l - 20) },
  ];
}

function randomHex(): string {
  const n = Math.floor(Math.random() * 0xffffff);
  return `#${n.toString(16).padStart(6, '0').toUpperCase()}`;
}

interface SwatchProps {
  hex: string;
  label: string;
}

function Swatch({ hex, label }: SwatchProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="panel" style={{ overflow: 'hidden' }}>
      <div style={{ height: 80, background: hex }} />
      <div className="panel-bar">
        <span>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
        <span className="mono" style={{ fontSize: 13 }}>
          {hex}
        </span>
        <button className="icon-btn" onClick={copy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function ColorPaletteGenerator() {
  const [baseHex, setBaseHex] = useState('#3B82F6');
  const [mode, setMode] = useState<Mode>('complementary');

  const baseHsl = useMemo(() => hexToHsl(baseHex), [baseHex]);
  const palette = useMemo(() => (baseHsl ? generatePalette(baseHsl, mode) : null), [baseHsl, mode]);

  const labels = ['Lightest', 'Light', 'Base', 'Accent', 'Dark'];

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Base color:
        </label>
        <input
          type="text"
          value={baseHex}
          onChange={(e) => setBaseHex(e.target.value)}
          className="mono"
          style={{
            width: 110,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <button className="icon-btn" onClick={() => setBaseHex(randomHex())}>
          Randomize base color
        </button>
      </div>

      <div className="control-row">
        {(['complementary', 'analogous', 'triadic'] as Mode[]).map((m) => (
          <button
            key={m}
            className={`icon-btn${mode === m ? ' is-active' : ''}`}
            onClick={() => setMode(m)}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {!baseHsl ? (
        <div className="status-line status-invalid">✗ Enter a valid 6-digit hex color, e.g. #3B82F6.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 16,
          }}
        >
          {palette!.map((hsl, i) => (
            <Swatch key={i} hex={hslToHex(hsl)} label={labels[i]} />
          ))}
        </div>
      )}
    </div>
  );
}
