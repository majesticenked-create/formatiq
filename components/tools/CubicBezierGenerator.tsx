'use client';

import { useEffect, useMemo, useState } from 'react';
import { copyToClipboard } from '@/lib/tools/css-color';
import {
  BEZIER_PRESETS,
  bezierPointAt,
  buildBezierCss,
  isValidBezierX,
  isValidBezierY,
  type BezierPoint,
} from '@/lib/tools/cubic-bezier';

const SVG_SIZE = 240;
const PAD = 20;

function toSvgX(x: number) {
  return PAD + x * (SVG_SIZE - 2 * PAD);
}
function toSvgY(y: number) {
  // y grows upward in bezier-space, downward in SVG-space
  return SVG_SIZE - PAD - y * (SVG_SIZE - 2 * PAD);
}

export default function CubicBezierGenerator() {
  const [x1, setX1] = useState('0.25');
  const [y1, setY1] = useState('0.1');
  const [x2, setX2] = useState('0.25');
  const [y2, setY2] = useState('1');
  const [isLinear, setIsLinear] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  const point: BezierPoint = { x1: Number(x1), y1: Number(y1), x2: Number(x2), y2: Number(y2) };
  const x1Error = !isValidBezierX(point.x1);
  const x2Error = !isValidBezierX(point.x2);
  const y1Error = !isValidBezierY(point.y1);
  const y2Error = !isValidBezierY(point.y2);
  const hasError = x1Error || x2Error || y1Error || y2Error;

  const css = isLinear ? 'transition-timing-function: linear;' : `transition-timing-function: ${buildBezierCss(point)};`;

  const curvePath = useMemo(() => {
    if (hasError) return '';
    const steps = 40;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const { x, y } = bezierPointAt(point, t);
      const sx = toSvgX(x);
      const sy = toSvgY(y);
      d += i === 0 ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`;
    }
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x1, y1, x2, y2, hasError]);

  function applyPreset(label: string) {
    const preset = BEZIER_PRESETS.find((p) => p.label === label);
    if (!preset) return;
    if (preset.points) {
      setIsLinear(false);
      setX1(String(preset.points.x1));
      setY1(String(preset.points.y1));
      setX2(String(preset.points.x2));
      setY2(String(preset.points.y2));
    } else {
      setIsLinear(true);
    }
  }

  function replay() {
    if (reducedMotion) return; // guard: never trigger a motion animation when the user prefers reduced motion
    setAnimating(false);
    setReplayKey((k) => k + 1);
    requestAnimationFrame(() => setAnimating(true));
  }

  function copy() {
    copyToClipboard(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="control-row" style={{ marginBottom: 16 }}>
        {BEZIER_PRESETS.map((p) => (
          <button key={p.label} className="icon-btn" onClick={() => applyPreset(p.label)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Control points</span>
        </div>
        <div style={{ padding: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <label>
            x1 (0-1) <input className="mono" value={x1} onChange={(e) => { setIsLinear(false); setX1(e.target.value); }} style={{ width: 70, padding: '6px 8px' }} />
          </label>
          <label>
            y1 (overshoot OK) <input className="mono" value={y1} onChange={(e) => { setIsLinear(false); setY1(e.target.value); }} style={{ width: 70, padding: '6px 8px' }} />
          </label>
          <label>
            x2 (0-1) <input className="mono" value={x2} onChange={(e) => { setIsLinear(false); setX2(e.target.value); }} style={{ width: 70, padding: '6px 8px' }} />
          </label>
          <label>
            y2 (overshoot OK) <input className="mono" value={y2} onChange={(e) => { setIsLinear(false); setY2(e.target.value); }} style={{ width: 70, padding: '6px 8px' }} />
          </label>
        </div>
        {x1Error && <div className="status-line status-invalid">✗ x1 must be between 0 and 1.</div>}
        {x2Error && <div className="status-line status-invalid">✗ x2 must be between 0 and 1.</div>}
        {y1Error && <div className="status-line status-invalid">✗ y1 must be a finite number.</div>}
        {y2Error && <div className="status-line status-invalid">✗ y2 must be a finite number.</div>}
        <div className="status-line status-neutral">
          x1/x2 are clamped to the valid CSS range of 0-1 (and rejected outside it). y1/y2 are deliberately NOT
          restricted to 0-1 - values outside that range produce a valid, commonly-used &quot;overshoot&quot; or bounce
          curve. &quot;linear&quot; is not a cubic-bezier() form at all; it is its own keyword for a straight line.
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Curve graph</span>
        </div>
        <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
          <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} style={{ color: 'var(--text-primary)' }}>
            <rect x={PAD} y={PAD} width={SVG_SIZE - 2 * PAD} height={SVG_SIZE - 2 * PAD} fill="none" stroke="currentColor" opacity={0.2} />
            {!isLinear && !hasError && (
              <>
                <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(point.x1)} y2={toSvgY(point.y1)} stroke="#f97316" strokeWidth={1} />
                <line x1={toSvgX(1)} y1={toSvgY(1)} x2={toSvgX(point.x2)} y2={toSvgY(point.y2)} stroke="#f97316" strokeWidth={1} />
                <circle cx={toSvgX(point.x1)} cy={toSvgY(point.y1)} r={4} fill="#f97316" />
                <circle cx={toSvgX(point.x2)} cy={toSvgY(point.y2)} r={4} fill="#f97316" />
                <path d={curvePath} fill="none" stroke="#7c5cff" strokeWidth={2} />
              </>
            )}
            {isLinear && <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(1)} y2={toSvgY(1)} stroke="#7c5cff" strokeWidth={2} />}
            <circle cx={toSvgX(0)} cy={toSvgY(0)} r={3} fill="currentColor" />
            <circle cx={toSvgX(1)} cy={toSvgY(1)} r={3} fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Animated preview</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={replay} disabled={reducedMotion}>
              Replay
            </button>
          </div>
        </div>
        <div style={{ padding: 16, height: 56, position: 'relative' }}>
          {reducedMotion ? (
            <div className="status-line status-neutral">
              Your system preference &quot;prefers-reduced-motion&quot; is enabled, so the animated block preview is
              disabled here to respect it. The curve graph and generated CSS above are unaffected.
            </div>
          ) : (
            <div
              key={replayKey}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#7c5cff',
                transform: animating ? 'translateX(calc(100% + 200px))' : 'translateX(0)',
                transitionProperty: 'transform',
                transitionDuration: '1200ms',
                transitionTimingFunction: isLinear ? 'linear' : hasError ? 'ease' : buildBezierCss(point),
              }}
            />
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>CSS</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copy}>
              {copied ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
        </div>
        <pre className="output mono" style={{ whiteSpace: 'pre-wrap' }}>
          {css}
        </pre>
      </div>
    </div>
  );
}
