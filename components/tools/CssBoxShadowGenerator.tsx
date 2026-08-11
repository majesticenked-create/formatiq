'use client';

import { useMemo, useState } from 'react';

interface Shadow {
  id: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  alpha: number;
  inset: boolean;
}

let nextId = 2;
function makeId(): string {
  return `sh${nextId++}`;
}

const INITIAL_SHADOWS: Shadow[] = [
  { id: 'sh1', offsetX: 0, offsetY: 4, blur: 12, spread: 0, color: '#000000', alpha: 0.25, inset: false },
];

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shadowToCss(s: Shadow): string {
  return `${s.inset ? 'inset ' : ''}${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color, s.alpha)}`;
}

export default function CssBoxShadowGenerator() {
  const [shadows, setShadows] = useState<Shadow[]>(INITIAL_SHADOWS);
  const [copied, setCopied] = useState(false);

  const boxShadowCss = useMemo(() => shadows.map(shadowToCss).join(',\n  '), [shadows]);
  const cssRule = `box-shadow: ${boxShadowCss};`;

  function addShadow() {
    setShadows((prev) => [
      ...prev,
      { id: makeId(), offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: '#000000', alpha: 0.2, inset: false },
    ]);
  }

  function removeShadow(id: string) {
    setShadows((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));
  }

  function updateShadow(id: string, patch: Partial<Shadow>) {
    setShadows((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function copyCss() {
    navigator.clipboard.writeText(cssRule);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="panel">
        <div className="panel-bar">
          <span>Preview</span>
        </div>
        <div
          style={{
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface)',
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 10,
              background: 'var(--surface-raised)',
              boxShadow: boxShadowCss,
            }}
          />
        </div>
      </div>

      {shadows.map((s, i) => (
        <div key={s.id} className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>Shadow {i + 1}</span>
            <div className="panel-actions">
              <button
                className={`icon-btn ${s.inset ? 'is-active' : ''}`}
                onClick={() => updateShadow(s.id, { inset: !s.inset })}
              >
                Inset: {s.inset ? 'On' : 'Off'}
              </button>
              <button className="icon-btn" onClick={() => removeShadow(s.id)} disabled={shadows.length <= 1}>
                Remove
              </button>
            </div>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(
              [
                ['offsetX', 'Offset X', -50, 50],
                ['offsetY', 'Offset Y', -50, 50],
                ['blur', 'Blur radius', 0, 100],
                ['spread', 'Spread radius', -50, 50],
              ] as const
            ).map(([key, label, min, max]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', width: 100 }}>
                  {label}
                </label>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={s[key]}
                  onChange={(e) => updateShadow(s.id, { [key]: Number(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span className="mono" style={{ fontSize: 12, width: 48, textAlign: 'right' }}>
                  {s[key]}px
                </span>
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', width: 100 }}>
                Color
              </label>
              <input
                type="color"
                value={s.color}
                onChange={(e) => updateShadow(s.id, { color: e.target.value })}
                style={{ width: 32, height: 32, padding: 0, border: '1px solid var(--border)', borderRadius: 4, background: 'none' }}
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={s.alpha}
                onChange={(e) => updateShadow(s.id, { alpha: Number(e.target.value) })}
                style={{ flex: 1 }}
              />
              <span className="mono" style={{ fontSize: 12, width: 48, textAlign: 'right' }}>
                {Math.round(s.alpha * 100)}%
              </span>
            </div>
          </div>
        </div>
      ))}

      <div className="control-row">
        <button className="icon-btn" onClick={addShadow}>
          Add shadow layer
        </button>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>CSS</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copyCss}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="output mono">{cssRule}</div>
      </div>
    </div>
  );
}
