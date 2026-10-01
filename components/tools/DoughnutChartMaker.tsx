'use client';

import { useMemo, useState } from 'react';
import { computeDoughnutSegments, clampHoleSize, defaultSegmentColor, type DoughnutRow } from '@/lib/tools/doughnut-chart';

const SIZE = 280;
const CENTER = SIZE / 2;
const STROKE_RADIUS = SIZE / 2 - 10;

const DEFAULT_ROWS: DoughnutRow[] = [
  { label: 'Desktop', value: '55' },
  { label: 'Mobile', value: '35' },
  { label: 'Tablet', value: '10' },
];

export default function DoughnutChartMaker() {
  const [rows, setRows] = useState<DoughnutRow[]>(DEFAULT_ROWS);
  const [holeInput, setHoleInput] = useState('60');
  const [colors, setColors] = useState<Record<number, string>>({});

  const holeSize = clampHoleSize(Number(holeInput) || 60);
  const { segments, total, isEmpty, hasInvalid } = useMemo(() => computeDoughnutSegments(rows), [rows]);

  function updateRow(i: number, field: 'label' | 'value', val: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { label: `Item ${prev.length + 1}`, value: '0' }]);
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
    setColors((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const idx = Number(k);
        if (idx < i) next[idx] = v;
        else if (idx > i) next[idx - 1] = v;
      });
      return next;
    });
  }
  function colorFor(i: number) {
    return colors[i] ?? defaultSegmentColor(i);
  }

  const innerRadiusFraction = holeSize / 100;
  const strokeWidth = STROKE_RADIUS * (1 - innerRadiusFraction);
  const ringCircumference = 2 * Math.PI * (STROKE_RADIUS - strokeWidth / 2 + 1e-9);

  function downloadSvg() {
    const svg = document.getElementById('doughnut-chart-svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([`<?xml version="1.0" standalone="no"?>\n${source}`], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'doughnut-chart.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Data rows</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={addRow}>
              Add row
            </button>
          </div>
        </div>
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((row, i) => (
            <div key={i} className="control-row">
              <input type="color" value={colorFor(i)} onChange={(e) => setColors((p) => ({ ...p, [i]: e.target.value }))} style={{ width: 32, height: 32, padding: 0 }} />
              <input
                type="text"
                className="mono"
                value={row.label}
                onChange={(e) => updateRow(i, 'label', e.target.value)}
                placeholder="Label"
                style={{ padding: '4px 8px', width: 140 }}
              />
              <input
                type="text"
                inputMode="decimal"
                className="mono"
                value={row.value}
                onChange={(e) => updateRow(i, 'value', e.target.value)}
                placeholder="Value"
                style={{ padding: '4px 8px', width: 100 }}
              />
              <button className="icon-btn" onClick={() => removeRow(i)}>
                Remove
              </button>
            </div>
          ))}
        </div>
        {hasInvalid && (
          <div className="status-line status-invalid">
            ✗ Non-numeric, negative, or non-finite values are treated as zero in the chart.
          </div>
        )}
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Hole size</span>
        </div>
        <div style={{ padding: 12 }}>
          <label>
            Hole size (40-80%){' '}
            <input
              type="range"
              min={40}
              max={80}
              value={holeSize}
              onChange={(e) => setHoleInput(e.target.value)}
              style={{ verticalAlign: 'middle' }}
            />{' '}
            <span className="mono">{holeSize}%</span>
          </label>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Chart preview</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={downloadSvg} disabled={isEmpty}>
              Download SVG
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
          {isEmpty ? (
            <div className="status-line status-neutral">
              All values are zero (or invalid) - enter at least one positive value to render the chart.
            </div>
          ) : (
            <svg id="doughnut-chart-svg" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Doughnut chart">
              <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
                {segments.map((seg, i) => {
                  const segLength = (seg.percentage / 100) * ringCircumference;
                  const offset = (seg.startAngle / 360) * ringCircumference;
                  return (
                    <circle
                      key={i}
                      cx={CENTER}
                      cy={CENTER}
                      r={STROKE_RADIUS - strokeWidth / 2}
                      fill="none"
                      stroke={colorFor(i)}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${segLength} ${ringCircumference - segLength}`}
                      strokeDashoffset={-offset}
                    />
                  );
                })}
              </g>
            </svg>
          )}

          {!isEmpty && (
            <ul className="mono" style={{ listStyle: 'none', padding: 0, margin: 0 }} aria-label="Chart legend">
              {segments.map((seg, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 12, height: 12, background: colorFor(i), display: 'inline-block', borderRadius: 2 }} />
                  <span>
                    {seg.label}: {seg.value} ({seg.percentage.toFixed(1)}%)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Data table (accessible summary)</span>
        </div>
        <table className="mono" style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 12px' }}>Label</th>
              <th style={{ textAlign: 'right', padding: '4px 12px' }}>Value</th>
              <th style={{ textAlign: 'right', padding: '4px 12px' }}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {isEmpty
              ? rows.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '4px 12px' }}>{row.label}</td>
                    <td style={{ textAlign: 'right', padding: '4px 12px' }}>0</td>
                    <td style={{ textAlign: 'right', padding: '4px 12px' }}>0%</td>
                  </tr>
                ))
              : segments.map((seg, i) => (
                  <tr key={i}>
                    <td style={{ padding: '4px 12px' }}>{seg.label}</td>
                    <td style={{ textAlign: 'right', padding: '4px 12px' }}>{seg.value}</td>
                    <td style={{ textAlign: 'right', padding: '4px 12px' }}>{seg.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
          </tbody>
        </table>
        <div className="status-line status-neutral">Total: {total}</div>
      </div>
    </div>
  );
}
