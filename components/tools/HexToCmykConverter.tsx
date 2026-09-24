'use client';

import { useMemo, useState } from 'react';
import { parseHexColor, rgbToCmyk } from '@/lib/tools/color-utils';

const SAMPLE = '#FF0000';

function convert(input: string) {
  if (!input.trim()) return { ok: false as const, message: 'Enter a HEX color.' };
  const rgb = parseHexColor(input);
  if (!rgb) {
    return { ok: false as const, message: 'Enter a valid HEX color, e.g. #FF0000 or #F00.' };
  }
  const cmyk = rgbToCmyk(rgb);
  return { ok: true as const, cmyk, hex: input.trim() };
}

export default function HexToCmykConverter() {
  const [input, setInput] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convert(input), [input]);

  function copy() {
    if (!result.ok) return;
    const { c, m, y, k } = result.cmyk;
    navigator.clipboard.writeText(`cmyk(${c}%, ${m}%, ${y}%, ${k}%)`);
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
            <span>CMYK</span>
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
              cmyk({result.cmyk.c}%, {result.cmyk.m}%, {result.cmyk.y}%, {result.cmyk.k}%)
            </span>
          </div>
        </div>
      )}

      <div className="status-line status-neutral">
        This uses the standard device-independent HEX→RGB→CMYK formula, not an ICC color-profile
        conversion - treat it as a close mathematical approximation, not print-accurate color.
      </div>
    </div>
  );
}
