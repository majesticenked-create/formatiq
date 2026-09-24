'use client';

import { useMemo, useState } from 'react';
import { parseHexColor, rgbToHsv } from '@/lib/tools/color-utils';

const SAMPLE = '#FF0000';

function convert(input: string) {
  if (!input.trim()) return { ok: false as const, message: 'Enter a HEX color.' };
  const rgb = parseHexColor(input);
  if (!rgb) {
    return { ok: false as const, message: 'Enter a valid HEX color, e.g. #FF0000 or #F00.' };
  }
  const hsv = rgbToHsv(rgb);
  return { ok: true as const, hsv, hex: input.trim() };
}

export default function HexToHsvConverter() {
  const [input, setInput] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convert(input), [input]);

  function copy() {
    if (!result.ok) return;
    const { h, s, v } = result.hsv;
    navigator.clipboard.writeText(`hsv(${h}, ${s}%, ${v}%)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>HEX input</span>
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
          placeholder="#FF0000"
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Converted below' : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-bar">
            <span>HSV</span>
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
            <span>
              hsv({result.hsv.h}, {result.hsv.s}%, {result.hsv.v}%)
            </span>
          </div>
        </div>
      )}

      <div className="status-line status-neutral">
        HSV is not the same model as HSL - HSV&apos;s third axis (value) mixes a pure hue with
        black and white, while HSL&apos;s (lightness) is centered on gray. This tool converts to
        HSV specifically, via the standard HEX→RGB→HSV max/min/delta algorithm.
      </div>
    </div>
  );
}
