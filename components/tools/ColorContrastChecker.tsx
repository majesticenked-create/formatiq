'use client';

import { useMemo, useState } from 'react';

function parseHex(input: string): { r: number; g: number; b: number } | null {
  const value = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    return {
      r: parseInt(value[0] + value[0], 16),
      g: parseInt(value[1] + value[1], 16),
      b: parseInt(value[2] + value[2], 16),
    };
  }
  if (/^[0-9a-fA-F]{6}$/.test(value)) {
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  }
  return null;
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const channel = c / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const c1 = parseHex(hex1);
  const c2 = parseHex(hex2);
  if (!c1 || !c2) return null;
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface ThresholdRow {
  label: string;
  threshold: number;
}

const THRESHOLDS: ThresholdRow[] = [
  { label: 'AA - Normal text', threshold: 4.5 },
  { label: 'AA - Large text', threshold: 3 },
  { label: 'AAA - Normal text', threshold: 7 },
  { label: 'AAA - Large text', threshold: 4.5 },
];

export default function ColorContrastChecker() {
  const [foreground, setForeground] = useState('#1F2937');
  const [background, setBackground] = useState('#FFFFFF');

  const ratio = useMemo(() => contrastRatio(foreground, background), [foreground, background]);
  const fgValid = parseHex(foreground) !== null;
  const bgValid = parseHex(background) !== null;

  return (
    <div>
      <div className="control-row" style={{ flexWrap: 'wrap' }}>
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Foreground:
        </label>
        <input
          type="color"
          value={fgValid ? foreground : '#000000'}
          onChange={(e) => setForeground(e.target.value)}
          style={{ width: 40, height: 32, border: '1px solid var(--border)', borderRadius: 4, background: 'none' }}
        />
        <input
          type="text"
          value={foreground}
          onChange={(e) => setForeground(e.target.value)}
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

        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Background:
        </label>
        <input
          type="color"
          value={bgValid ? background : '#ffffff'}
          onChange={(e) => setBackground(e.target.value)}
          style={{ width: 40, height: 32, border: '1px solid var(--border)', borderRadius: 4, background: 'none' }}
        />
        <input
          type="text"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
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
      </div>

      {(!fgValid || !bgValid) && (
        <div className="status-line status-invalid">✗ Enter valid hex colors (e.g. #1F2937).</div>
      )}

      {ratio !== null && (
        <>
          <div
            className="panel"
            style={{
              marginTop: 16,
              padding: '32px 20px',
              textAlign: 'center',
              background: background,
              color: foreground,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Sample heading text</div>
            <div style={{ fontSize: 15 }}>
              The quick brown fox jumps over the lazy dog. This is what body text looks like in this combination.
            </div>
          </div>

          <div className="status-line status-valid" style={{ marginTop: 16 }}>
            ✓ Contrast ratio: {ratio.toFixed(2)}:1
          </div>

          <div className="panel" style={{ marginTop: 12 }}>
            <div style={{ padding: '4px 16px' }}>
              {THRESHOLDS.map((t) => {
                const pass = ratio >= t.threshold;
                return (
                  <div
                    key={t.label}
                    className="mono"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {t.label} (min {t.threshold}:1)
                    </span>
                    <span style={{ color: pass ? 'var(--accent)' : 'var(--danger, #ef4444)' }}>
                      {pass ? '✓ Pass' : '✗ Fail'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
