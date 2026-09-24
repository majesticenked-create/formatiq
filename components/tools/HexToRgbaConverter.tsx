'use client';

import { useMemo, useState } from 'react';
import { parseHexColor } from '@/lib/tools/color-utils';

const SAMPLE_HEX = '#FF0000';
const SAMPLE_ALPHA = '0.5';

function parseAlphaInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return 1;
  const isPercent = trimmed.endsWith('%');
  const num = Number(isPercent ? trimmed.slice(0, -1) : trimmed);
  if (Number.isNaN(num)) return null;
  const value = isPercent ? num / 100 : num;
  if (value < 0 || value > 1) return null;
  return value;
}

function convert(hexInput: string, alphaInput: string) {
  if (!hexInput.trim()) return { ok: false as const, message: 'Enter a HEX color.' };
  const parsed = parseHexColor(hexInput);
  if (!parsed) {
    return { ok: false as const, message: 'Enter a valid HEX color, e.g. #FF0000, #F00, or #FF000080.' };
  }

  // An 8-digit hex (#RRGGBBAA) carries its own alpha channel per the CSS Color 4 convention
  // (last byte pair = alpha, NOT ARGB ordering) - when present, it takes priority over the
  // separate alpha field, since the hex string is the more specific/complete input.
  let alpha: number;
  let alphaSource: 'hex' | 'field';
  if (parsed.a !== undefined) {
    alpha = parsed.a;
    alphaSource = 'hex';
  } else {
    const fieldAlpha = parseAlphaInput(alphaInput);
    if (fieldAlpha === null) {
      return { ok: false as const, message: 'Alpha must be a number from 0-1, or a percentage from 0%-100%.' };
    }
    alpha = fieldAlpha;
    alphaSource = 'field';
  }

  const rgba = `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${Number(alpha.toFixed(3))})`;
  return { ok: true as const, rgba, swatch: `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alpha})`, alphaSource };
}

export default function HexToRgbaConverter() {
  const [hexInput, setHexInput] = useState(SAMPLE_HEX);
  const [alphaInput, setAlphaInput] = useState(SAMPLE_ALPHA);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convert(hexInput, alphaInput), [hexInput, alphaInput]);
  const is8Digit = /^#?[0-9a-fA-F]{8}$/.test(hexInput.trim());

  function copy() {
    if (!result.ok) return;
    navigator.clipboard.writeText(result.rgba);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>HEX input</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setHexInput('')}>
              Clear
            </button>
          </div>
        </div>
        <input
          className="mono"
          style={{ width: '100%', padding: '10px 12px' }}
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          spellCheck={false}
          placeholder="#FF0000 or #FF000080"
        />
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Alpha (0-1 or 0%-100%){is8Digit ? ' - ignored, hex already has an alpha byte' : ''}</span>
        </div>
        <input
          className="mono"
          style={{ width: '100%', padding: '10px 12px' }}
          value={alphaInput}
          onChange={(e) => setAlphaInput(e.target.value)}
          spellCheck={false}
          placeholder="0.5"
          disabled={is8Digit}
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Converted below' : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div className="panel">
          <div className="panel-bar">
            <span>RGBA</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="output mono" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                display: 'inline-block',
                width: 22,
                height: 22,
                borderRadius: 4,
                border: '1px solid var(--border)',
                background: result.swatch,
                flexShrink: 0,
              }}
            />
            <span>{result.rgba}</span>
          </div>
        </div>
      )}

      <div className="status-line status-neutral">
        A 6-digit HEX uses the separate alpha field above (0-1, or a percentage). An 8-digit
        #RRGGBBAA HEX carries its own alpha as the last byte pair, following the CSS Color 4
        convention - not the ARGB byte order some other ecosystems use - and takes priority over
        the field.
      </div>
    </div>
  );
}
