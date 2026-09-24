'use client';

import { useMemo, useState } from 'react';
import { hsvToRgb, rgbToHex } from '@/lib/tools/color-utils';

const SAMPLE = 'hsv(0, 100%, 100%)';

function parseHsv(input: string) {
  const match = input.trim().match(/^hsva?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (!match) return null;
  const [h, s, v] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (h < 0 || h > 360 || s < 0 || s > 100 || v < 0 || v > 100) return null;
  return { h, s, v };
}

function convert(input: string) {
  if (!input.trim()) return { ok: false as const, message: 'Enter an hsv() value.' };
  const hsv = parseHsv(input);
  if (!hsv) {
    return {
      ok: false as const,
      message: 'Enter a valid hsv() value, e.g. hsv(0, 100%, 100%) - hue 0-360, saturation/value 0-100%.',
    };
  }
  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  return { ok: true as const, hex: rgbToHex(rgb), rgb };
}

export default function HsvToHexConverter() {
  const [input, setInput] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convert(input), [input]);

  function copy() {
    if (!result.ok) return;
    navigator.clipboard.writeText(result.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>HSV input</span>
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
          placeholder="hsv(0, 100%, 100%)"
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Converted below' : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-bar">
            <span>HEX</span>
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
                background: result.hex,
                flexShrink: 0,
              }}
            />
            <span>{result.hex}</span>
          </div>
        </div>
      )}

      <div className="status-line status-neutral">
        HSV (hue, saturation, value/brightness) is not the same model as HSL - HSV describes a
        color as a pure hue mixed with white and black, while HSL uses a lightness axis centered
        on gray, so the same numbers in each model produce different colors.
      </div>
    </div>
  );
}
