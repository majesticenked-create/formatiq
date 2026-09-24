'use client';

import { useMemo, useState } from 'react';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface Row {
  label: string;
  value: string;
}

const WIDTH = 640;
const HEIGHT = 400;
const MARGIN = { top: 40, right: 20, bottom: 60, left: 60 };

function buildSvg(rows: Row[], title: string, axisLabel: string, horizontal: boolean, validValues: number[]): string {
  const plotW = WIDTH - MARGIN.left - MARGIN.right;
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const max = Math.max(1, ...validValues);
  const n = rows.length || 1;

  let bars = '';
  let axisTicks = '';

  if (horizontal) {
    const bandHeight = plotH / n;
    rows.forEach((row, i) => {
      const value = validValues[i];
      const barW = (value / max) * plotW;
      const y = MARGIN.top + i * bandHeight + bandHeight * 0.15;
      const h = bandHeight * 0.7;
      bars += `<rect x="${MARGIN.left}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="#7c5cff" />`;
      bars += `<text x="${MARGIN.left - 8}" y="${(y + h / 2 + 4).toFixed(1)}" font-size="12" text-anchor="end" fill="currentColor">${escapeXml(row.label)}</text>`;
      bars += `<text x="${(MARGIN.left + barW + 6).toFixed(1)}" y="${(y + h / 2 + 4).toFixed(1)}" font-size="12" fill="currentColor">${escapeXml(String(value))}</text>`;
    });
  } else {
    const bandWidth = plotW / n;
    rows.forEach((row, i) => {
      const value = validValues[i];
      const barH = (value / max) * plotH;
      const x = MARGIN.left + i * bandWidth + bandWidth * 0.15;
      const w = bandWidth * 0.7;
      const y = MARGIN.top + (plotH - barH);
      bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${barH.toFixed(1)}" fill="#7c5cff" />`;
      bars += `<text x="${(x + w / 2).toFixed(1)}" y="${HEIGHT - MARGIN.bottom + 16}" font-size="12" text-anchor="middle" fill="currentColor">${escapeXml(row.label)}</text>`;
      bars += `<text x="${(x + w / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" font-size="12" text-anchor="middle" fill="currentColor">${escapeXml(String(value))}</text>`;
    });
  }

  axisTicks = `<line x1="${MARGIN.left}" y1="${MARGIN.top}" x2="${MARGIN.left}" y2="${HEIGHT - MARGIN.bottom}" stroke="currentColor" stroke-width="1" opacity="0.4" />` +
    `<line x1="${MARGIN.left}" y1="${HEIGHT - MARGIN.bottom}" x2="${WIDTH - MARGIN.right}" y2="${HEIGHT - MARGIN.bottom}" stroke="currentColor" stroke-width="1" opacity="0.4" />`;

  const titleEl = title
    ? `<text x="${WIDTH / 2}" y="20" font-size="16" font-weight="bold" text-anchor="middle" fill="currentColor">${escapeXml(title)}</text>`
    : '';
  const axisLabelEl = axisLabel
    ? `<text x="${WIDTH / 2}" y="${HEIGHT - 8}" font-size="12" text-anchor="middle" fill="currentColor">${escapeXml(axisLabel)}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${escapeXml(title || 'Bar chart')}">\n  ${titleEl}\n  ${axisTicks}\n  ${bars}\n  ${axisLabelEl}\n</svg>`;
}

const DEFAULT_ROWS: Row[] = [
  { label: 'Mon', value: '12' },
  { label: 'Tue', value: '19' },
  { label: 'Wed', value: '7' },
  { label: 'Thu', value: '15' },
];

export default function BarGraphMaker() {
  const [rows, setRows] = useState<Row[]>(DEFAULT_ROWS);
  const [title, setTitle] = useState('Weekly totals');
  const [axisLabel, setAxisLabel] = useState('Day');
  const [horizontal, setHorizontal] = useState(false);

  function updateRow(i: number, field: 'label' | 'value', val: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { label: `Item ${prev.length + 1}`, value: '0' }]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  const { validValues, hasNegative, hasInvalid } = useMemo(() => {
    let hasNegative = false;
    let hasInvalid = false;
    const values = rows.map((r) => {
      const n = Number(r.value);
      if (Number.isNaN(n)) {
        hasInvalid = true;
        return 0;
      }
      if (n < 0) {
        hasNegative = true;
        return 0;
      }
      return n;
    });
    return { validValues: values, hasNegative, hasInvalid };
  }, [rows]);

  const svgMarkup = useMemo(
    () => buildSvg(rows, title, axisLabel, horizontal, validValues),
    [rows, title, axisLabel, horizontal, validValues]
  );

  function download() {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bar-chart.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panel-bar">
          <span>Chart settings</span>
        </div>
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="text"
            className="mono"
            placeholder="Chart title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: '6px 8px' }}
          />
          <input
            type="text"
            className="mono"
            placeholder="Axis label"
            value={axisLabel}
            onChange={(e) => setAxisLabel(e.target.value)}
            style={{ padding: '6px 8px' }}
          />
          <div className="control-row">
            <button className={`icon-btn${!horizontal ? ' is-active' : ''}`} onClick={() => setHorizontal(false)}>
              Vertical bars
            </button>
            <button className={`icon-btn${horizontal ? ' is-active' : ''}`} onClick={() => setHorizontal(true)}>
              Horizontal bars
            </button>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
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
        {(hasNegative || hasInvalid) && (
          <div className="status-line status-invalid">
            {hasNegative && '✗ Negative values are treated as zero in the chart (this tool renders non-negative bars from a zero baseline). '}
            {hasInvalid && '✗ Non-numeric values are treated as zero.'}
          </div>
        )}
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panel-bar">
          <span>Chart preview</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={download}>
              Download SVG
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16, overflowX: 'auto' }}>
          <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ color: 'var(--text-primary)' }}>
            {title && (
              <text x={WIDTH / 2} y={20} fontSize={16} fontWeight="bold" textAnchor="middle" fill="currentColor">
                {title}
              </text>
            )}
            <line x1={MARGIN.left} y1={MARGIN.top} x2={MARGIN.left} y2={HEIGHT - MARGIN.bottom} stroke="currentColor" strokeWidth={1} opacity={0.4} />
            <line x1={MARGIN.left} y1={HEIGHT - MARGIN.bottom} x2={WIDTH - MARGIN.right} y2={HEIGHT - MARGIN.bottom} stroke="currentColor" strokeWidth={1} opacity={0.4} />
            {(() => {
              const plotW = WIDTH - MARGIN.left - MARGIN.right;
              const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
              const max = Math.max(1, ...validValues);
              const n = rows.length || 1;
              if (horizontal) {
                const bandHeight = plotH / n;
                return rows.map((row, i) => {
                  const value = validValues[i];
                  const barW = (value / max) * plotW;
                  const y = MARGIN.top + i * bandHeight + bandHeight * 0.15;
                  const h = bandHeight * 0.7;
                  return (
                    <g key={i}>
                      <rect x={MARGIN.left} y={y} width={barW} height={h} fill="#7c5cff" />
                      <text x={MARGIN.left - 8} y={y + h / 2 + 4} fontSize={12} textAnchor="end" fill="currentColor">
                        {row.label}
                      </text>
                      <text x={MARGIN.left + barW + 6} y={y + h / 2 + 4} fontSize={12} fill="currentColor">
                        {value}
                      </text>
                    </g>
                  );
                });
              }
              const bandWidth = plotW / n;
              return rows.map((row, i) => {
                const value = validValues[i];
                const barH = (value / max) * plotH;
                const x = MARGIN.left + i * bandWidth + bandWidth * 0.15;
                const w = bandWidth * 0.7;
                const y = MARGIN.top + (plotH - barH);
                return (
                  <g key={i}>
                    <rect x={x} y={y} width={w} height={barH} fill="#7c5cff" />
                    <text x={x + w / 2} y={HEIGHT - MARGIN.bottom + 16} fontSize={12} textAnchor="middle" fill="currentColor">
                      {row.label}
                    </text>
                    <text x={x + w / 2} y={y - 6} fontSize={12} textAnchor="middle" fill="currentColor">
                      {value}
                    </text>
                  </g>
                );
              });
            })()}
            {axisLabel && (
              <text x={WIDTH / 2} y={HEIGHT - 8} fontSize={12} textAnchor="middle" fill="currentColor">
                {axisLabel}
              </text>
            )}
          </svg>
        </div>
        <table className="mono" style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }} aria-label="Chart data table">
          <caption style={{ textAlign: 'left', padding: '4px 12px', color: 'var(--text-secondary)' }}>
            Accessible data table (same values as the chart above)
          </caption>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 12px' }}>{axisLabel || 'Label'}</th>
              <th style={{ textAlign: 'right', padding: '4px 12px' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: '4px 12px' }}>{row.label}</td>
                <td style={{ textAlign: 'right', padding: '4px 12px' }}>{validValues[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>SVG markup</span>
        </div>
        <textarea className="mono" value={svgMarkup} readOnly spellCheck={false} />
      </div>
    </div>
  );
}
