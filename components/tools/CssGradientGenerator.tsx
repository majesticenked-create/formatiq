'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type GradientType = 'linear' | 'radial';

interface Stop {
  id: string;
  color: string;
  position: number; // 0-100
}

const INITIAL_STOPS: Stop[] = [
  { id: 's1', color: '#3B82F6', position: 0 },
  { id: 's2', color: '#8B5CF6', position: 100 },
];

let nextId = 3;
function makeId(): string {
  return `s${nextId++}`;
}

function clampPercent(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

function buildCss(type: GradientType, angle: number, stops: Stop[]): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const stopList = sorted.map((s) => `${s.color} ${s.position}%`).join(', ');
  if (type === 'radial') return `radial-gradient(circle, ${stopList})`;
  return `linear-gradient(${angle}deg, ${stopList})`;
}

export default function CssGradientGenerator() {
  const [type, setType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<Stop[]>(INITIAL_STOPS);
  const [copied, setCopied] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingId = useRef<string | null>(null);

  const gradientCss = useMemo(() => buildCss(type, angle, stops), [type, angle, stops]);
  const cssRule = `background: ${gradientCss};`;

  function updateStopPosition(id: string, clientX: number) {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const position = clampPercent(ratio * 100);
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, position } : s)));
  }

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!draggingId.current) return;
    updateStopPosition(draggingId.current, e.clientX);
  }, []);

  const handlePointerUp = useCallback(() => {
    draggingId.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  function startDrag(id: string) {
    draggingId.current = id;
  }

  function addStopAt(clientX: number) {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const position = clampPercent(ratio * 100);
    setStops((prev) => [...prev, { id: makeId(), color: '#22D3EE', position }]);
  }

  function removeStop(id: string) {
    setStops((prev) => (prev.length <= 2 ? prev : prev.filter((s) => s.id !== id)));
  }

  function updateStopColor(id: string, color: string) {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)));
  }

  function copyCss() {
    navigator.clipboard.writeText(cssRule);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn${type === 'linear' ? ' is-active' : ''}`} onClick={() => setType('linear')}>
          Linear
        </button>
        <button className={`icon-btn${type === 'radial' ? ' is-active' : ''}`} onClick={() => setType('radial')}>
          Radial
        </button>
        {type === 'linear' && (
          <>
            <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Angle:
            </label>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              style={{ width: 140 }}
            />
            <span className="mono" style={{ fontSize: 13, width: 40 }}>
              {angle}°
            </span>
          </>
        )}
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Preview</span>
        </div>
        <div style={{ height: 160, background: gradientCss }} />
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>Color stops</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => addStopAt(trackRef.current!.getBoundingClientRect().left + trackRef.current!.getBoundingClientRect().width / 2)}>
              Add stop
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 12px 28px' }}>
          <div
            ref={trackRef}
            onClick={(e) => addStopAt(e.clientX)}
            style={{
              position: 'relative',
              height: 28,
              borderRadius: 6,
              background: buildCss('linear', 90, stops),
              border: '1px solid var(--border)',
              cursor: 'copy',
            }}
          >
            {stops.map((stop) => (
              // Outer div is the actual draggable hit area (44px, invisible) so the
              // touch target isn't tied 1:1 to the visible dot size below it - the
              // inner span is what's actually painted.
              <div
                key={stop.id}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startDrag(stop.id);
                }}
                onClick={(e) => e.stopPropagation()}
                title={`${stop.color} at ${stop.position}%`}
                style={{
                  position: 'absolute',
                  left: `${stop.position}%`,
                  top: '100%',
                  transform: 'translate(-50%, 0)',
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'grab',
                  touchAction: 'none',
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: stop.color,
                    border: '2px solid var(--surface)',
                    outline: '1px solid var(--border)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sortedStops.map((stop) => (
            <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStopColor(stop.id, e.target.value)}
                style={{ width: 32, height: 32, padding: 0, border: '1px solid var(--border)', borderRadius: 4, background: 'none' }}
              />
              <input
                type="text"
                value={stop.color}
                onChange={(e) => updateStopColor(stop.id, e.target.value)}
                className="mono"
                style={{
                  width: 100,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                  padding: '6px 8px',
                }}
              />
              <span className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', width: 48 }}>
                {stop.position}%
              </span>
              <button className="icon-btn" onClick={() => removeStop(stop.id)} disabled={stops.length <= 2}>
                Remove
              </button>
            </div>
          ))}
        </div>
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
