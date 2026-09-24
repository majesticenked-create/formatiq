'use client';

import { useMemo, useState } from 'react';
import { cmykToRgb, rgbToHex } from '@/lib/tools/color-utils';

const SAMPLE = 'cmyk(0%, 100%, 100%, 0%)';

function parseCmyk(input: string) {
  const match = input.trim().match(/^cmyk\(\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i);
  if (!match) return null;
  const [c, m, y, k] = [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
  if ([c, m, y, k].some((v) => v < 0 || v > 100)) return null;
  return { c, m, y, k };
}

function convert(input: string) {
  if (!input.trim()) return { ok: false as const, message: 'Enter a cmyk() value.' };
  const cmyk = parseCmyk(input);
  if (!cmyk) return { ok: false as const, message: 'Enter a valid cmyk() value, e.g. cmyk(0%, 100%, 100%, 0%).' };
  const rgb = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
  return { ok: true as const, hex: rgbToHex(rgb), rgb };
}

export default function CmykToHexConverter() {
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
          <span>CMYK input</span>
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
          placeholder="cmyk(0%, 100%, 100%, 0%)"
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
        This uses the standard device-independent CMYK→RGB→HEX formula, not an ICC color-profile
        conversion - treat it as a close mathematical approximation, not print-accurate color.
      </div>
    </div>
  );
}
