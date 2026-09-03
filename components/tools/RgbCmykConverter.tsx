'use client';

import { useMemo, useState } from 'react';

const SAMPLE_RGB = 'rgb(242, 183, 5)';
const SAMPLE_CMYK = 'cmyk(0%, 24%, 98%, 5%)';

type Mode = 'rgbToCmyk' | 'cmykToRgb';

function rgbToCmyk(r: number, g: number, b: number) {
  const rp = r / 255;
  const gp = g / 255;
  const bp = b / 255;
  const k = 1 - Math.max(rp, gp, bp);

  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

  const c = ((1 - rp - k) / (1 - k)) * 100;
  const m = ((1 - gp - k) / (1 - k)) * 100;
  const y = ((1 - bp - k) / (1 - k)) * 100;
  return { c: Math.round(c), m: Math.round(m), y: Math.round(y), k: Math.round(k * 100) };
}

function cmykToRgb(c: number, m: number, y: number, k: number) {
  const r = 255 * (1 - c / 100) * (1 - k / 100);
  const g = 255 * (1 - m / 100) * (1 - k / 100);
  const b = 255 * (1 - y / 100) * (1 - k / 100);
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

function parseRgb(input: string) {
  const match = input.trim().match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (!match) return null;
  const [r, g, b] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if ([r, g, b].some((v) => v < 0 || v > 255)) return null;
  return { r, g, b };
}

function parseCmyk(input: string) {
  const match = input.trim().match(/^cmyk\(\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i);
  if (!match) return null;
  const [c, m, y, k] = [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
  if ([c, m, y, k].some((v) => v < 0 || v > 100)) return null;
  return { c, m, y, k };
}

function convert(mode: Mode, input: string) {
  if (mode === 'rgbToCmyk') {
    const rgb = parseRgb(input);
    if (!rgb) return { ok: false as const, message: 'Enter a valid rgb() value, e.g. rgb(242, 183, 5).' };
    const { c, m, y, k } = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    return { ok: true as const, output: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)` };
  }
  const cmyk = parseCmyk(input);
  if (!cmyk) return { ok: false as const, message: 'Enter a valid cmyk() value, e.g. cmyk(0%, 24%, 98%, 5%).' };
  const { r, g, b } = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
  return { ok: true as const, output: `rgb(${r}, ${g}, ${b})` };
}

export default function RgbCmykConverter() {
  const [mode, setMode] = useState<Mode>('rgbToCmyk');
  const [input, setInput] = useState(SAMPLE_RGB);

  const result = useMemo(() => convert(mode, input), [mode, input]);
  const swatchRgb = mode === 'rgbToCmyk' ? parseRgb(input) : result.ok ? parseRgb(result.output) : null;

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'rgbToCmyk' ? SAMPLE_RGB : SAMPLE_CMYK);
  }

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn${mode === 'rgbToCmyk' ? ' is-active' : ''}`} onClick={() => switchMode('rgbToCmyk')}>
          RGB → CMYK
        </button>
        <button className={`icon-btn${mode === 'cmykToRgb' ? ' is-active' : ''}`} onClick={() => switchMode('cmykToRgb')}>
          CMYK → RGB
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'rgbToCmyk' ? 'RGB' : 'CMYK'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => setInput('')}>
                Clear
              </button>
            </div>
          </div>
          <input
            className="mono"
            style={{ width: '100%', padding: '10px 12px' }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={mode === 'rgbToCmyk' ? 'rgb(242, 183, 5)' : 'cmyk(0%, 24%, 98%, 5%)'}
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'rgbToCmyk' ? 'CMYK' : 'RGB'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => result.ok && navigator.clipboard.writeText(result.output)} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {swatchRgb && (
              <span
                style={{
                  display: 'inline-block',
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  background: `rgb(${swatchRgb.r}, ${swatchRgb.g}, ${swatchRgb.b})`,
                  flexShrink: 0,
                }}
              />
            )}
            <span>{result.ok ? result.output : `// ${result.message}`}</span>
          </div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Converted' : `✗ ${result.message}`}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        This uses the standard device-independent RGB↔CMYK formula, not an ICC color-profile
        conversion - it's a close approximation for screen use, but won't exactly match a specific
        printer's actual ink output.
      </div>
    </div>
  );
}
